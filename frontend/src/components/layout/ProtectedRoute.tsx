import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';

/**
 * Agora es una aplicación cerrada, no una landing: sin sesión no se ve ninguna
 * pantalla. Todo lo que cuelga de AppLayout pasa por aquí; las únicas rutas
 * fuera son las de acceso, que a su vez usan <SoloSinSesion>.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) {
    // Se recuerda a dónde iba para volver ahí después de iniciar sesión.
    return <Navigate to="/iniciar-sesion" state={{ from: location.pathname + location.search }} replace />;
  }
  return <Outlet />;
}

/** Rutas que solo tienen sentido sin sesión: entrar y crear cuenta. */
export function SoloSinSesion() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;
  if (isAuthenticated) {
    // Al iniciar sesión, este guardia se adelanta al `navigate` de la pantalla
    // de acceso, así que es él quien tiene que respetar a dónde iba el usuario.
    const destino = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={destino} replace />;
  }
  return <Outlet />;
}

export function RequireSeller() {
  const { isSeller, isLoading } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (!isSeller) {
    return <Navigate to="/vender" replace />;
  }
  return <Outlet />;
}
