import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
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
      toast({
        title: "Impersonation ended",
        description: "You are now viewing as yourself",
      });
      await refreshUser();
      // Invalidate all queries to refetch with original user context
      queryClient.invalidateQueries();
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-3 shadow-md">
      <Eye className="h-4 w-4" />
      <span className="text-sm font-medium">
        Viewing as <strong>{displayName}</strong> — read-only mode
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        disabled={stopping}
        className="h-7 bg-amber-100 border-amber-600 text-amber-900 hover:bg-amber-200 hover:text-amber-950"
      >
        <X className="h-3 w-3 mr-1" />
        {stopping ? "Stopping..." : "Stop"}
      </Button>
    </div>
  );
};
