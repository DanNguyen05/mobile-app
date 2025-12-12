// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, type User } from '../services/api';
import { http } from '../services/http';

export interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapAuthResponse = async (data: any): Promise<User | null> => {
  if (data?.accessToken && data?.refreshToken) {
    await http.setTokens(data.accessToken, data.refreshToken);
  }
  const user = data?.user as User | undefined;
  return user ?? null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const token = await http.getAccessToken();
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const profile = await api.getCurrentUser();
        const currentToken = await http.getAccessToken();
        if (isMounted && currentToken) {
          setUser(profile);
        }
      } catch (error) {
        await http.clearTokens();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await http.request('/api/auth/login', {
      method: 'POST',
      json: { email, password },
      skipAuth: true,
    });
    const profile = await mapAuthResponse(data);
    setUser(profile);
  }, []);

  const register = useCallback(async (payload: Record<string, any>) => {
    const data = await http.request('/api/auth/register', {
      method: 'POST',
      json: payload,
      skipAuth: true,
    });
    const profile = await mapAuthResponse(data);
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    try {
      await http.request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors
    } finally {
      await http.clearTokens();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const profile = await api.getCurrentUser();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isOnboarded: Boolean(user?.weight_kg && user?.height_cm),
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
