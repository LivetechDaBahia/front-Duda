import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";
  const [checkingFirstAccess, setCheckingFirstAccess] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Bypass authentication if flag is enabled
  if (bypassAuth) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3 animate-pulse">
              <Package className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Loading...</h2>
            <p className="text-muted-foreground">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check first access status for authenticated users
  useEffect(() => {
    // Don't check if on verify-phone page or if bypassing auth
    if (location.pathname === "/verify-phone" || bypassAuth) {
      setCheckingFirstAccess(false);
      return;
    }

    const checkFirstAccess = async () => {
      try {
        const API_BASE =
          import.meta.env.VITE_API_URL || "http://localhost:3000";
        const res = await fetch(`${API_BASE}/auth/first-access`, {
          credentials: "include",
        });

        if (res.ok) {
          const { firstAccess } = await res.json();
          setNeedsVerification(firstAccess);
        }
      } catch (error) {
        console.error("First access check failed:", error);
      } finally {
        setCheckingFirstAccess(false);
      }
    };

    checkFirstAccess();
  }, [location.pathname, bypassAuth]);

  if (checkingFirstAccess) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3 animate-pulse">
              <Package className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Loading...</h2>
            <p className="text-muted-foreground">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to phone verification if needed
  if (needsVerification && location.pathname !== "/verify-phone") {
    return <Navigate to="/verify-phone" replace />;
  }

  return <>{children}</>;
};
