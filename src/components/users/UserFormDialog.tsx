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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, CreateUserDto, UpdateUserDto } from "@/types/user";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { usePositions } from "@/hooks/usePositions";

const userSchema = z.object({
  aadId: z.string().min(1, "Azure AD ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  departmentId: z.string().min(1, "Department is required"),
  positionId: z.string().min(1, "Position is required"),
  roleIds: z.array(z.string()).min(1, "At least one role is required"),
  phone: z.string().optional(),
  phoneVerified: z.boolean().optional(),
  firstAccess: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
  user?: User;
  isSubmitting?: boolean;
}

export function UserFormDialog({
  open,
  onClose,
  onSubmit,
  user,
  isSubmitting = false,
}: UserFormDialogProps) {
  const isEditing = !!user;
  const { departments, isLoading: deptLoading } = useDepartments();
  const { roles, isLoading: rolesLoading } = useRoles();
  const { positions, isLoading: positionsLoading } = usePositions();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      aadId: "",
      name: "",
      email: "",
      departmentId: "",
      positionId: "",
      roleIds: [],
      phone: "",
      phoneVerified: false,
      firstAccess: true,
    },
  });

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      form.reset({
        aadId: user?.aadId || "",
        name: user?.name || "",
        email: user?.email || "",
        departmentId: user?.departmentId || "",
        positionId: user?.positionId || "",
        roleIds: user?.roleIds || [],
        phone: user?.phone || "",
        phoneVerified: user?.phoneVerified || false,
        firstAccess: user?.firstAccess ?? true,
      });
    }
  }, [open, user, form]);

  const handleSubmit = async (data: UserFormData) => {
    const submitData: CreateUserDto | UpdateUserDto = {
      aadId: data.aadId,
      name: data.name,
      email: data.email,
      departmentId: data.departmentId,
      positionId: data.positionId,
      roleIds: data.roleIds,
      phone: data.phone || null,
      phoneVerified: data.phoneVerified,
      firstAccess: data.firstAccess,
    };

    await onSubmit(submitData);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user's information below."
              : "Fill in the details to create a new user account."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="aadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Azure AD ID <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e8d1d1fe-..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Department <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={deptLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover z-50">
                      {departments.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No departments available
                        </div>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Position <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={positionsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover z-50 max-h-[300px]">
                      {positions.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No positions available
                        </div>
                      ) : (
                        positions.map((pos) => {
                          const dept = departments.find(
                            (d) => d.id === pos.departmentId,
                          );
                          const role = roles.find((r) => r.id === pos.roleId);
                          return (
                            <SelectItem key={pos.id} value={pos.id}>
                              {pos.name}
                              {dept && role && (
                                <span className="text-muted-foreground ml-2">
                                  ({dept.name} - {role.name})
                                </span>
                              )}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Roles <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="border rounded-md p-3 bg-background space-y-2 max-h-[200px] overflow-y-auto">
                    {roles.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No roles available
                      </div>
                    ) : (
                      roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={field.value?.includes(role.id)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, role.id]);
                              } else {
                                field.onChange(
                                  currentValue.filter((id) => id !== role.id),
                                );
                              }
                            }}
                            disabled={rolesLoading}
                          />
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {role.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 123 4567" {...field} />
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
