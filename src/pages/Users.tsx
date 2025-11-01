import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users, Building, Briefcase, UserCog } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersManagement } from "@/components/admin/users/UsersManagement";
import { DepartmentsManagement } from "@/components/admin/departments/DepartmentsManagement";
import { RolesManagement } from "@/components/admin/roles/RolesManagement";
import { PositionsManagement } from "@/components/admin/positions/PositionsManagement";
import { useLocale } from "@/contexts/LocaleContext";

export default function AdminDashboard() {
  const { isAdmin } = usePermissions();
  const { t } = useLocale();

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("admin.noPermission")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AdminLayout
      title={t("admin.title")}
      description={t("admin.description")}
    >
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            {t("admin.users")}
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Building className="w-4 h-4" />
            {t("admin.departments")}
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <UserCog className="w-4 h-4" />
            {t("admin.roles")}
          </TabsTrigger>
          <TabsTrigger value="positions" className="gap-2">
            <Briefcase className="w-4 h-4" />
            {t("admin.positions")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="departments" className="mt-0">
          <DepartmentsManagement />
        </TabsContent>

        <TabsContent value="roles" className="mt-0">
          <RolesManagement />
        </TabsContent>

        <TabsContent value="positions" className="mt-0">
          <PositionsManagement />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
