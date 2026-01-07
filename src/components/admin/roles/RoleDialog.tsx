import { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Role, AccessLevel } from "@/types/role";
import { useLocale } from "@/contexts/LocaleContext";
import { Skeleton } from "@/components/ui/skeleton";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100),
  accessLevelId: z.string().min(1, "Access level is required"),
  permissions: z.array(z.string()),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  role?: Role;
  isSubmitting?: boolean;
  accessLevels: AccessLevel[];
  permissionsList: string[];
  isLoadingAccessLevels?: boolean;
  isLoadingPermissions?: boolean;
}

// Helper to group permissions by module
const groupPermissionsByModule = (permissions: string[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  permissions.forEach((permission) => {
    // Handle both "module:action" and "module.action" formats
    const separatorIndex = Math.max(permission.indexOf(":"), permission.indexOf("."));
    const module = separatorIndex > 0 ? permission.substring(0, separatorIndex) : "other";
    
    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(permission);
  });
  
  return grouped;
};

// Helper to format module name for display
const formatModuleName = (module: string): string => {
  return module
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
};

export function RoleDialog({
  open,
  onClose,
  onSubmit,
  role,
  isSubmitting = false,
  accessLevels,
  permissionsList,
  isLoadingAccessLevels = false,
  isLoadingPermissions = false,
}: RoleDialogProps) {
  const { t } = useLocale();
  const isEditing = !!role;

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      accessLevelId: "",
      permissions: [],
    },
  });

  const selectedPermissions = form.watch("permissions");

  // Group permissions by module
  const groupedPermissions = useMemo(
    () => groupPermissionsByModule(permissionsList),
    [permissionsList]
  );

  // Reset form when dialog opens/closes or role changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: role?.name || "",
        accessLevelId: role?.accessLevelId || "",
        permissions: role?.permissions || [],
      });
    }
  }, [open, role, form]);

  const handleSubmit = async (data: RoleFormData) => {
    await onSubmit(data);
    form.reset();
  };

  const handleSelectAll = () => {
    form.setValue("permissions", [...permissionsList]);
  };

  const handleDeselectAll = () => {
    form.setValue("permissions", []);
  };

  const togglePermission = (permission: string) => {
    const current = form.getValues("permissions");
    if (current.includes(permission)) {
      form.setValue(
        "permissions",
        current.filter((p) => p !== permission)
      );
    } else {
      form.setValue("permissions", [...current, permission]);
    }
  };

  const allSelected = selectedPermissions.length === permissionsList.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("role.edit") : t("role.create")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("role.editDescription")
              : t("role.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 gap-4 overflow-hidden"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("role.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Traffic Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessLevelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("role.accessLevel")}</FormLabel>
                    {isLoadingAccessLevels ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("role.selectAccessLevel")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accessLevels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Permissions Section */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <FormLabel>{t("role.permissions")}</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={allSelected ? handleDeselectAll : handleSelectAll}
                    disabled={isLoadingPermissions}
                  >
                    {allSelected ? t("role.deselectAll") : t("role.selectAll")}
                  </Button>
                </div>
              </div>

              {isLoadingPermissions ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="flex-1 border rounded-md p-3">
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([module, permissions]) => (
                      <div key={module} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground capitalize">
                          {formatModuleName(module)}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                          {permissions.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={permission}
                                checked={selectedPermissions.includes(permission)}
                                onCheckedChange={() => togglePermission(permission)}
                              />
                              <label
                                htmlFor={permission}
                                className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {permissionsList.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t("role.noPermissionsAvailable")}
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {t("role.permissionsHint")} ({selectedPermissions.length}/{permissionsList.length})
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("common.saving")
                  : isEditing
                  ? t("common.save")
                  : t("role.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
