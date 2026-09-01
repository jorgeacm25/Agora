import {
  Bath,
  Carrot,
  CupSoda,
  Hammer,
  Pill,
  ShoppingBasket,
  SprayCan,
  Tag,
  Wheat,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CategoryCount } from '@/hooks/useCategories';
import { HorizontalScroller } from '@/components/ui/HorizontalScroller';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

/**
 * Un icono por categoría. La clave se compara sin acentos ni mayúsculas, así
 * que «Ferretería» y «ferreteria» dan lo mismo. Lo que no esté en la lista cae
 * en la etiqueta genérica, que es lo que había antes para todas.
 */
const ICONOS: Record<string, LucideIcon> = {
  alimentos: ShoppingBasket,
  vegetales: Carrot,
  bebidas: CupSoda,
  limpieza: SprayCan,
  farmacia: Pill,
  ferreteria: Hammer,
  'cuidado personal': Bath,
  panaderia: Wheat,
};

function iconoDe(categoria: string): LucideIcon {
  const clave = categoria
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
  return ICONOS[clave] ?? Tag;
}

interface CategoryTilesProps {
  categories: CategoryCount[];
  isLoading: boolean;
  activeCategory: string | null;
  onSelect: (category: string) => void;
}

export function CategoryTiles({ categories, isLoading, activeCategory, onSelect }: CategoryTilesProps) {
  if (!isLoading && categories.length === 0) return null;

  return (
    <section id="categories" className="categories mx-auto max-w-6xl px-4 sm:px-6">
      <h2 id="categories__title" className="categories__title mb-4 text-base font-semibold text-ink-900">Categorías</h2>
      {/* El scroller recorta por sus cuatro lados al llevar overflow. Arriba y
          abajo se resuelve con padding; a la izquierda, sacando el contenedor
          20px fuera de la sangría de la página y devolviéndoselos como margen a
          la primera card, que es la única cuya sombra quedaba cortada. */}
      <HorizontalScroller className="pt-1 pb-5 sm:-ml-5">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-32 shrink-0 rounded-2xl" />
            ))
          : categories.map(({ category, count }, i) => {
              const Icono = iconoDe(category);
              const activa = activeCategory === category;
              // Sin nada elegido, todas van a pleno color. En cuanto hay una
              // elegida, esa se queda con el énfasis y el resto se atenúa.
              const conEnfasis = activa || activeCategory === null;
              return (
                <button
                  key={category}
                  onClick={() => onSelect(category)}
                  aria-pressed={activa}
                  className={cn(
                    'category w-32 shrink-0 overflow-hidden rounded-2xl text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card',
                    i === 0 && 'sm:ml-5',
                  )}
                >
                  <span
                    className={cn(
                      'category__art flex h-16 items-center justify-center text-white transition-colors duration-200',
                      conEnfasis ? 'bg-primary' : 'bg-primary/45',
                    )}
                  >
                    <Icono size={36} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span id={`category__label--${category}`} className="category__label block bg-ink-50 px-2.5 py-2">
                    <span id={`category__name--${category}`} className="category__name block truncate text-xs font-semibold text-ink-900">{category}</span>
                    <span id={`category__count--${category}`} className="category__count block text-[11px] text-ink-500">
                      {count} producto{count === 1 ? '' : 's'}
                    </span>
                  </span>
                </button>
              );
            })}
      </HorizontalScroller>
    </section>
  );
}
