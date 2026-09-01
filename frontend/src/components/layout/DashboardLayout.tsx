import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Wrench, Building2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { SellerPitch } from '@/components/dashboard/SellerPitch';
import { daAccesoDeNegocio } from '@/lib/plans';

const links = [
  { to: '/panel', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/panel/productos', label: 'Productos', icon: Package },
  { to: '/panel/servicios', label: 'Servicios', icon: Wrench },
  { to: '/panel/empresa', label: 'Mi empresa', icon: Building2 },
];

export function DashboardLayout() {
  const { enterprise, subscription, puedeAdministrarNegocio } = useAuth();

  // Hace falta un plan que dé negocio y la empresa creada. Sin las dos cosas
  // el panel solo enseñaría ceros, así que en su lugar va la página de venta:
  // también la ve quien tiene su empresa pero pagó un plan de comprador.
  const sinNegocio = !puedeAdministrarNegocio;

  return (
    <div id="dashboard" className="dashboard mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div id="dashboard__header" className="dashboard__header mb-6 flex items-center justify-between">
        <div>
          <NavLink to="/" id="dashboard__back" className="dashboard__back mb-2 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={14} /> Volver a Agora
          </NavLink>
          <h1 id="dashboard__title" className="dashboard__title text-2xl font-semibold text-ink-900">
            {sinNegocio ? 'Vender en Agora' : enterprise?.companyName ?? 'Mi negocio'}
          </h1>
        </div>
      </div>

      {sinNegocio ? (
        <SellerPitch tieneEmpresa={Boolean(enterprise)} yaTienePlan={daAccesoDeNegocio(subscription?.name)} />
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
