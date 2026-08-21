import { Tag } from 'lucide-react';
import type { CategoryCount } from '@/hooks/useCategories';
import { HorizontalScroller } from '@/components/ui/HorizontalScroller';
import { Skeleton } from '@/components/ui/Skeleton';

interface CategoryTilesProps {
  categories: CategoryCount[];
  isLoading: boolean;
  activeCategory: string | null;
  onSelect: (category: string) => void;
}

export function CategoryTiles({ categories, isLoading, activeCategory, onSelect }: CategoryTilesProps) {
  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
      <h2 className="mb-4 text-base font-semibold text-ink-900">Categorías</h2>
      <HorizontalScroller>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-32 shrink-0 rounded-2xl" />)
          : categories.map(({ category, count }) => (
              <button
                key={category}
                onClick={() => onSelect(category)}
                className={`flex w-32 shrink-0 flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors ${
                  activeCategory === category
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-ink-200 bg-white text-ink-900 hover:border-ink-400'
                }`}
              >
                <Tag size={16} className={activeCategory === category ? 'text-white' : 'text-ink-500'} />
                <span className="line-clamp-1 text-sm font-medium">{category}</span>
                <span className={`text-xs ${activeCategory === category ? 'text-white/60' : 'text-ink-400'}`}>
                  {count} producto{count === 1 ? '' : 's'}
                </span>
              </button>
            ))}
      </HorizontalScroller>
    </section>
  );
}
