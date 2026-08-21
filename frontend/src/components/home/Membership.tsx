import { Link } from 'react-router-dom';
import { Check, ShoppingBag, Store } from 'lucide-react';
import { SELLER_PLAN } from '@/lib/sellerPlan';
import { useAuth } from '@/context/AuthContext';

export function Membership() {
  const { isAuthenticated, isSeller } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-10 max-w-lg">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Membresías</span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900">Elige cómo usar Agora</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-ink-200/80 bg-white p-7">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
            <ShoppingBag size={19} />
          </div>
          <h3 className="text-lg font-semibold text-ink-900">Comprador</h3>
          <p className="mt-1 text-sm text-ink-500">Explora y compara todo el catálogo local.</p>
          <p className="mt-5 text-3xl font-semibold text-ink-900">
            Gratis <span className="text-base font-normal text-ink-400">/ siempre</span>
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-ink-600">
            <li className="flex items-center gap-2"><Check size={14} className="text-ink-900" /> Búsqueda y filtros ilimitados</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-ink-900" /> Ubicación y reseñas de vendedores</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-ink-900" /> Contacto directo con mypimes y mercados</li>
          </ul>
          {isAuthenticated ? (
            <span className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-500">
              Ya tienes esta membresía
            </span>
          ) : (
            <Link
              to="/registrarse"
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-ink-300 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-ink-500"
            >
              Crear cuenta gratis
            </Link>
          )}
        </div>

        <div className="relative rounded-2xl border border-ink-900 bg-ink-950 p-7 text-white">
          <span className="absolute -top-3 right-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-950">
            Para negocios
          </span>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Store size={19} />
          </div>
          <h3 className="text-lg font-semibold">Vendedor</h3>
          <p className="mt-1 text-sm text-white/50">Publica tu catálogo y llega a más clientes.</p>
          <p className="mt-5 text-3xl font-semibold">
            ${SELLER_PLAN.cost} <span className="text-base font-normal text-white/40">/ {SELLER_PLAN.durationDays} días</span>
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-white/70">
            {SELLER_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check size={14} className="text-white" /> {feature}
              </li>
            ))}
          </ul>
          <Link
            to={isSeller ? '/panel' : '/vender'}
            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-medium text-ink-950 transition-transform hover:scale-[1.01]"
          >
            {isSeller ? 'Ir a mi tienda' : 'Empezar a vender'}
          </Link>
        </div>
      </div>
    </section>
  );
}
