import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, UserRole } from '../../types/cpi';
import { api } from '../../shared/api/client';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canRunArg: boolean;
  canUpdateLeadStage: boolean;
  canApproveReject: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'cpi_access_token';
const USER_KEY = 'cpi_user_info';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hydrate session on app load via GET /v1/auth/me
    const hydrate = async () => {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (!currentToken) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Session hydration failed:', err);
        // If 401 or invalid, clear token
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('cpi_auth_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('cpi_auth_logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const role = user?.role || null;
  const canRunArg = role === 'admin' || role === 'analyst';
  const canUpdateLeadStage = role === 'admin' || role === 'analyst';
  const canApproveReject = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token && !!user,
        isLoading,
        canRunArg,
        canUpdateLeadStage,
        canApproveReject,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
