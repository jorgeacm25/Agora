import { Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { BusinessCard } from '@/components/business/BusinessCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export function BusinessesPage() {
  const { businesses, isLoading } = useBusinesses();

  return (
    <div id="businesses" className="businesses mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link to="/" className="businesses__back mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} aria-hidden="true" /> Volver a explorar
      </Link>
      <h1 id="businesses__title" className="businesses__title text-2xl font-semibold text-ink-900">Negocios</h1>
      <p id="businesses__count" className="businesses__count mt-1.5 text-sm text-ink-500">
        {isLoading ? 'Cargando…' : `${businesses.length} negocio${businesses.length === 1 ? '' : 's'} publicando en Agora`}
      </p>

      <div id="businesses__grid" className="businesses__grid mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)
          : businesses.map((business) => (
              <BusinessCard key={business.enterprise.idUserEnterprise} business={business} />
            ))}
      </div>

      {!isLoading && businesses.length === 0 && (
        <EmptyState
          icon={<Store size={20} />}
          title="Todavía no hay negocios publicados"
          description="Cuando las mypimes y mercados de tu ciudad publiquen su catálogo, aparecerán aquí."
        />
      )}
    </div>
  );
}
