import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const DISABLE_PHONE_VERIFICATION_MODAL =
  String(import.meta.env.VITE_DISABLE_PHONE_VERIFICATION_MODAL || "false") ===
  "true";

interface ImpersonatedBy {
  sub: string;
  email?: string | null;
  name?: string | null;
}

interface User {
  email: string;
  name: string;
  provider: "microsoft";
  role?: string;
  department?: string;
  permissions?: string[]; // Array of permission strings (e.g., ["users:read", "users:update"])
  level?: string; // Permission level (e.g., "Viewer", "Editor", "Administrator")
  impersonating?: boolean;
  impersonatedBy?: ImpersonatedBy | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  firstAccess: boolean | null;
  showPhoneVerificationModal: boolean;
  loginWithMicrosoft: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setPhoneVerified: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstAccess, setFirstAccess] = useState<boolean | null>(null);
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] =
    useState(false);
  const isDev = (import.meta as any).env?.DEV;

  // Helper: expose impersonation debug info globally (dev only)
  const updateImpersonationDebug = (u: User | null) => {
    if (typeof window === "undefined" || !isDev) return;
    (window as any).__IMPERSONATION_DEBUG__ = {
      expectedEmail: u?.email ?? null,
      impersonating: !!u?.impersonating,
      impersonatedBy: u?.impersonatedBy ?? null,
    };
    try {
      // eslint-disable-next-line no-console
      console.log("[AuthContext] debug state", (window as any).__IMPERSONATION_DEBUG__);
    } catch (_) {
      // no-op
    }
  };

  useEffect(() => {
    // Check if user is already authenticated on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const userData = await apiClient.get(`/auth/me`);
      if (userData) {
        console.log("[AuthContext] /auth/me response:", {
          email: userData.email,
          name: userData.name,
          impersonating: userData.impersonating,
          impersonatedBy: userData.impersonatedBy,
        });
        setUser(userData);
        updateImpersonationDebug(userData);

        // Check first access immediately after getting user data
        try {
          if (DISABLE_PHONE_VERIFICATION_MODAL) {
            // Temporarily disable phone verification modal
            setFirstAccess(false);
            setShowPhoneVerificationModal(false);
          } else {
            const firstAccessRes: any = await apiClient.get(
              `/auth/first-access`,
            );

            if (firstAccessRes && typeof firstAccessRes === "object") {
              const { firstAccess: needsVerification } = firstAccessRes as any;
              setFirstAccess(needsVerification);
              setShowPhoneVerificationModal(needsVerification);
            } else {
              // If first access check fails, assume verified to not block user
              setFirstAccess(false);
              setShowPhoneVerificationModal(false);
            }
          }
        } catch (firstAccessError) {
          console.error("First access check failed:", firstAccessError);
          setFirstAccess(false);
          setShowPhoneVerificationModal(false);
        }
      } else {
        setUser(null);
        setFirstAccess(null);
        setShowPhoneVerificationModal(false);
        updateImpersonationDebug(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setFirstAccess(null);
      setShowPhoneVerificationModal(false);
      updateImpersonationDebug(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = () => {
    // Redirect to backend login endpoint
    const isDev = (import.meta as any).env?.DEV;
    if (isDev) {
      // Use dev proxy so auth cookies are set for the front-end origin
      window.location.href = `/api/auth/login`;
    } else {
      window.location.href = `${API_BASE_URL}/auth/login`;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(`/auth/logout`);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setFirstAccess(null);
      setShowPhoneVerificationModal(false);
      updateImpersonationDebug(null);
      window.location.href = "/logout";
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const setPhoneVerified = () => {
    setFirstAccess(false);
    setShowPhoneVerificationModal(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        firstAccess,
        showPhoneVerificationModal,
        loginWithMicrosoft,
        logout,
        refreshUser,
        setPhoneVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
