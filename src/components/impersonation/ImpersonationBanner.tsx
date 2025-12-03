import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Eye, X, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const ImpersonationBanner = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stopping, setStopping] = useState(false);

  if (!user?.impersonating) return null;

  const handleStop = async () => {
    setStopping(true);
    try {
      await apiClient.post("/auth/impersonate/stop");
      
      // Refresh user context first
      await refreshUser();
      
      // Invalidate all queries to refetch with original user context
      await queryClient.invalidateQueries();
      
      toast({
        title: "Impersonation ended",
        description: "You are now viewing as yourself",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to stop impersonation",
        description: "Please try again",
      });
    } finally {
      setStopping(false);
    }
  };

  const displayName = user.name || user.email || "Unknown user";
  const impersonatedByName = user.impersonatedBy?.name || user.impersonatedBy?.email || "Admin";

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 px-4 py-3 flex items-center justify-center gap-4 shadow-lg border-b-2 border-amber-600">
      <div className="flex items-center gap-2 animate-pulse">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span className="text-sm font-semibold">
          IMPERSONATION MODE
        </span>
        <span className="text-sm">
          — Viewing as <strong className="underline">{displayName}</strong>
        </span>
        <span className="text-xs opacity-75">
          (started by {impersonatedByName})
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-600/30 rounded-full">
        <span className="text-xs font-medium">READ-ONLY</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        disabled={stopping}
        className="h-8 bg-amber-100 border-amber-700 text-amber-900 hover:bg-amber-200 hover:text-amber-950 font-medium"
      >
        <X className="h-4 w-4 mr-1" />
        {stopping ? "Stopping..." : "Stop Impersonation"}
      </Button>
    </div>
  );
};

// Export a hook to check if impersonation is active (for layout adjustments)
export const useImpersonationActive = () => {
  const { user } = useAuth();
  return user?.impersonating ?? false;
};
