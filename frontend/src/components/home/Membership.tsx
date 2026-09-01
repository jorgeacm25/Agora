import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag, Store } from 'lucide-react';
import { BUYER_PLAN, SELLER_PLAN, CYCLE_LABELS, getTier } from '@/lib/plans';
import type { BillingCycle } from '@/lib/plans';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'yearly'];

export function Membership() {
  const { isAuthenticated, isSeller, subscription } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  const buyerTier = getTier(BUYER_PLAN, cycle);
  const sellerTier = getTier(SELLER_PLAN, cycle);
  const hasActivePlan = isAuthenticated && Boolean(subscription);

  return (
    <section id="plans" className="plans mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div id="plans__intro" className="plans__intro mb-8 max-w-lg">
        <span id="plans__eyebrow" className="plans__eyebrow text-xs font-semibold uppercase tracking-wider text-ink-500">Membresías</span>
        <h2 id="plans__title" className="plans__title mt-2 text-2xl sm:text-3xl font-semibold text-ink-900">
          Elige cómo usar <span className="font-bold">Agora</span>
        </h2>
      </div>

      <div id="plans__toggle" className="plans__toggle mb-8 inline-flex gap-1.5 rounded-xl bg-ink-100 p-1">
        {CYCLES.map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              cycle === c ? 'bg-ink-50 text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {CYCLE_LABELS[c]}
          </button>
        ))}
      </div>

      <div id="plans__grid" className="plans__grid grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div id="plans__buyer" className="plans__buyer rounded-2xl border border-ink-200/80 bg-ink-50 p-7">
          <div id="plans__buyer-icon" className="plans__buyer-icon mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
            <ShoppingBag size={19} />
          </div>
          <h3 id="plans__buyer-title" className="plans__buyer-title text-lg font-semibold text-ink-900">Comprador</h3>
          <p id="plans__buyer-subtitle" className="plans__buyer-subtitle mt-1 text-sm text-ink-500">Explora y compara todo el catálogo local.</p>
          <div id="plans__buyer-price" className="plans__buyer-price mt-5 flex items-baseline gap-2">
            <span id="plans__buyer-cost" className="plans__buyer-cost text-3xl font-semibold text-ink-900">${buyerTier.cost}</span>
            <span id="plans__buyer-period" className="plans__buyer-period text-sm text-ink-500">/ {buyerTier.durationDays} días</span>
            {/* Un ahorro ES una promoción: aquí el fucsia sí está en su sitio,
                en la variante oscura, que es la que pasa contraste con blanco. */}
            {buyerTier.savingsLabel && (
              <span id="plans__buyer-savings" className="plans__buyer-savings ml-auto rounded-full bg-secondary-dark px-2.5 py-1 text-xs font-semibold text-white">{buyerTier.savingsLabel}</span>
            )}
          </div>
          <ul id="plans__buyer-features" className="plans__buyer-features mt-6 space-y-2.5 text-sm text-ink-600">
            {BUYER_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check size={14} className="text-ink-400" /> {feature}
              </li>
            ))}
          </ul>
          {hasActivePlan && !isSeller ? (
            <span id="plans__buyer-cta" className="plans__buyer-cta mt-7 inline-flex w-full items-center justify-center rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-500">
              Ya tienes esta membresía
            </span>
          ) : (
            <Link
              to={isAuthenticated ? '/planes' : '/registrarse'}
              // Acción secundaria del bloque: el índigo sólido se lo queda la
              // tarjeta de vendedor, que es la conversión que importa.
              id="plans__buyer-link" className="plans__buyer-link mt-7 inline-flex w-full items-center justify-center rounded-xl border border-ink-300 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-400 hover:bg-ink-100"
            >
              {isAuthenticated ? 'Elegir membresía' : 'Crear cuenta de comprador'}
            </Link>
          )}
        </div>

        <div id="plans__seller" className="plans__seller relative rounded-2xl border-2 border-primary bg-primary-light/40 p-7">
          <span id="plans__seller-badge" className="plans__seller-badge absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            Para negocios
          </span>
          <div id="plans__seller-icon" className="plans__seller-icon mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <Store size={19} />
          </div>
          <h3 id="plans__seller-title" className="plans__seller-title text-lg font-semibold text-ink-900">Vendedor</h3>
          <p id="plans__seller-subtitle" className="plans__seller-subtitle mt-1 text-sm text-ink-500">Publica tu catálogo y que te encuentren.</p>
          <div id="plans__seller-price" className="plans__seller-price mt-5 flex items-baseline gap-2">
            <span id="plans__seller-cost" className="plans__seller-cost text-3xl font-semibold text-ink-900">${sellerTier.cost}</span>
            <span id="plans__seller-period" className="plans__seller-period text-sm text-ink-500">/ {sellerTier.durationDays} días</span>
            {sellerTier.savingsLabel && (
              <span id="plans__seller-savings" className="plans__seller-savings ml-auto rounded-full bg-secondary-dark px-2.5 py-1 text-xs font-semibold text-white">{sellerTier.savingsLabel}</span>
            )}
          </div>
          <ul id="plans__seller-features" className="plans__seller-features mt-6 space-y-2.5 text-sm text-ink-600">
            {SELLER_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check size={14} className="text-ink-400" /> {feature}
              </li>
            ))}
          </ul>
          <Link
            to={isSeller ? '/panel' : '/vender'}
            id="plans__seller-cta" className="plans__seller-cta mt-7 inline-flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {isSeller ? 'Ir a mi negocio' : 'Empezar a vender'}
          </Link>
        </div>
      </div>
    </section>
  );
}
