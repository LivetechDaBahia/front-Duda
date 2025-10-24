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
        // Backend has already set the session cookie
        // Just refresh user data and redirect
        await refreshUser();

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        navigate("/purchase-orders", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);
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
