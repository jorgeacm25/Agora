import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Wrench, Building2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { SellerPitch } from '@/components/dashboard/SellerPitch';

const links = [
  { to: '/panel', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/panel/productos', label: 'Productos', icon: Package },
  { to: '/panel/servicios', label: 'Servicios', icon: Wrench },
  { to: '/panel/empresa', label: 'Mi empresa', icon: Building2 },
];

export function DashboardLayout() {
  const { enterprise, subscription } = useAuth();

  // Sin plan activo el panel solo enseñaría ceros y un «Inactivo» al final. En
  // su lugar se explica para qué sirve cada sección y cuánto cuesta activarla.
  const sinPlan = !subscription;

  return (
    <div id="dashboard" className="dashboard mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div id="dashboard__header" className="dashboard__header mb-6 flex items-center justify-between">
        <div>
          <NavLink to="/" id="dashboard__back" className="dashboard__back mb-2 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={14} /> Volver a Agora
          </NavLink>
          <h1 id="dashboard__title" className="dashboard__title text-2xl font-semibold text-ink-900">
            {sinPlan ? 'Vender en Agora' : enterprise?.companyName ?? 'Mi negocio'}
          </h1>
        </div>
      </div>

      {sinPlan ? (
        <SellerPitch />
      ) : (
      <div id="dashboard__layout" className="dashboard__layout flex flex-col md:flex-row gap-8">
        <nav id="dashboard__nav" className="dashboard__nav flex md:flex-col gap-1 md:w-52 shrink-0 overflow-x-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  // Sección activa = estado. El índigo del panel se lo queda
                  // "Publicar producto", que es la acción que importa aquí.
                  isActive ? 'bg-ink-900 text-ink-50' : 'text-ink-600 hover:bg-ink-100',
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div id="dashboard__content" className="dashboard__content flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
      )}
    </div>
  );
}
