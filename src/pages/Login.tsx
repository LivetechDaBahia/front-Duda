import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import { Package, Home } from "lucide-react";

export default function Login() {
  const { user, isLoading, loginWithMicrosoft } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/purchase-orders", { replace: true });
    }
  }, [user, navigate]);

  const handleMicrosoftLogin = () => {
    // Redirect to backend login endpoint
    loginWithMicrosoft();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
            <CardDescription>
              {t("login.subtitle")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23">
              <path fill="#f3f3f3" d="M0 0h23v23H0z" />
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            {isLoading ? t("login.verifying") : t("login.signInMicrosoft")}
          </Button>
          
          <Button
            variant="ghost"
            className="w-full"
            asChild
          >
            <Link to="/home" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              {t("login.backToHome")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
