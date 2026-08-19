import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'signup' | 'admin';
  setAuthModalTab: (tab: 'login' | 'signup' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'systum_ott_token';
const USER_KEY = 'systum_ott_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'admin'>('login');

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: 'Server connection error. Please try again.' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: data.message || 'Signup failed' };
    } catch (error) {
      return { success: false, message: 'Server connection error during signup' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
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
