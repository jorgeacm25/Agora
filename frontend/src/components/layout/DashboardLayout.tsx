import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Wrench, Building2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const links = [
  { to: '/panel', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/panel/productos', label: 'Productos', icon: Package },
  { to: '/panel/servicios', label: 'Servicios', icon: Wrench },
  { to: '/panel/empresa', label: 'Mi empresa', icon: Building2 },
];

export function DashboardLayout() {
  const { enterprise } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <NavLink to="/" className="mb-2 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={14} /> Volver a Agora
          </NavLink>
          <h1 className="text-2xl font-semibold text-ink-900">{enterprise?.companyName ?? 'Mi tienda'}</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <nav className="flex md:flex-col gap-1 md:w-52 shrink-0 overflow-x-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-white' : 'text-ink-600 hover:bg-ink-100',
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
