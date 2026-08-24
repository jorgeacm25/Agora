import { Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import { useMarkets } from '@/hooks/useMarkets';
import { MarketCard } from '@/components/markets/MarketCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export function MarketsPage() {
  const { markets, isLoading } = useMarkets();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Volver a explorar
      </Link>
      <h1 className="text-2xl font-semibold text-ink-900">Mercados y mypimes</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        {isLoading ? 'Cargando…' : `${markets.length} negocio${markets.length === 1 ? '' : 's'} publicando en Agora`}
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)
          : markets.map((market) => <MarketCard key={market.enterprise.idUserEnterprise} market={market} />)}
      </div>

      {!isLoading && markets.length === 0 && (
        <EmptyState
          icon={<Store size={20} />}
          title="Todavía no hay mercados publicados"
          description="Cuando las mypimes y mercados de tu ciudad publiquen su catálogo, aparecerán aquí."
        />
      )}
    </div>
  );
}
