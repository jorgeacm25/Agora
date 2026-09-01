import { Link } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';
import type { BusinessSummary } from '@/hooks/useBusinesses';
import { initials } from '@/lib/utils';

export function BusinessCard({ business }: { business: BusinessSummary }) {
  const { enterprise, productCount } = business;

  return (
    <Link
      id={`business--${enterprise.idUserEnterprise}`}
      to={`/negocios/${enterprise.idUserEnterprise}`}
      className="business group flex flex-col gap-3 rounded-2xl border border-ink-200/80 bg-ink-50 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lift"
    >
      <div id={`business__header--${enterprise.idUserEnterprise}`} className="business__header flex items-center gap-3">
        <span id={`business__initials--${enterprise.idUserEnterprise}`} className="business__initials flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
          {initials(enterprise.companyName)}
        </span>
        <div id={`business__identity--${enterprise.idUserEnterprise}`} className="business__identity min-w-0">
          <h2 id={`business__name--${enterprise.idUserEnterprise}`} className="business__name line-clamp-1 font-medium text-ink-900">{enterprise.companyName}</h2>
          {enterprise.address && (
            <p id={`business__place--${enterprise.idUserEnterprise}`} className="business__place flex items-center gap-1 text-xs text-ink-500">
              <MapPin size={11} className="shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">
                {enterprise.address.city}, {enterprise.address.state}
              </span>
            </p>
          )}
        </div>
      </div>
      <p id={`business__count--${enterprise.idUserEnterprise}`} className="business__count flex items-center gap-1.5 text-xs font-medium text-ink-500">
        <Package size={12} aria-hidden="true" />
        {productCount} producto{productCount === 1 ? '' : 's'} publicado{productCount === 1 ? '' : 's'}
      </p>
    </Link>
  );
}
