import { useLocation } from "react-router-dom";
import {
  Home,
  LogOut,
  Bell,
  FileCheck,
  Banknote,
  Users as UsersIcon,
  GitBranch,
  Sparkles,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/aceternity-sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationsSection } from "@/components/welcome/NotificationsSection";
import { ImpersonationDialog } from "@/components/impersonation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const SidebarContent = () => {
  const location = useLocation();
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { open } = useSidebar();
  const { isAdmin, canViewCredit, canImpersonate } = usePermissions();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [impersonationDialogOpen, setImpersonationDialogOpen] = useState(false);
  const isImpersonating = user?.impersonating ?? false;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: t("auth.logoutSuccess") || "Logged out successfully",
        description: t("auth.logoutDescription") || "You have been logged out",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Please try again",
      });
    }
  };

  const links = [
    {
      label: t("nav.home"),
      href: "/home",
      icon: (
        <Home
          className={cn(
            "w-5 h-5 flex-shrink-0",
            location.pathname === "/home"
              ? "text-primary"
              : "text-muted-foreground",
          )}
        />
      ),
    },
    {
      label: t("nav.purchaseOrders"),
      href: "/purchase-orders",
      icon: (
        <FileCheck
          className={cn(
            "w-5 h-5 flex-shrink-0",
            location.pathname === "/purchase-orders"
              ? "text-primary"
              : "text-muted-foreground",
          )}
        />
      ),
    },
    ...(canViewCredit
      ? [
          {
            label: t("nav.credit"),
            href: "/credit",
            icon: (
              <Banknote
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  location.pathname === "/credit"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
            ),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            label: t("nav.workflow"),
            href: "/workflow",
            icon: (
              <GitBranch
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  location.pathname === "/workflow"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
            ),
          },
          {
            label: "AI Assistant",
            href: "/ai-assistant",
            icon: (
              <Sparkles
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  location.pathname === "/ai-assistant"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
            ),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            label: t("nav.admin"),
            href: "/users",
            icon: (
              <UsersIcon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  location.pathname === "/users"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
              <img src="/favicon.svg" alt="Logo" className="w-10 h-10" />
            </motion.div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}

            {/* Notifications Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsOpen(true)}
              className="flex items-center gap-2 justify-start w-full relative"
            >
              <Bell className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
              <motion.span
                className="text-sm"
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
              >
                {t("nav.notifications")}
              </motion.span>
            </Button>

            {/* Impersonation Button - Admin only */}
            {canImpersonate && !isImpersonating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImpersonationDialogOpen(true)}
                className="flex items-center gap-2 justify-start w-full"
              >
                <Eye className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                <motion.span
                  className="text-sm"
                  animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                >
                  View as user
                </motion.span>
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Section - Controls */}
        <div className="flex flex-col gap-2 border-t pt-4">
          <div className="flex items-center justify-center gap-2 px-2">
            <LanguageSwitcher collapsed={!open} />
            <ThemeToggle collapsed={!open} />
          </div>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 justify-start w-full"
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
              <motion.span
                className="text-sm"
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
              >
                {t("auth.logout") || "Logout"}
              </motion.span>
            </Button>
          )}
        </div>
      </SidebarBody>

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("nav.notifications")}</DialogTitle>
          </DialogHeader>
          <NotificationsSection />
        </DialogContent>
      </Dialog>

      <ImpersonationDialog
        open={impersonationDialogOpen}
        onOpenChange={setImpersonationDialogOpen}
      />
    </>
  );
};

export const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent />
    </Sidebar>
  );
};
