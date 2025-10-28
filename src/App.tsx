import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PhoneVerificationModal } from "./components/auth/PhoneVerificationModal";
import { AppSidebar } from "./components/navigation/AppSidebar";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Credit from "./pages/Credit";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const AppRoutes = () => {
  const location = useLocation();

  // Pages that should not show the sidebar
  const noSidebarRoutes = ["/login", "/logout", "/auth/callback"];
  const showSidebar =
    !noSidebarRoutes.includes(location.pathname) && location.pathname !== "*";

  return (
    <div className="flex w-full min-h-[100dvh]">
      {showSidebar && <AppSidebar />}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
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
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function PhoneVerificationModalWrapper() {
  const { showPhoneVerificationModal, setPhoneVerified } = useAuth();

  return (
    <PhoneVerificationModal
      open={showPhoneVerificationModal}
      onVerificationComplete={setPhoneVerified}
    />
  );
}

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
          <PhoneVerificationModalWrapper />
        </TooltipProvider>
      </AuthProvider>
    </LocaleProvider>
  </ThemeProvider>
);

export default App;
