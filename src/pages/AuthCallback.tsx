import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL parameters
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          throw new Error(error);
        }

        if (!token) {
          throw new Error("No token received from authentication");
        }

        // In production, you might also get user data from the URL
        // or fetch it from your backend using the token
        const userEmail = searchParams.get("email") || "user@company.com";
        const userName = searchParams.get("name") || "Microsoft User";

        const user = {
          email: userEmail,
          name: userName,
          provider: "microsoft" as const,
        };

        // Store auth data
        setAuthData(user, token);

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        // Redirect to dashboard
        navigate("/purchase-orders", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description:
            error instanceof Error ? error.message : "Please try again",
        });
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuthData, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
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
