import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '@/api/auth';
import { getMyEnterprise } from '@/api/userEnterprise';
import { estaVigente, getMyActiveSubscription } from '@/api/subscription';
import { clearToken, getToken, setToken } from '@/api/client';
import type { AuthUser, UserEnterprise } from '@/types';
import type { Subscription } from '@/api/subscription';
import { daAccesoDeNegocio } from '@/lib/plans';
import { ApiError } from '@/api/client';
import { isSeller as computeIsSeller } from '@/lib/permissions';

// Agora no es una landing: sin sesión no se ve ninguna pantalla, solo el acceso.
// Aquí vivía un usuario de vista previa que en `npm run dev` entraba solo y
// dejaba navegarlo todo sin cuenta; se quitó porque contradice esa regla y
// porque tapaba los 401 reales de la API detrás de una sesión que no existía.

interface AuthContextValue {
  user: AuthUser | null;
  enterprise: UserEnterprise | null;
  subscription: Subscription | null;
  /** Hay una suscripción vigente: se puede usar la app. */
  tieneAcceso: boolean;
  /** El plan vigente da negocio y hay empresa creada. */
  puedeAdministrarNegocio: boolean;
  isLoading: boolean;
  isSeller: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
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
  // La empresa y la suscripción llegan en una segunda vuelta, después de
  // restaurar la sesión. Hasta que estén, los guardias no pueden decidir: sin
  // esto, al recargar cualquier página se expulsaba a quien sí tenía plan.
  const [datosListos, setDatosListos] = useState(false);

  const loadSellerStatus = useCallback(async () => {
    const [enterpriseResult, subscriptionResult] = await Promise.allSettled([
      getMyEnterprise(),
      getMyActiveSubscription(),
    ]);
    setEnterprise(enterpriseResult.status === 'fulfilled' ? enterpriseResult.value : null);
    // Una suscripción caducada llega igual, con `status: false`: aquí solo se
    // guarda la que el backend da por vigente.
    const suscripcion = subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : null;
    setSubscription(estaVigente(suscripcion) ? suscripcion : null);
    setDatosListos(true);
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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadSellerStatus();
    } else {
      setEnterprise(null);
      setSubscription(null);
      setDatosListos(false);
    }
  }, [user, loadSellerStatus]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    setToken(response.accessToken);
    localStorage.setItem('agora_user', JSON.stringify(response.user));
    setUser(response.user);
    // Devuelto para quien lo necesite nada más entrar, como el alta de la
    // prueba en el registro: el estado de React aún no se ha propagado.
    return response.user;
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
      isLoading: isLoading || (Boolean(user) && !datosListos),
      isSeller: computeIsSeller(user?.permissions) || Boolean(enterprise),
      // Con suscripción vigente se entra en Agora; el panel de negocio pide
      // además que ese plan sea de los que dan negocio.
      tieneAcceso: Boolean(subscription),
      puedeAdministrarNegocio: daAccesoDeNegocio(subscription) && Boolean(enterprise),
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshSellerStatus: loadSellerStatus,
    }),
    [user, enterprise, subscription, isLoading, datosListos, login, register, logout, loadSellerStatus],
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
