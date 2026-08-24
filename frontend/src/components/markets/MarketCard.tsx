import { Link } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';
import type { MarketSummary } from '@/hooks/useMarkets';
import { initials } from '@/lib/utils';

export function MarketCard({ market }: { market: MarketSummary }) {
  const { enterprise, productCount } = market;

  return (
    <Link
      to={`/tiendas/${enterprise.idUserEnterprise}`}
      className="group flex flex-col gap-3 rounded-2xl border border-ink-200/80 bg-ink-50 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lift"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
          {initials(enterprise.companyName)}
        </span>
        <div className="min-w-0">
          <h3 className="line-clamp-1 font-medium text-ink-900">{enterprise.companyName}</h3>
          {enterprise.address && (
            <p className="flex items-center gap-1 text-xs text-ink-500">
              <MapPin size={11} className="shrink-0" />
              <span className="line-clamp-1">
                {enterprise.address.city}, {enterprise.address.state}
              </span>
            </p>
          )}
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        <Package size={12} />
        {productCount} producto{productCount === 1 ? '' : 's'} publicado{productCount === 1 ? '' : 's'}
      </p>
    </Link>
  );
}
