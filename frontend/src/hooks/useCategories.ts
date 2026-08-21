import { useEffect, useState } from 'react';
import { listProducts } from '@/api/product';

export interface CategoryCount {
  category: string;
  count: number;
}

/**
 * Derives the category list from a broad, unfiltered product sample.
 * The backend has no dedicated categories endpoint, so this fetches once
 * on mount rather than reusing the (paginated/filtered) results shown in
 * the main grid, which would under-represent categories.
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listProducts({ limit: 100 })
      .then((data) => {
        if (cancelled) return;
        const counts = new Map<string, number>();
        for (const product of data.products) {
          if (!product.category) continue;
          counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
        }
        const list = Array.from(counts.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);
        setCategories(list);
      })
      .catch(() => setCategories([]))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, isLoading };
}
