import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '@/api/auth';
import { getMyEnterprise } from '@/api/userEnterprise';
import { getMyActiveSubscription } from '@/api/subscription';
import { clearToken, getToken, setToken } from '@/api/client';
import type { AuthUser, UserEnterprise } from '@/types';
import type { Subscription } from '@/api/subscription';
import { ApiError } from '@/api/client';
import { isSeller as computeIsSeller } from '@/lib/permissions';

interface AuthContextValue {
  user: AuthUser | null;
  enterprise: UserEnterprise | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isSeller: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSellerStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [enterprise, setEnterprise] = useState<UserEnterprise | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSellerStatus = useCallback(async () => {
    const [enterpriseResult, subscriptionResult] = await Promise.allSettled([
      getMyEnterprise(),
      getMyActiveSubscription(),
    ]);
    setEnterprise(enterpriseResult.status === 'fulfilled' ? enterpriseResult.value : null);
    setSubscription(subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : null);
  }, []);

  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('agora_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadSellerStatus();
    } else {
      setEnterprise(null);
      setSubscription(null);
    }
  }, [user, loadSellerStatus]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    setToken(response.accessToken);
    localStorage.setItem('agora_user', JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    await authApi.register(username, password);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem('agora_user');
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      enterprise,
      subscription,
      isLoading,
      isSeller: computeIsSeller(user?.permissions) || Boolean(enterprise),
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshSellerStatus: loadSellerStatus,
    }),
    [user, enterprise, subscription, isLoading, login, register, logout, loadSellerStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
