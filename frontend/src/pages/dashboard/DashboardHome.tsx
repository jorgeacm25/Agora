import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Package, Wrench, CalendarClock, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMyProducts, useMyServices } from '@/hooks/useMyCatalog';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function DashboardHome() {
  const { subscription } = useAuth();
  const { products } = useMyProducts();
  const { services } = useMyServices();

  const daysLeft = subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Package size={18} />} label="Productos" value={products.length} />
        <StatCard icon={<Wrench size={18} />} label="Servicios" value={services.length} />
        <StatCard
          icon={<CalendarClock size={18} />}
          label="Plan vendedor"
          value={daysLeft !== null ? `${daysLeft} días` : subscription ? 'Activo' : 'Inactivo'}
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink-900">Acciones rápidas</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/panel/productos/nuevo">
            <Button icon={<Plus size={15} />}>Publicar producto</Button>
          </Link>
          <Link to="/panel/servicios/nuevo">
            <Button variant="outline" icon={<Plus size={15} />}>Publicar servicio</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-700">{icon}</div>
      <p className="text-2xl font-semibold text-ink-900">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </Card>
  );
}
