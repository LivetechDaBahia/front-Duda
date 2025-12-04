import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface GateWriteProps {
  children: ReactNode;
  fallback?: ReactNode;
  showTooltip?: boolean;
}

/**
 * Component that disables write actions when user is impersonating.
 * Wraps children in a disabled state with optional tooltip.
 */
export const GateWrite = ({
  children,
  fallback,
  showTooltip = true,
}: GateWriteProps) => {
  const { user } = useAuth();
  const { t } = useLocale();

  if (!user?.impersonating) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const disabledContent = (
    <span
      style={{ opacity: 0.5, pointerEvents: "none", cursor: "not-allowed" }}
      className="inline-block"
    >
      {children}
    </span>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block cursor-not-allowed">
            {disabledContent}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("impersonation.gateTooltip")}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return disabledContent;
};

/**
 * Hook to check if write actions should be disabled
 */
export const useIsReadOnly = () => {
  const { user } = useAuth();
  return user?.impersonating ?? false;
};
