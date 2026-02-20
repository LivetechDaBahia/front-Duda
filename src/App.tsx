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
import {
  ImpersonationBanner,
  useImpersonationActive,
} from "./components/impersonation";
import { AppSidebar } from "./components/navigation/AppSidebar";
import { RouteTracker } from "./components/shared/RouteTracker";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Credit from "./pages/Credit";
import Users from "./pages/Users";
import Workflow from "./pages/Workflow";
import AIAssistant from "./pages/AIAssistant";
import Sales from "./pages/Sales";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import AuthCallback from "./pages/AuthCallback";
import RequestAccess from "./pages/RequestAccess";
import NotFound from "./pages/NotFound";

const AppRoutes = () => {
  const location = useLocation();
  const isImpersonating = useImpersonationActive();

  // Pages that should not show the sidebar
  const noSidebarRoutes = [
    "/login",
    "/logout",
    "/auth/callback",
    "/request-access",
  ];
  const showSidebar =
    !noSidebarRoutes.includes(location.pathname) && location.pathname !== "*";

  return (
    <>
      <RouteTracker />
      <ImpersonationBanner />
      <div
        className="flex w-full min-h-[100dvh]"
        style={{ paddingTop: isImpersonating ? "52px" : "0" }}
      >
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
              <Route path="/request-access" element={<RequestAccess />} />
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
              <Route
                path="/workflow"
                element={
                  <ProtectedRoute>
                    <Workflow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
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
