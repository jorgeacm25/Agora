import { Tag } from 'lucide-react';
import type { CategoryCount } from '@/hooks/useCategories';
import { HorizontalScroller } from '@/components/ui/HorizontalScroller';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface CategoryTilesProps {
  categories: CategoryCount[];
  isLoading: boolean;
  activeCategory: string | null;
  onSelect: (category: string) => void;
}

const TINTS = [
  { bg: 'bg-primary-light', fg: 'text-primary' },
  { bg: 'bg-secondary-light', fg: 'text-secondary' },
  { bg: 'bg-emerald-50', fg: 'text-emerald-600' },
  { bg: 'bg-purple-50', fg: 'text-purple-600' },
  { bg: 'bg-rose-50', fg: 'text-rose-600' },
  { bg: 'bg-amber-50', fg: 'text-amber-600' },
];

export function CategoryTiles({ categories, isLoading, activeCategory, onSelect }: CategoryTilesProps) {
  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
      <h2 className="mb-4 text-base font-semibold text-ink-900">Categorías</h2>
      <HorizontalScroller>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex w-16 shrink-0 flex-col items-center gap-2">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
            ))
          : categories.map(({ category, count }, i) => {
              const active = activeCategory === category;
              const tint = TINTS[i % TINTS.length];
              return (
                <button
                  key={category}
                  onClick={() => onSelect(category)}
                  className="flex w-16 shrink-0 flex-col items-center gap-2 text-center"
                >
                  <span
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                      active ? 'bg-primary text-white' : `${tint.bg} ${tint.fg}`,
                    )}
                  >
                    <Tag size={22} strokeWidth={1.8} />
                  </span>
                  <span className={cn('line-clamp-1 text-[11.5px] font-semibold', active ? 'text-primary' : 'text-ink-700')}>
                    {category}
                  </span>
                  <span className="text-[10px] text-ink-400">{count}</span>
                </button>
              );
            })}
      </HorizontalScroller>
    </section>
  );
}
