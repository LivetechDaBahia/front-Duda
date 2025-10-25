import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[AuthCallback] Starting authentication callback...");
        
        // Backend has already set the session cookie
        // Refresh user data first
        await refreshUser();
        console.log("[AuthCallback] User data refreshed");

        // Check if user needs to complete first access (phone verification)
        const API_BASE =
          import.meta.env.VITE_API_URL || "http://localhost:3000";
        console.log("[AuthCallback] Checking first access at:", API_BASE);
        
        const firstAccessRes = await fetch(`${API_BASE}/auth/first-access`, {
          credentials: "include",
        });

        console.log("[AuthCallback] First access response status:", firstAccessRes.status);

        if (firstAccessRes.ok) {
          const { firstAccess } = await firstAccessRes.json();
          console.log("[AuthCallback] First access value:", firstAccess);

          if (firstAccess) {
            // User needs phone verification
            console.log("[AuthCallback] Redirecting to phone verification...");
            navigate("/verify-phone", { replace: true });
            return;
          }
        } else {
          console.warn("[AuthCallback] First access check failed with status:", firstAccessRes.status);
        }

        // First access check passed or not available, proceed to home
        console.log("[AuthCallback] Proceeding to home page");
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        navigate("/home", { replace: true });
      } catch (error) {
        console.error("[AuthCallback] Auth callback error:", error);
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Please try again",
        });
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, refreshUser, toast]);

  return (
    <div className="flex min-h-full items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-3 animate-pulse">
            <Package className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Completing sign in...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    </div>
  );
}
