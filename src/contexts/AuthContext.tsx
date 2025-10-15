import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  provider: 'microsoft' | 'email';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ requiresMFA: boolean }>;
  loginWithMicrosoft: () => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would call your authentication API
    // For now, we'll simulate that it requires MFA
    return { requiresMFA: true };
  };

  const loginWithMicrosoft = async () => {
    // Mock Microsoft SSO
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      email: 'user@company.com',
      name: 'Microsoft User',
      provider: 'microsoft' as const,
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const verifyMFA = async (code: string) => {
    // Mock MFA verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (code.length === 6) {
      const mockUser = {
        email: 'user@company.com',
        name: 'Email User',
        provider: 'email' as const,
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } else {
      throw new Error('Invalid MFA code');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithMicrosoft, verifyMFA, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
