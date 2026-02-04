import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Bug,
  Home,
  Package,
  CreditCard,
  Users,
  Workflow,
  Sparkles,
} from "lucide-react";

interface PageAccess {
  name: string;
  path: string;
  icon: React.ElementType;
  hasAccess: boolean;
  reason: string;
}

export const PermissionsDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLocale();
  const {
    isAdmin,
    canViewPurchaseOrders,
    canManagePurchaseOrders,
    canViewCredit,
    canManageCredit,
    isCreditManager,
    canAssignCreditToOthers,
    canViewTrafficLight,
    canManageTrafficLight,
    canManageUsers,
    canImpersonate,
  } = usePermissions();

  if (!user) return null;

  const pageAccess: PageAccess[] = [
    {
      name: t("nav.home"),
      path: "/home",
      icon: Home,
      hasAccess: true,
      reason: "All authenticated users",
    },
    {
      name: t("nav.purchaseOrders"),
      path: "/purchase-orders",
      icon: Package,
      hasAccess: canViewPurchaseOrders,
      reason: canViewPurchaseOrders
        ? isAdmin
          ? "Administrator access"
          : "Has orders:read or purchase_orders:read permission"
        : "Missing orders:read or purchase_orders:read permission",
    },
    {
      name: t("nav.credit"),
      path: "/credit",
      icon: CreditCard,
      hasAccess: canViewCredit,
      reason: canViewCredit
        ? isAdmin
          ? "Administrator access"
          : "Has credits:read or flows:credit.read permission"
        : "Missing credits:read or flows:credit.read permission",
    },
    {
      name: t("nav.workflow"),
      path: "/workflow",
      icon: Workflow,
      hasAccess: canViewTrafficLight,
      reason: canViewTrafficLight
        ? isAdmin
          ? "Administrator access"
          : "Has trafficLights:read permission"
        : "Missing trafficLights:read permission",
    },
    {
      name: t("nav.users"),
      path: "/users",
      icon: Users,
      hasAccess: canManageUsers,
      reason: canManageUsers
        ? isAdmin
          ? "Administrator access"
          : "Has users:update permission or Editor+ level"
        : "Missing users:update permission",
    },
    {
      name: t("nav.aiAssistant"),
      path: "/ai-assistant",
      icon: Sparkles,
      hasAccess: true,
      reason: "All authenticated users",
    },
  ];

  const capabilities = [
    { name: "View Purchase Orders", value: canViewPurchaseOrders },
    { name: "Manage Purchase Orders", value: canManagePurchaseOrders },
    { name: "View Credit", value: canViewCredit },
    { name: "Manage Credit", value: canManageCredit },
    { name: "Credit Manager", value: isCreditManager },
    { name: "Assign Credit to Others", value: canAssignCreditToOthers },
    { name: "View Traffic Light", value: canViewTrafficLight },
    { name: "Manage Traffic Light", value: canManageTrafficLight },
    { name: "Manage Users", value: canManageUsers },
    { name: "Impersonate Users", value: canImpersonate },
    { name: "Administrator", value: isAdmin },
  ];

  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  Permissions Debug Panel
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* User Info */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User Info
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-medium">{user.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>{" "}
                  <Badge variant="outline" className="ml-1">
                    {user.role || "N/A"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Level:</span>{" "}
                  <Badge
                    variant={isAdmin ? "default" : "secondary"}
                    className="ml-1"
                  >
                    {user.level || "N/A"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Department:</span>{" "}
                  <span className="font-medium">{user.department || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Raw Permissions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Raw Permissions ({user.permissions?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1">
                {user.permissions?.length ? (
                  user.permissions.map((perm) => (
                    <Badge
                      key={perm}
                      variant="outline"
                      className="text-xs font-mono"
                    >
                      {perm}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No permissions assigned
                  </span>
                )}
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Computed Capabilities
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {capabilities.map(({ name, value }) => (
                  <div
                    key={name}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                      value
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {value ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Page Access */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Page Access
              </h4>
              <div className="space-y-1">
                {pageAccess.map(({ name, path, icon: Icon, hasAccess, reason }) => (
                  <div
                    key={path}
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      hasAccess
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({path})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {reason}
                      </span>
                      {hasAccess ? (
                        <Badge className="bg-green-600 hover:bg-green-700">
                          <Check className="h-3 w-3 mr-1" />
                          Access
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Denied
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
