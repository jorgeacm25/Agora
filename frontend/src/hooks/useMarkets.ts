import { useEffect, useState } from 'react';
import { listProducts } from '@/api/product';
import type { UserEnterprise } from '@/types';

export interface MarketSummary {
  enterprise: UserEnterprise;
  productCount: number;
}

/**
 * Derives the list of markets/mypimes from a broad product sample, the same
 * way useCategories derives categories — the backend has no dedicated
 * "list all enterprises" endpoint, but every product already carries its
 * userEnterprise, so this dedupes that instead of fabricating data.
 */
export function useMarkets() {
  const [markets, setMarkets] = useState<MarketSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listProducts({ limit: 100 })
      .then((data) => {
        if (cancelled) return;
        const byId = new Map<string, MarketSummary>();
        for (const product of data.products) {
          const enterprise = product.userEnterprise;
          if (!enterprise) continue;
          const existing = byId.get(enterprise.idUserEnterprise);
          if (existing) existing.productCount += 1;
          else byId.set(enterprise.idUserEnterprise, { enterprise, productCount: 1 });
        }
        setMarkets(Array.from(byId.values()).sort((a, b) => b.productCount - a.productCount));
      })
      .catch(() => setMarkets([]))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { markets, isLoading };
}
