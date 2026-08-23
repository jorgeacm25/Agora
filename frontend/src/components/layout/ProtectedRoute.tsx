import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';

// Solo en `npm run dev` (Vite elimina esta rama en un build de producción):
// deja navegar por rutas protegidas sin sesión real, para poder ver todas
// las pantallas en local.
const DEV_PREVIEW = import.meta.env.DEV;

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (DEV_PREVIEW) return <Outlet />;
  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

export function RequireSeller() {
  const { isSeller, isLoading } = useAuth();

  if (DEV_PREVIEW) return <Outlet />;
  if (isLoading) return <PageSpinner />;
  if (!isSeller) {
    return <Navigate to="/vender" replace />;
  }
  return <Outlet />;
}
