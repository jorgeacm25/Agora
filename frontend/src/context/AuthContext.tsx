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

// Solo en `npm run dev` (Vite reemplaza esto por `false` en un build de producción,
// así que este bloque nunca llega al bundle publicado): permite navegar por todas
// las pantallas protegidas sin tener que registrarte/iniciar sesión primero.
const DEV_PREVIEW = import.meta.env.DEV;

const DEV_USER: AuthUser = {
  id: 'dev-preview-user',
  username: 'vista_previa',
  // Sin permisos de vendedor a propósito: así /planes (solo comprador) sigue
  // siendo visible. El acceso a /panel/* en desarrollo no depende de esto,
  // ver el bypass dedicado en ProtectedRoute.tsx.
  permissions: [],
};

const DEV_ENTERPRISE: UserEnterprise = {
  idUserEnterprise: 'dev-preview-enterprise',
  userId: DEV_USER.id,
  companyName: 'Mi Negocio (vista previa)',
  address: { street: 'Calle Falsa 123', city: 'Ciudad', state: 'Estado', zipCode: '00000', country: 'País' },
  contact: { email: 'preview@example.com', phone: '+000000000' },
  officeHours: null,
  code: null,
  latitude: 23.1136,
  longitude: -82.3666,
};

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
        setIsLoading(false);
        return;
      } catch {
        clearToken();
      }
    }
    if (DEV_PREVIEW) {
      setUser(DEV_USER);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (DEV_PREVIEW && user?.id === DEV_USER.id) {
      setEnterprise(DEV_ENTERPRISE);
      // Sin suscripción simulada a propósito: así /planes sigue siendo visible
      // (esa pantalla se oculta en cuanto detecta una suscripción activa).
      setSubscription(null);
      return;
    }
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
    setUser(DEV_PREVIEW ? DEV_USER : null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      enterprise,
      subscription,
      isLoading,
      isSeller:
        DEV_PREVIEW && user?.id === DEV_USER.id
          ? false
          : computeIsSeller(user?.permissions) || Boolean(enterprise),
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
