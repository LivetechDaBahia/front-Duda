import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Phone, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useCountdown } from "@/hooks/useCountdown";
import {
  sendPhoneCode,
  verifyPhoneCode,
  maskPhone,
  formatCountdown,
  toDigits,
  type ApiError,
} from "@/services/phoneVerificationService";

const phoneSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        const digits = toDigits(val);
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: "Phone number must be 10-15 digits" }
    ),
});

const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Code must contain only numbers"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type CodeFormData = z.infer<typeof codeSchema>;

interface PhoneVerificationModalProps {
  open: boolean;
  onVerificationComplete: () => void;
}

export function PhoneVerificationModal({
  open,
  onVerificationComplete,
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const { t } = useLocale();

  const ttlCountdown = useCountdown();
  const cooldownCountdown = useCountdown();

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      name: user?.name || "",
      phone: "",
    },
  });

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const getErrorMessage = (error: ApiError): string => {
    if (error.status === 401) {
      return t("phoneVerification.error.unauthorized");
    }

    if (error.status === 400) {
      const errorCode = error.error;
      if (errorCode === "phone_required" || errorCode === "invalid_phone") {
        return t("phoneVerification.error.invalidPhone");
      }
      if (errorCode === "name_required") {
        return t("phoneVerification.error.nameRequired");
      }
      if (errorCode === "invalid_code_format") {
        return t("phoneVerification.error.invalidCodeFormat");
      }
      if (errorCode === "code_expired_or_not_found") {
        return t("phoneVerification.error.codeExpired");
      }
      if (errorCode === "invalid_code") {
        const attemptsMsg = error.attemptsLeft
          ? ` ${error.attemptsLeft} ${t("phoneVerification.error.attemptsLeft")}`
          : "";
        return t("phoneVerification.error.invalidCode") + attemptsMsg;
      }
    }

    if (error.status === 429) {
      const errorCode = error.error;
      if (errorCode === "cooldown" && error.retryAfter) {
        return t("phoneVerification.error.cooldown").replace(
          "{seconds}",
          error.retryAfter.toString()
        );
      }
      if (errorCode === "too_many_attempts") {
        return t("phoneVerification.error.tooManyAttempts");
      }
    }

    if (error.status === 502) {
      return t("phoneVerification.error.failedToSend");
    }

    return error.message || t("phoneVerification.error.generic");
  };

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      const response = await sendPhoneCode(data.phone, data.name);

      setPhoneNumber(data.phone);
      setUserName(data.name);
      setStep("code");

      // Start countdown timers
      ttlCountdown.start(response.ttl);
      cooldownCountdown.start(response.cooldown);

      toast({
        title: t("phoneVerification.codeSentTitle"),
        description: t("phoneVerification.codeSentDesc"),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("phoneVerification.error.sendFailed"),
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCodeSubmit = async (data: CodeFormData) => {
    setIsLoading(true);
    try {
      await verifyPhoneCode(phoneNumber, data.code);
      await refreshUser();

      toast({
        title: t("phoneVerification.success"),
        description: t("phoneVerification.successDesc"),
      });

      // Call the completion callback to close modal and update state
      onVerificationComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("phoneVerification.error.verifyFailed"),
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldownCountdown.isRunning) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendPhoneCode(phoneNumber, userName);

      // Reset countdown timers
      ttlCountdown.start(response.ttl);
      cooldownCountdown.start(response.cooldown);

      toast({
        title: t("phoneVerification.codeResentTitle"),
        description: t("phoneVerification.codeResentDesc"),
      });
    } catch (error: any) {
      const apiError = error as ApiError;

      // Handle cooldown error specially
      if (apiError.status === 429 && apiError.retryAfter) {
        cooldownCountdown.start(apiError.retryAfter);
      }

      toast({
        variant: "destructive",
        title: t("phoneVerification.error.resendFailed"),
        description: getErrorMessage(apiError),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
        hideClose={true}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {t("phoneVerification.title")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "phone"
              ? t("phoneVerification.subtitle")
              : t("phoneVerification.subtitleCode")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {step === "phone" ? (
            <Form {...phoneForm}>
              <form
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={phoneForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("phoneVerification.nameLabel")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder={t("phoneVerification.namePlaceholder")}
                            className="pl-10"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("phoneVerification.phoneLabel")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="+5511987654321"
                            className="pl-10"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {t("phoneVerification.phoneHelper")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? t("phoneVerification.sending")
                    : t("phoneVerification.sendButton")}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...codeForm}>
              <form
                onSubmit={codeForm.handleSubmit(onCodeSubmit)}
                className="space-y-4"
              >
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    {t("phoneVerification.codeSent")}
                  </p>
                  <p className="font-semibold">{maskPhone(phoneNumber)}</p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => {
                      setStep("phone");
                      codeForm.reset();
                      ttlCountdown.stop();
                      cooldownCountdown.stop();
                    }}
                  >
                    {t("phoneVerification.changePhone")}
                  </Button>
                </div>

                {ttlCountdown.seconds > 0 && (
                  <div className="text-sm text-center text-muted-foreground">
                    {t("phoneVerification.codeValid")}{" "}
                    <span className="font-semibold text-foreground">
                      {formatCountdown(ttlCountdown.seconds)}
                    </span>
                  </div>
                )}

                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("phoneVerification.codeLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                          autoFocus
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      t("phoneVerification.verifying")
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t("phoneVerification.verifyButton")}
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={isLoading || cooldownCountdown.isRunning}
                  >
                    {cooldownCountdown.isRunning
                      ? `${t("phoneVerification.resendIn")} ${formatCountdown(cooldownCountdown.seconds)}`
                      : t("phoneVerification.resendButton")}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {t("phoneVerification.footer")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
