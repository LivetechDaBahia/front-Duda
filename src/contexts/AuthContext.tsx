import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface User {
  email: string;
  name: string;
  provider: "microsoft";
  role?: string;
  department?: string;
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

  useEffect(() => {
    // Check if user is already authenticated on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        // Check first access immediately after getting user data
        try {
          const firstAccessRes = await fetch(
            `${API_BASE_URL}/auth/first-access`,
            {
              credentials: "include",
            }
          );

          if (firstAccessRes.ok) {
            const { firstAccess: needsVerification } =
              await firstAccessRes.json();
            setFirstAccess(needsVerification);
            setShowPhoneVerificationModal(needsVerification);
          } else {
            // If first access check fails, assume verified to not block user
            setFirstAccess(false);
            setShowPhoneVerificationModal(false);
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
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setFirstAccess(null);
      setShowPhoneVerificationModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = () => {
    // Redirect to backend login endpoint
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
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
