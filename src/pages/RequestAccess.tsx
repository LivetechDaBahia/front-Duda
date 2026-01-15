import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import { ComboboxWithCustom } from "@/components/shared/ComboboxWithCustom";
import { usePublicDepartments } from "@/hooks/usePublicDepartments";
import { usePublicPositions } from "@/hooks/usePublicPositions";
import { accessRequestService } from "@/services/accessRequestService";
import { UserPlus, ArrowLeft, CheckCircle } from "lucide-react";

const OTHER_VALUE = "__OTHER__";

const accessRequestSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  supervisorName: z
    .string()
    .trim()
    .min(1, { message: "Supervisor name is required" })
    .max(100),
});

type AccessRequestFormValues = z.infer<typeof accessRequestSchema>;

export default function RequestAccess() {
  const { t } = useLocale();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Department state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);
  const [customDepartment, setCustomDepartment] = useState("");

  // Position state
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null
  );
  const [customPosition, setCustomPosition] = useState("");

  // Fetch departments and positions
  const { data: departments = [], isLoading: isLoadingDepartments } =
    usePublicDepartments();
  const { data: positions = [], isLoading: isLoadingPositions } =
    usePublicPositions(
      selectedDepartmentId && selectedDepartmentId !== OTHER_VALUE
        ? selectedDepartmentId
        : undefined
    );

  const form = useForm<AccessRequestFormValues>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      email: "",
      supervisorName: "",
    },
  });

  // Handle department change
  const handleDepartmentChange = (value: string | null) => {
    setSelectedDepartmentId(value);
    // Reset position when department changes
    setSelectedPositionId(null);
    setCustomPosition("");
  };

  // Validate department and position selections
  const validateSelections = (): boolean => {
    if (!selectedDepartmentId) {
      toast({
        title: t("accessRequest.error.departmentRequired"),
        variant: "destructive",
      });
      return false;
    }

    if (selectedDepartmentId === OTHER_VALUE && !customDepartment.trim()) {
      toast({
        title: t("accessRequest.error.customDepartmentRequired"),
        variant: "destructive",
      });
      return false;
    }

    if (!selectedPositionId) {
      toast({
        title: t("accessRequest.error.positionRequired"),
        variant: "destructive",
      });
      return false;
    }

    if (selectedPositionId === OTHER_VALUE && !customPosition.trim()) {
      toast({
        title: t("accessRequest.error.customPositionRequired"),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const onSubmit = async (data: AccessRequestFormValues) => {
    if (!validateSelections()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        email: data.email,
        supervisorName: data.supervisorName,
        ...(selectedDepartmentId === OTHER_VALUE
          ? { departmentName: customDepartment.trim() }
          : { departmentId: selectedDepartmentId }),
        ...(selectedPositionId === OTHER_VALUE
          ? { positionName: customPosition.trim() }
          : { positionId: selectedPositionId }),
      };

      await accessRequestService.submitAccessRequest(payload);

      setIsSuccess(true);
      toast({
        title: t("accessRequest.success"),
        description: t("accessRequest.successMessage"),
      });
    } catch (error) {
      console.error("Failed to submit access request:", error);
      toast({
        title: t("accessRequest.error.submitFailed"),
        description:
          error instanceof Error
            ? error.message
            : t("accessRequest.error.generic"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl">
                {t("accessRequest.success")}
              </CardTitle>
              <CardDescription>
                {t("accessRequest.successMessage")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("accessRequest.backToLogin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));

  const positionOptions = positions.map((pos) => ({
    value: pos.id,
    label: pos.name,
  }));

  return (
    <div className="flex min-h-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl">
              {t("accessRequest.title")}
            </CardTitle>
            <CardDescription>{t("accessRequest.subtitle")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accessRequest.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("accessRequest.emailPlaceholder")}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <div className="space-y-2">
                <FormLabel>{t("accessRequest.department")}</FormLabel>
                <ComboboxWithCustom
                  options={departmentOptions}
                  value={selectedDepartmentId}
                  customValue={customDepartment}
                  onValueChange={handleDepartmentChange}
                  onCustomValueChange={setCustomDepartment}
                  placeholder={t("accessRequest.selectDepartment")}
                  searchPlaceholder={t("accessRequest.searchDepartment")}
                  emptyMessage={t("accessRequest.noDepartments")}
                  customInputPlaceholder={t("accessRequest.customDepartment")}
                  disabled={isSubmitting}
                  isLoading={isLoadingDepartments}
                />
              </div>

              {/* Position */}
              <div className="space-y-2">
                <FormLabel>{t("accessRequest.position")}</FormLabel>
                <ComboboxWithCustom
                  options={positionOptions}
                  value={selectedPositionId}
                  customValue={customPosition}
                  onValueChange={setSelectedPositionId}
                  onCustomValueChange={setCustomPosition}
                  placeholder={t("accessRequest.selectPosition")}
                  searchPlaceholder={t("accessRequest.searchPosition")}
                  emptyMessage={t("accessRequest.noPositions")}
                  customInputPlaceholder={t("accessRequest.customPosition")}
                  disabled={
                    isSubmitting ||
                    (!selectedDepartmentId ||
                      (selectedDepartmentId !== OTHER_VALUE &&
                        isLoadingPositions))
                  }
                  isLoading={
                    selectedDepartmentId !== OTHER_VALUE && isLoadingPositions
                  }
                />
              </div>

              {/* Supervisor Name */}
              <FormField
                control={form.control}
                name="supervisorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accessRequest.supervisorName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "accessRequest.supervisorNamePlaceholder"
                        )}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? t("accessRequest.submitting")
                  : t("accessRequest.submit")}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              {t("accessRequest.backToLogin")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
