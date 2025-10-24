import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, LogIn } from "lucide-react";

export default function Logout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto">
          <div className="bg-card/80 backdrop-blur-sm border rounded-xl shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Logout Successful</h1>
              <p className="text-muted-foreground">
                You have been successfully logged out of your account.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In Again
              </Button>

              <Button
                onClick={() => navigate("/home")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
