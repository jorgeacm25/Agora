import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" state={{ from: location.pathname }} replace />;
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
