import { ArrowDownWideNarrow, ArrowUpNarrowWide, MapPin, PackageCheck, SlidersHorizontal, TrendingUp, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CategoryCount } from '@/hooks/useCategories';
import { cn, soloPrecio } from '@/lib/utils';

export type SortOrder = 'asc' | 'desc';

interface FiltersPanelProps {
  minPrice: string;
  maxPrice: string;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  sortOrder: SortOrder;
  onSortOrder: (v: SortOrder) => void;
  popularOnly: boolean;
  onPopularOnly: (v: boolean) => void;
  inStockOnly: boolean;
  onInStockOnly: (v: boolean) => void;
  nearMe: boolean;
  onLocateMe: () => void;
  locating: boolean;
  radiusKm: number;
  onRadiusKm: (v: number) => void;
  categories: CategoryCount[];
  activeCategory: string | null;
  onSelectCategory: (c: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  /** Dónde se pinta este panel: 'aside' o 'sheet'. Distingue los ids. */
  ambito: string;
}

/** Cada criterio es un chip que se enciende. Misma forma para ordenar, acotar y
 *  elegir categoría: en la práctica el usuario hace lo mismo con los tres. */
function Chip({
  id,
  activo,
  onClick,
  children,
  icon,
}: {
  id: string;
  activo: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        'filters__chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200',
        activo ? 'bg-primary text-white' : 'bg-primary/15 text-ink-900 hover:bg-primary/25',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/** El nombre de la categoría viene del backend: se pasa a algo válido como id. */
function identificador(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function Grupo({ nombre, titulo, children }: { nombre: string; titulo: string; children: ReactNode }) {
  return (
    <section id={`filters__group--${nombre}`} className="filters__group">
      <h3 id={`filters__legend--${nombre}`} className="filters__legend mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">{titulo}</h3>
      {children}
    </section>
  );
}

export function FiltersPanel({
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  sortOrder,
  onSortOrder,
  popularOnly,
  onPopularOnly,
  inStockOnly,
  onInStockOnly,
  nearMe,
  onLocateMe,
  locating,
  radiusKm,
  onRadiusKm,
  categories,
  activeCategory,
  onSelectCategory,
  hasActiveFilters,
  onClear,
  ambito,
}: FiltersPanelProps) {
  /** Sufijo que distingue la copia de la columna de la de la hoja móvil. */
  const uid = (nombre: string) => `${nombre}--${ambito}`;
  const campo =
    'h-9 w-full min-w-0 rounded-lg border border-ink-200 bg-ink-50 px-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-primary';

  return (
    <div id={uid('filters')} className="filters space-y-4">
      <header id={uid('filters__header')} className="filters__header flex items-center justify-between gap-2">
        <h2 id={uid('filters__title')} className="filters__title inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
          <SlidersHorizontal size={15} aria-hidden="true" /> Filtros
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            id={uid('filters__clear')} className="filters__clear inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-900"
          >
            <X size={12} aria-hidden="true" /> Limpiar
          </button>
        )}
      </header>

      <Grupo nombre={uid('price')} titulo="Precio en CUP">
        <div id={uid('filters__price')} className="filters__price flex items-center gap-2">
          <input
            inputMode="numeric"
            aria-label="Precio mínimo en CUP"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => onMinPrice(soloPrecio(e.target.value))}
            id={uid('filters__price-min')}
            className={campo}
          />
          <span id={uid('filters__price-sep')} className="filters__price-sep text-ink-400">–</span>
          <input
            inputMode="numeric"
            aria-label="Precio máximo en CUP"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => onMaxPrice(soloPrecio(e.target.value))}
            id={uid('filters__price-max')}
            className={campo}
          />
        </div>
      </Grupo>

      <Grupo nombre={uid('sort')} titulo="Ordenar por precio">
        <div id={uid('filters__sort')} className="filters__sort flex flex-wrap gap-2">
          <Chip id={uid('filters__sort-asc')} activo={sortOrder === 'asc'} onClick={() => onSortOrder('asc')} icon={<ArrowUpNarrowWide size={13} aria-hidden="true" />}>
            Más barato
          </Chip>
          <Chip id={uid('filters__sort-desc')} activo={sortOrder === 'desc'} onClick={() => onSortOrder('desc')} icon={<ArrowDownWideNarrow size={13} aria-hidden="true" />}>
            Más caro
          </Chip>
        </div>
      </Grupo>

      <Grupo nombre={uid('only')} titulo="Mostrar solo">
        <div id={uid('filters__only')} className="filters__only flex flex-wrap gap-2">
          <Chip id={uid('filters__only-popular')} activo={popularOnly} onClick={() => onPopularOnly(!popularOnly)} icon={<TrendingUp size={13} aria-hidden="true" />}>
            Populares
          </Chip>
          <Chip id={uid('filters__only-stock')} activo={inStockOnly} onClick={() => onInStockOnly(!inStockOnly)} icon={<PackageCheck size={13} aria-hidden="true" />}>
            Disponibles
          </Chip>
          <Chip id={uid('filters__only-near')} activo={nearMe} onClick={onLocateMe} icon={<MapPin size={13} aria-hidden="true" />}>
            {locating ? 'Buscando…' : 'Cerca de mí'}
          </Chip>
        </div>

        {nearMe && (
          <label id={uid('filters__radius')} className="filters__radius mt-4 block">
            <span id={uid('filters__radius-label')} className="filters__radius-label mb-1.5 flex items-center justify-between text-xs text-ink-500">
              Distancia máxima
              <span id={uid('filters__radius-value')} className="filters__radius-value font-semibold text-ink-900">{radiusKm} km</span>
            </span>
            <input
              type="range"
              min={1}
              max={20}
              value={radiusKm}
              onChange={(e) => onRadiusKm(Number(e.target.value))}
              id={uid('filters__radius-input')}
              className="filters__radius-input w-full accent-primary"
            />
          </label>
        )}
      </Grupo>

      {categories.length > 0 && (
        <Grupo nombre={uid('category')} titulo="Categoría">
          <div id={uid('filters__categories')} className="filters__categories flex flex-wrap gap-2">
            {categories.map(({ category: c, count }) => {
              const activa = activeCategory === c;
              // Sin nada elegido van todas a pleno color; al elegir una, esa se
              // queda con el énfasis y el resto se atenúa.
              const conEnfasis = activa || activeCategory === null;
              return (
                <button
                  key={c}
                  onClick={() => onSelectCategory(c)}
                  aria-pressed={activa}
                  id={uid(`category-chip--${identificador(c)}`)}
                  className={cn(
                    'category-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium transition-colors duration-200',
                    conEnfasis ? 'bg-primary text-white' : 'bg-primary/15 text-ink-900 hover:bg-primary/25',
                  )}
                >
                  {c}
                  <span id={uid(`category-chip__count--${identificador(c)}`)} className="category-chip__count rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-neutral-900">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Grupo>
      )}
    </div>
  );
}
