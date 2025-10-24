import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Enter a valid international phone number (e.g., +1234567890)",
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

export default function PhoneVerification() {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/send-verification-code", {
        phone: data.phone,
      });

      setPhoneNumber(data.phone);
      setStep("code");

      toast({
        title: "Verification code sent",
        description: "Check your WhatsApp for the verification code",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send code",
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCodeSubmit = async (data: CodeFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/verify-phone", {
        phone: phoneNumber,
        code: data.code,
      });

      await refreshUser();

      toast({
        title: "Phone verified successfully",
        description: "You can now receive WhatsApp notifications",
      });

      navigate("/purchase-orders");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Invalid code. Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/send-verification-code", {
        phone: phoneNumber,
      });

      toast({
        title: "Code resent",
        description: "Check your WhatsApp for a new code",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
          <p className="text-muted-foreground">
            {step === "phone"
              ? "Let's set up WhatsApp notifications for your purchase orders"
              : "Enter the verification code sent to your WhatsApp"}
          </p>
        </div>

        <div className="bg-card border rounded-lg shadow-lg p-6 space-y-6">
          {step === "phone" ? (
            <Form {...phoneForm}>
              <form
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="+1234567890"
                            className="pl-10"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Include country code (e.g., +1 for US, +55 for Brazil)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Verification Code"}
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
                  <p className="text-sm text-muted-foreground">Code sent to:</p>
                  <p className="font-semibold">{phoneNumber}</p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => {
                      setStep("phone");
                      codeForm.reset();
                    }}
                  >
                    Change number
                  </Button>
                </div>

                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
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
                      "Verifying..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Verify Phone Number
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    Resend Code
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          You'll receive important notifications about your purchase orders
        </p>
      </div>
    </div>
  );
}
