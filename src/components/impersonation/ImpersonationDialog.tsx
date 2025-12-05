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
import { useLocale } from "@/contexts/LocaleContext";
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
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

  const handleStart = async () => {
    const payload: { email?: string; userId?: string; ttlSec?: number } =
      activeTab === "email"
        ? { email: email.trim() }
        : { userId: userId.trim() };

    if (!payload.email && !payload.userId) {
      toast({
        variant: "destructive",
        title: t("impersonation.missingInput"),
        description: t("impersonation.enterEmailOrId"),
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/impersonate/start", {
        ...payload,
        ttlSec: 900, // 15 minutes default
      });

      // Reload the page to ensure all components get fresh data with impersonated user context
      // This is the most reliable way to ensure all queries use the new user's email
      window.location.reload();
    } catch (error: any) {
      const message = error?.message || t("impersonation.failed");

      if (message.includes("403") || message.includes("permission")) {
        toast({
          variant: "destructive",
          title: t("impersonation.permissionDenied"),
          description: t("impersonation.noPermission"),
        });
      } else if (message.includes("404") || message.includes("not found")) {
        toast({
          variant: "destructive",
          title: t("impersonation.userNotFound"),
          description: t("impersonation.userNotFoundDesc"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("impersonation.failed"),
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
            {t("impersonation.dialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("impersonation.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <Alert
          variant="default"
          className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
        >
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
            {t("impersonation.alertMessage")}
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t("impersonation.byEmail")}
            </TabsTrigger>
            <TabsTrigger value="userId" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {t("impersonation.byUserId")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("impersonation.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("impersonation.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>
          </TabsContent>

          <TabsContent value="userId" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="userId">{t("impersonation.userIdLabel")}</Label>
              <Input
                id="userId"
                type="text"
                placeholder={t("impersonation.userIdPlaceholder")}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleStart} disabled={loading}>
            {loading
              ? t("impersonation.starting")
              : t("impersonation.startViewing")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
