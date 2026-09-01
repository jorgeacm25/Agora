import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { MotionProvider } from '@/context/MotionContext';
import { ToastProvider } from '@/context/ToastContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute, RequireSeller, SoloSinSesion } from '@/components/layout/ProtectedRoute';
import { ScrollAlInicio } from '@/components/layout/ScrollAlInicio';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ExplorePage } from '@/pages/explore/ExplorePage';
import { BusinessesPage } from '@/pages/business/BusinessesPage';
import { FavoritesPage } from '@/pages/favorites/FavoritesPage';
import { ProductDetailPage } from '@/pages/product/ProductDetailPage';
import { EnterprisePage } from '@/pages/enterprise/EnterprisePage';
import { BecomeSellerPage } from '@/pages/seller/BecomeSellerPage';
import { PlansPage } from '@/pages/plans/PlansPage';
import { AccountPage } from '@/pages/account/AccountPage';
import { DashboardHome } from '@/pages/dashboard/DashboardHome';
import { DashboardProducts } from '@/pages/dashboard/DashboardProducts';
import { ProductFormPage } from '@/pages/dashboard/ProductFormPage';
import { DashboardServices } from '@/pages/dashboard/DashboardServices';
import { ServiceFormPage } from '@/pages/dashboard/ServiceFormPage';
import { DashboardEnterprise } from '@/pages/dashboard/DashboardEnterprise';
import { NotFoundPage } from '@/pages/NotFoundPage';

/** Enlaces antiguos: /tiendas/:id era la ficha del negocio antes del 2026-08-31. */
function RedirigirANegocio() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/negocios/${id}`} replace />;
}

/**
 * El muro de ubicación va aquí dentro, no envolviendo toda la aplicación: si
 * no, era lo primero que veía alguien sin sesión, antes incluso del acceso.
 */
function ConOnboarding() {
  return (
    <OnboardingGate>
      <Outlet />
    </OnboardingGate>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <MotionProvider>
      <AuthProvider>
        <ToastProvider>
          <FavoritesProvider>
          <ScrollAlInicio />
          <Routes>
            {/* Todo lo de dentro exige sesión: Agora no se navega sin cuenta. */}
            <Route element={<ProtectedRoute />}>
              <Route element={<ConOnboarding />}>
                <Route element={<AppLayout />}>
                <Route index element={<ExplorePage />} />
                <Route path="explorar" element={<Navigate to="/" replace />} />
                <Route path="negocios" element={<BusinessesPage />} />
                {/* La sección se llamó «mercados» hasta el 2026-08-31: se
                    redirige para no romper enlaces ya compartidos. */}
                <Route path="mercados" element={<Navigate to="/negocios" replace />} />
                <Route path="favoritos" element={<FavoritesPage />} />
                <Route path="productos/:id" element={<ProductDetailPage />} />
                <Route path="negocios/:id" element={<EnterprisePage />} />
                <Route path="tiendas/:id" element={<RedirigirANegocio />} />
                <Route path="vender" element={<BecomeSellerPage />} />
                <Route path="cuenta" element={<AccountPage />} />
                <Route path="planes" element={<PlansPage />} />

                <Route element={<RequireSeller />}>
                  <Route path="panel" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="productos" element={<DashboardProducts />} />
                    <Route path="productos/nuevo" element={<ProductFormPage />} />
                    <Route path="productos/:id" element={<ProductFormPage />} />
                    <Route path="servicios" element={<DashboardServices />} />
                    <Route path="servicios/nuevo" element={<ServiceFormPage />} />
                    <Route path="servicios/:id" element={<ServiceFormPage />} />
                    <Route path="empresa" element={<DashboardEnterprise />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>
              </Route>
            </Route>

            {/* Las únicas pantallas visibles sin token. */}
            <Route element={<SoloSinSesion />}>
              <Route path="iniciar-sesion" element={<LoginPage />} />
              <Route path="registrarse" element={<RegisterPage />} />
            </Route>
          </Routes>
          </FavoritesProvider>
        </ToastProvider>
      </AuthProvider>
      </MotionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
