import type { ReactNode } from 'react';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { HorizontalScroller } from '@/components/ui/HorizontalScroller';

interface DiscoveryRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  products: Product[] | null;
}

export function DiscoveryRow({ icon, title, subtitle, products }: DiscoveryRowProps) {
  if (products !== null && products.length === 0) return null;

  return (
    <section id="discovery" className="discovery mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div id="discovery__header" className="discovery__header mb-4 flex items-center gap-2.5">
        <div id="discovery__icon" className="discovery__icon flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-700">{icon}</div>
        <div id="discovery__heading" className="discovery__heading">
          <h2 id="discovery__title" className="discovery__title text-base font-semibold text-ink-900">{title}</h2>
          {subtitle && <p id="discovery__subtitle" className="discovery__subtitle text-xs text-ink-500">{subtitle}</p>}
        </div>
      </div>
      <HorizontalScroller>
        {products === null
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-48 shrink-0">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((product) => (
              <div key={product.idProduct} className="w-48 shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
      </HorizontalScroller>
    </section>
  );
}
