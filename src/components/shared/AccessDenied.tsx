import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

export const AccessDenied = ({
  title,
  message,
  showHomeButton = true,
}: AccessDeniedProps) => {
  const navigate = useNavigate();
  const { t } = useLocale();

  const defaultTitle = t("errors.accessDenied") || "Access Denied";
  const defaultMessage =
    t("errors.noPermission") ||
    "You don't have permission to access this page.";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          {title || defaultTitle}
        </h1>

        <p className="text-muted-foreground mb-6">{message || defaultMessage}</p>

        {showHomeButton && (
          <Button
            variant="outline"
            onClick={() => navigate("/home")}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            {t("nav.home") || "Go to Home"}
          </Button>
        )}
      </div>
    </div>
  );
};
