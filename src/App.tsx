import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppSidebar } from "./components/navigation/AppSidebar";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Credit from "./pages/Credit";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import AuthCallback from "./pages/AuthCallback";
import PhoneVerification from "./pages/PhoneVerification";
import NotFound from "./pages/NotFound";

const AppRoutes = () => {
  const location = useLocation();
  
  // Pages that should not show the sidebar
  const noSidebarRoutes = ['/login', '/logout', '/auth/callback', '/verify-phone'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname) && location.pathname !== '*';

  return (
    <div className="flex w-full min-h-screen">
      {showSidebar && <AppSidebar />}
      <div className="flex-1 w-full">
        <Routes>
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/verify-phone"
            element={
              <ProtectedRoute>
                <PhoneVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/credit"
            element={
              <ProtectedRoute>
                <Credit />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <LocaleProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LocaleProvider>
  </ThemeProvider>
);

export default App;
