import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLocale } from "@/contexts/LocaleContext";

export const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isDashboard = location.pathname === "/purchase-orders";
  const { t } = useLocale();

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform group-hover:scale-110">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("nav.brandName")}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant={isHome ? "default" : "ghost"} size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                {t("nav.home")}
              </Link>
            </Button>

            <Button
              variant={isDashboard ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/purchase-orders" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                {t("nav.purchaseOrders")}
              </Link>
            </Button>

            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
