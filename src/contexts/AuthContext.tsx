import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  email: string;
  name: string;
  provider: "microsoft";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  setAuthData: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved user and token on mount
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    
    setIsLoading(false);
  }, []);

  const setAuthData = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };

  const loginWithMicrosoft = async () => {
    // Mock Microsoft SSO - In production, this will redirect to Microsoft OAuth
    // or use MSAL library to handle the authentication flow
    setIsLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, this would:
      // 1. Redirect to Microsoft OAuth or use MSAL popup/redirect
      // 2. Receive authorization code
      // 3. Exchange code for tokens via your backend
      // 4. Backend validates and returns your app's JWT token
      
      const mockUser: User = {
        email: "user@company.com",
        name: "Microsoft User",
        provider: "microsoft",
      };
      
      const mockToken = "mock-jwt-token-" + Date.now();

      setAuthData(mockUser, mockToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const getToken = () => {
    return token;
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        token, 
        isLoading,
        loginWithMicrosoft, 
        logout, 
        getToken,
        setAuthData 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
