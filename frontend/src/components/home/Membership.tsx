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
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-8 max-w-lg">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Membresías</span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900">
          Elige cómo usar <span className="text-primary">Agora</span>
        </h2>
      </div>

      <div className="mb-8 inline-flex gap-1.5 rounded-xl bg-ink-100 p-1">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-ink-200/80 bg-ink-50 p-7">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
            <ShoppingBag size={19} />
          </div>
          <h3 className="text-lg font-semibold text-ink-900">Comprador</h3>
          <p className="mt-1 text-sm text-ink-500">Explora y compara todo el catálogo local.</p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-ink-900">${buyerTier.cost}</span>
            <span className="text-sm text-ink-400">/ {buyerTier.durationDays} días</span>
            {buyerTier.savingsLabel && (
              <span className="ml-auto rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary-dark">{buyerTier.savingsLabel}</span>
            )}
          </div>
          <ul className="mt-6 space-y-2.5 text-sm text-ink-600">
            {BUYER_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check size={14} className="text-primary" /> {feature}
              </li>
            ))}
          </ul>
          {hasActivePlan && !isSeller ? (
            <span className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-500">
              Ya tienes esta membresía
            </span>
          ) : (
            <Link
              to={isAuthenticated ? '/planes' : '/registrarse'}
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl border-2 border-primary py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
            >
              {isAuthenticated ? 'Elegir membresía' : 'Crear cuenta de comprador'}
            </Link>
          )}
        </div>

        <div className="relative rounded-2xl border-2 border-primary bg-primary-light/40 p-7">
          <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            Para negocios
          </span>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <Store size={19} />
          </div>
          <h3 className="text-lg font-semibold text-ink-900">Vendedor</h3>
          <p className="mt-1 text-sm text-ink-500">Publica tu catálogo y que te encuentren.</p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-ink-900">${sellerTier.cost}</span>
            <span className="text-sm text-ink-400">/ {sellerTier.durationDays} días</span>
            {sellerTier.savingsLabel && (
              <span className="ml-auto rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-primary-dark">{sellerTier.savingsLabel}</span>
            )}
          </div>
          <ul className="mt-6 space-y-2.5 text-sm text-ink-600">
            {SELLER_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check size={14} className="text-primary" /> {feature}
              </li>
            ))}
          </ul>
          <Link
            to={isSeller ? '/panel' : '/vender'}
            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {isSeller ? 'Ir a mi tienda' : 'Empezar a vender'}
          </Link>
        </div>
      </div>
    </section>
  );
}
