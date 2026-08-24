import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute, RequireSeller } from '@/components/layout/ProtectedRoute';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ExplorePage } from '@/pages/explore/ExplorePage';
import { MarketsPage } from '@/pages/markets/MarketsPage';
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

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <FavoritesProvider>
          <OnboardingGate>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<ExplorePage />} />
              <Route path="explorar" element={<Navigate to="/" replace />} />
              <Route path="mercados" element={<MarketsPage />} />
              <Route path="favoritos" element={<FavoritesPage />} />
              <Route path="productos/:id" element={<ProductDetailPage />} />
              <Route path="tiendas/:id" element={<EnterprisePage />} />
              <Route path="vender" element={<BecomeSellerPage />} />

              <Route element={<ProtectedRoute />}>
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
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="iniciar-sesion" element={<LoginPage />} />
            <Route path="registrarse" element={<RegisterPage />} />
          </Routes>
          </OnboardingGate>
          </FavoritesProvider>
        </ToastProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
