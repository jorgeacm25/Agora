import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShoppingBag, Star, Store } from 'lucide-react';
import { listProducts } from '@/api/product';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';

export function LandingPage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    listProducts({ limit: 6 })
      .then((data) => setFeatured(data.products))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden surface-gradient bg-grid">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
              Compra y vende local
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-semibold leading-tight text-white">
              El mercado de tu ciudad, <span className="text-white/50">en un solo lugar</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
              Agora conecta compradores con mypimes y mercados locales. Encuentra productos cerca de ti o publica tu catálogo y llega a más clientes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/explorar">
                <Button size="lg" variant="secondary" className="bg-white text-ink-950 hover:bg-ink-100" icon={<ShoppingBag size={17} />}>
                  Explorar productos
                </Button>
              </Link>
              <Link to="/vender">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" icon={<Store size={17} />}>
                  Quiero vender
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Feature icon={<MapPin size={18} />} title="Cerca de ti" description="Filtra productos por ubicación y encuentra lo que necesitas en tu zona." />
          <Feature icon={<Star size={18} />} title="Con reseñas reales" description="Compra con confianza gracias a las calificaciones de otros compradores." />
          <Feature icon={<Store size={18} />} title="Mypimes y mercados" description="Publica tu catálogo con precios, stock y ubicación en minutos." />
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink-900">Productos destacados</h2>
            <Link to="/explorar" className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-ink-900">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {featured.map((product) => (
              <ProductCard key={product.idProduct} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Feature({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-ink-200/80 bg-white p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-700">{icon}</div>
      <h3 className="font-medium text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-500">{description}</p>
    </div>
  );
}
