import { MapPin, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';
import type { CategoryCount } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

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
}: FiltersPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">Filtros</h2>
        {hasActiveFilters && (
          <button onClick={onClear} className="text-xs text-ink-500 hover:text-primary inline-flex items-center gap-1">
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Precio (CUP)</p>
        <div className="flex items-center gap-2">
          <Input placeholder="Mín" inputMode="numeric" value={minPrice} onChange={(e) => onMinPrice(e.target.value.replace(/\D/g, ''))} />
          <span className="text-ink-300">–</span>
          <Input placeholder="Máx" inputMode="numeric" value={maxPrice} onChange={(e) => onMaxPrice(e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Ordenar por precio</p>
        <div className="flex gap-2">
          <button
            onClick={() => onSortOrder('asc')}
            className={cn(
              'flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              sortOrder === 'asc' ? 'border-primary bg-primary text-white' : 'border-ink-200 text-ink-600',
            )}
          >
            Menor a mayor
          </button>
          <button
            onClick={() => onSortOrder('desc')}
            className={cn(
              'flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              sortOrder === 'desc' ? 'border-primary bg-primary text-white' : 'border-ink-200 text-ink-600',
            )}
          >
            Mayor a menor
          </button>
        </div>
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-700">
          <TrendingUp size={14} /> Más populares
        </span>
        <input type="checkbox" checked={popularOnly} onChange={(e) => onPopularOnly(e.target.checked)} className="h-4 w-4 accent-primary" />
      </label>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-ink-700">Solo disponibles</span>
        <input type="checkbox" checked={inStockOnly} onChange={(e) => onInStockOnly(e.target.checked)} className="h-4 w-4 accent-primary" />
      </label>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Ubicación</p>
        <Button variant="outline" size="sm" className="w-full" onClick={onLocateMe} loading={locating} icon={<MapPin size={14} />}>
          {nearMe ? 'Cerca de mí ✓' : 'Buscar cerca de mí'}
        </Button>

        {nearMe && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-700">Distancia máxima</span>
              <span className="text-xs font-bold text-primary">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={radiusKm}
              onChange={(e) => onRadiusKm(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
        )}
      </div>

      {categories.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Categoría</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(({ category: c }) => (
              <button key={c} onClick={() => onSelectCategory(c)}>
                <Badge variant={activeCategory === c ? 'dark' : 'neutral'} className={cn('cursor-pointer', activeCategory === c && 'bg-primary')}>
                  {c}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
