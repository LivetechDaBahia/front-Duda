import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Eye, X, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const ImpersonationBanner = () => {
  const { user, isLoading } = useAuth();
  const { t } = useLocale();
  const { toast } = useToast();
  const [stopping, setStopping] = useState(false);

  // Debug logging to track impersonation state
  useEffect(() => {
    if (!isLoading) {
      console.log("[ImpersonationBanner] Auth state:", {
        email: user?.email,
        impersonating: user?.impersonating,
        impersonatedBy: user?.impersonatedBy,
      });
    }
  }, [user, isLoading]);

  // Don't render during loading or if not impersonating
  if (isLoading || !user?.impersonating) return null;

  const handleStop = async () => {
    setStopping(true);
    try {
      await apiClient.post("/auth/impersonate/stop");

      // Reload the page to ensure all components get fresh data with original user context
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("impersonation.stopFailed"),
        description: t("impersonation.stopFailedDesc"),
      });
      setStopping(false);
    }
  };

  const displayName = user.name || user.email || "Unknown user";
  const impersonatedByName =
    user.impersonatedBy?.name || user.impersonatedBy?.email || "Admin";

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 px-4 py-3 flex items-center justify-center gap-4 shadow-lg border-b-2 border-amber-600">
      <div className="flex items-center gap-2 animate-pulse">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span className="text-sm font-semibold">
          {t("impersonation.mode")}
        </span>
        <span className="text-sm">
          — {t("impersonation.viewingAs")} <strong className="underline">{displayName}</strong>
        </span>
        <span className="text-xs opacity-75">
          ({t("impersonation.startedBy")} {impersonatedByName})
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-600/30 rounded-full">
        <span className="text-xs font-medium">{t("impersonation.readOnly")}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        disabled={stopping}
        className="h-8 bg-amber-100 border-amber-700 text-amber-900 hover:bg-amber-200 hover:text-amber-950 font-medium"
      >
        <X className="h-4 w-4 mr-1" />
        {stopping ? t("impersonation.stopping") : t("impersonation.stop")}
      </Button>
    </div>
  );
};

// Export a hook to check if impersonation is active (for layout adjustments)
export const useImpersonationActive = () => {
  const { user, isLoading } = useAuth();
  // Return false during loading to avoid layout shift
  if (isLoading) return false;
  return user?.impersonating ?? false;
};
