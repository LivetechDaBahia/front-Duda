import { Role, AccessLevel } from "@/types/role";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleListProps {
  roles: Role[];
  accessLevels: AccessLevel[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  isLoading?: boolean;
}

const getAccessLevelVariant = (
  levelValue: string,
): "default" | "secondary" | "outline" => {
  if (levelValue === "4") return "default"; // Administrator
  if (levelValue === "3") return "secondary"; // Manager
  return "outline";
};

export function RoleList({
  roles,
  accessLevels,
  onEdit,
  onDelete,
  isLoading = false,
}: RoleListProps) {
  const { isAdmin } = usePermissions();
  const { t } = useLocale();

  // Helper to get access level name from ID
  const getAccessLevelName = (accessLevelId: string): string => {
    const level = accessLevels.find((l) => l.id === accessLevelId);
    return level?.name || accessLevelId;
  };

  // Helper to get access level value for styling
  const getAccessLevelValue = (accessLevelId: string): string => {
    const level = accessLevels.find((l) => l.id === accessLevelId);
    return level?.value || "1";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">{t("role.loading")}</p>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">{t("role.noRoles")}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("role.name")}</TableHead>
          <TableHead>{t("role.accessLevel")}</TableHead>
          <TableHead>{t("role.permissions")}</TableHead>
          {isAdmin && (
            <TableHead className="w-[100px]">{t("table.actions")}</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell>
              <Badge
                variant={getAccessLevelVariant(
                  getAccessLevelValue(role.accessLevelId),
                )}
              >
                {getAccessLevelName(role.accessLevelId)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1 max-w-md">
                {role.permissions && role.permissions.length > 0 ? (
                  <>
                    {role.permissions.slice(0, 3).map((permission) => (
                      <Badge
                        key={permission}
                        variant="outline"
                        className="text-xs"
                      >
                        {permission}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="text-xs cursor-help"
                            >
                              +{role.permissions.length - 3}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(3).map((permission) => (
                                <Badge
                                  key={permission}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    {t("role.noPermissions")}
                  </span>
                )}
              </div>
            </TableCell>
            {isAdmin && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(role)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
