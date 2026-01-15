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
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { Package } from "lucide-react";

export default function Login() {
  const { user, isLoading, loginWithMicrosoft } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  const navigate = useNavigate();

  // Redirect if already logged in or auth is bypassed
  useEffect(() => {
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";
    if (user || bypassAuth) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const handleMicrosoftLogin = () => {
    // Redirect to backend login endpoint
    loginWithMicrosoft();
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
            <CardDescription>{t("login.subtitle")}</CardDescription>
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t("accessRequest.noAccount")}
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/request-access"
              className="text-sm text-primary hover:underline"
            >
              {t("accessRequest.requestAccess")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
