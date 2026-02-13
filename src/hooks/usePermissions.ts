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

  // Check if user has a specific permission (with level-based fallback for generic permissions)
  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;

    const userPermissions = user.permissions || [];
    const userLevel = user.level;

    // Direct permission match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check by level (for generic/admin permissions)
    if (userLevel && Object.keys(LEVEL_RANK).includes(userLevel)) {
      const userLevelRank = LEVEL_RANK[userLevel as Level];
      const requiredLevelRank = getRequiredLevel(requiredPermission);
      return userLevelRank >= requiredLevelRank;
    }

    return false;
  };

  // Check if user has explicit permission (NO level-based fallback)
  // Use this for feature-specific access control
  const hasExplicitPermission = (...permissions: string[]): boolean => {
    if (!user) return false;
    const userPermissions = user.permissions || [];
    return permissions.some((perm) => userPermissions.includes(perm));
  };

  // Check if user is admin (full access to everything)
  const isAdmin = (): boolean => {
    return hasMinimumLevel("Administrator");
  };

  // Check if user has minimum level
  const hasMinimumLevel = (minimumLevel: Level): boolean => {
    if (!user?.level) return false;

    const userLevel = user.level as Level;
    if (!Object.keys(LEVEL_RANK).includes(userLevel)) return false;

    return LEVEL_RANK[userLevel] >= LEVEL_RANK[minimumLevel];
  };

  // Check if user can view purchase orders (explicit permission OR admin)
  const canViewPurchaseOrders = (): boolean => {
    if (isAdmin()) return true;
    return hasExplicitPermission(
      "purchase_orders:read",
      "purchase_orders.read",
      "purchaseOrders:read",
      "purchaseOrders.read",
      "orders:read",
      "orders.read",
    );
  };

  // Check if user can view and update purchase orders
  const canManagePurchaseOrders = (): boolean => {
    if (isAdmin()) return true;
    return (
      canViewPurchaseOrders() &&
      hasExplicitPermission(
        "purchase_orders:update",
        "purchase_orders.update",
        "purchaseOrders:update",
        "purchaseOrders.update",
        "orders:update",
        "orders.update",
      )
    );
  };

  // Check if user can view credit (explicit permission OR admin)
  const canViewCredit = (): boolean => {
    if (isAdmin()) return true;
    return hasExplicitPermission(
      "credit:read",
      "credit.read",
      "credits:read",
      "credits.read",
      "flows:credit.read",
      "flows:credit:read",
    );
  };

  // Check if user can view and update credit
  const canManageCredit = (): boolean => {
    if (isAdmin()) return true;
    return (
      canViewCredit() &&
      hasExplicitPermission(
        "credit:update",
        "credit.update",
        "credits:update",
        "credits.update",
        "flows:credit.update",
        "flows:credit:update",
      )
    );
  };

  // Check if user is a credit manager (can assign to others and see all items)
  const isCreditManager = (): boolean => {
    return hasMinimumLevel("Manager") && canManageCredit();
  };

  // Check if user can assign credit items to other users (not just self-assign)
  // Admins, Credit Managers, and Manager-level users with credit access can assign to anyone
  const canAssignCreditToOthers = (): boolean => {
    if (isAdmin()) return true;
    if (isCreditManager()) return true;
    // Manager-level users who can view credit should also be able to assign
    if (hasMinimumLevel("Manager") && canViewCredit()) return true;
    return false;
  };

  // Check if user can impersonate other users (admin only)
  const canImpersonate = (): boolean => {
    return hasMinimumLevel("Administrator");
  };

  // Check if user can view traffic lights / workflow (explicit permission OR admin)
  const canViewTrafficLight = (): boolean => {
    if (isAdmin()) return true;
    return hasExplicitPermission(
      "trafficLight.read",
      "trafficLight:read",
      "trafficLights.read",
      "trafficLights:read",
    );
  };

  // Check if user can manage traffic lights / workflow
  const canManageTrafficLight = (): boolean => {
    if (isAdmin()) return true;
    return (
      canViewTrafficLight() &&
      hasExplicitPermission(
        "trafficLight.update",
        "trafficLight:update",
        "trafficLights.update",
        "trafficLights:update",
      )
    );
  };

  return {
    hasPermission,
    hasExplicitPermission,
    hasMinimumLevel,
    isAdmin: isAdmin(),
    canManageUsers: hasPermission("users:update") || hasMinimumLevel("Editor"),
    canDeleteUsers:
      hasPermission("users:delete") || hasMinimumLevel("Administrator"),
    canViewPurchaseOrders: canViewPurchaseOrders(),
    canManagePurchaseOrders: canManagePurchaseOrders(),
    canViewCredit: canViewCredit(),
    canManageCredit: canManageCredit(),
    isCreditManager: isCreditManager(),
    canAssignCreditToOthers: canAssignCreditToOthers(),
    canImpersonate: canImpersonate(),
    canViewTrafficLight: canViewTrafficLight(),
    canManageTrafficLight: canManageTrafficLight(),
  };
};
