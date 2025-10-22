import { useLocation } from "react-router-dom";
import { LayoutDashboard, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/aceternity-sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SidebarContent = () => {
  const location = useLocation();
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { open } = useSidebar();

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
            location.pathname === "/home" ? "text-primary" : "text-muted-foreground"
          )}
        />
      ),
    },
    {
      label: t("nav.purchaseOrders"),
      href: "/purchase-orders",
      icon: (
        <LayoutDashboard
          className={cn(
            "w-5 h-5 flex-shrink-0",
            location.pathname === "/purchase-orders" ? "text-primary" : "text-muted-foreground"
          )}
        />
      ),
    },
  ];

  return (
    <SidebarBody className="justify-between gap-10">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer"
          >
            <img 
              src="/favicon.svg" 
              alt="Logo" 
              className="w-10 h-10"
            />
          </motion.div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2">
          {links.map((link, idx) => (
            <SidebarLink key={idx} link={link} />
          ))}
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
  );
};

export const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent />
    </Sidebar>
  );
};
