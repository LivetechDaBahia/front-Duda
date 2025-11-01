import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Department } from "@/types/department";
import { useLocale } from "@/contexts/LocaleContext";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required").max(100),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  department?: Department;
  isSubmitting?: boolean;
}

export function DepartmentDialog({
  open,
  onClose,
  onSubmit,
  department,
  isSubmitting = false,
}: DepartmentDialogProps) {
  const { t } = useLocale();
  const isEditing = !!department;

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
    },
  });

  // Reset form when dialog opens/closes or department changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: department?.name || "",
      });
    }
  }, [open, department, form]);

  const handleSubmit = async (data: DepartmentFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("department.edit")
              : t("department.create")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the department information"
              : "Create a new department"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("department.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Finance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
