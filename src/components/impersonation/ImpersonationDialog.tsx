import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, Mail, Hash, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImpersonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImpersonationDialog = ({
  open,
  onOpenChange,
}: ImpersonationDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

  const handleStart = async () => {
    const payload: { email?: string; userId?: string; ttlSec?: number } =
      activeTab === "email" ? { email: email.trim() } : { userId: userId.trim() };

    if (!payload.email && !payload.userId) {
      toast({
        variant: "destructive",
        title: "Missing input",
        description: "Please enter an email or user ID",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/impersonate/start", {
        ...payload,
        ttlSec: 900, // 15 minutes default
      });

      console.log("[ImpersonationDialog] Impersonation start response:", response);

      // After starting, poll /auth/me briefly to ensure cookie/state has taken effect
      const maxAttempts = 10;
      const delayMs = 250;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const me: any = await apiClient.get("/auth/me");
          console.log("[ImpersonationDialog] /auth/me after start:", me);
          if (me?.impersonating) {
            // Reload once confirmed
            window.location.reload();
            return;
          }
        } catch (e) {
          // ignore between attempts
        }
        await new Promise((r) => setTimeout(r, delayMs));
      }

      // If we get here, impersonation did not activate according to /auth/me
      toast({
        variant: "destructive",
        title: "Impersonation not activated",
        description:
          "Could not confirm impersonation state from the server. Please try again or contact support.",
      });

    } catch (error: any) {
      const message =
        error?.message || "Failed to start impersonation. Please try again.";
      
      if (message.includes("403") || message.includes("permission")) {
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "You don't have permission to impersonate users",
        });
      } else if (message.includes("404") || message.includes("not found")) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "No user found with the provided email or ID",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Impersonation failed",
          description: message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEmail("");
    setUserId("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            View as User
          </DialogTitle>
          <DialogDescription>
            Enter the email or ID of the user you want to view as. You will be in
            read-only mode and cannot make changes.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
            After starting impersonation, all data (purchase orders, credits, etc.) 
            will be refetched for the target user. Session expires in 15 minutes.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              By Email
            </TabsTrigger>
            <TabsTrigger value="userId" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              By User ID
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>
          </TabsContent>

          <TabsContent value="userId" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID (UUID)</Label>
              <Input
                id="userId"
                type="text"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={loading}>
            {loading ? "Starting..." : "Start Viewing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
