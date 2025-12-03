import { useAuth } from "@/contexts/AuthContext";

type Level = "Viewer" | "Editor" | "Manager" | "Administrator";

const LEVEL_RANK: Record<Level, number> = {
  Viewer: 1,
  Editor: 2,
  Manager: 3,
  Administrator: 4,
};

export const usePermissions = () => {
  const { user } = useAuth();

  // Map permission string to minimum level required
  const getRequiredLevel = (permission: string): number => {
    const perm = permission.toLowerCase();

    // Read permissions require Viewer
    if (perm.endsWith(":read") || perm.endsWith(".read")) {
      return LEVEL_RANK.Viewer;
    }

    // Write/update/create permissions require Editor
    if (
      perm.endsWith(":update") ||
      perm.endsWith(":write") ||
      perm.endsWith(":create") ||
      perm.endsWith(":approve") ||
      perm.endsWith(":reject")
    ) {
      return LEVEL_RANK.Editor;
    }

    // Delete permissions require Administrator
    if (perm.endsWith(":delete") || perm.endsWith(".delete")) {
      return LEVEL_RANK.Administrator;
    }

    return 0;
  };

  // Check if user has a specific permission
  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;

    const userPermissions = user.permissions || [];
    const userLevel = user.level;

    // Direct permission match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check by level
    if (userLevel && Object.keys(LEVEL_RANK).includes(userLevel)) {
      const userLevelRank = LEVEL_RANK[userLevel as Level];
      const requiredLevelRank = getRequiredLevel(requiredPermission);
      return userLevelRank >= requiredLevelRank;
    }

    return false;
  };

  // Check if user has minimum level
  const hasMinimumLevel = (minimumLevel: Level): boolean => {
    if (!user?.level) return false;

    const userLevel = user.level as Level;
    if (!Object.keys(LEVEL_RANK).includes(userLevel)) return false;

    return LEVEL_RANK[userLevel] >= LEVEL_RANK[minimumLevel];
  };

  // Check if user can view and update purchase orders
  const canManagePurchaseOrders = (): boolean => {
    return (
      hasPermission("purchase_orders:read") &&
      hasPermission("purchase_orders:update")
    );
  };

  // Check if user can view and update credit
  const canManageCredit = (): boolean => {
    return hasPermission("credit:read") && hasPermission("credit:update");
  };

  // Check if user is a credit manager (can assign to others and see all items)
  const isCreditManager = (): boolean => {
    return hasMinimumLevel("Manager") && canManageCredit();
  };

  // Check if user can impersonate other users
  const canImpersonate = (): boolean => {
    return (
      hasPermission("users:impersonate") || hasMinimumLevel("Administrator")
    );
  };

  return {
    hasPermission,
    hasMinimumLevel,
    isAdmin: hasMinimumLevel("Administrator"),
    canManageUsers: hasPermission("users:update") || hasMinimumLevel("Editor"),
    canDeleteUsers:
      hasPermission("users:delete") || hasMinimumLevel("Administrator"),
    canManagePurchaseOrders: canManagePurchaseOrders(),
    canManageCredit: canManageCredit(),
    isCreditManager: isCreditManager(),
    canImpersonate: canImpersonate(),
  };
};
