import { useEffect, useState } from 'react';
import { listProducts } from '@/api/product';
import type { UserEnterprise } from '@/types';

export interface BusinessSummary {
  enterprise: UserEnterprise;
  productCount: number;
}

/**
 * Deriva la lista de negocios de una muestra amplia del catálogo, igual que
 * useCategories deriva las categorías: el backend no tiene un endpoint que
 * liste empresas, pero cada producto ya viaja con su `userEnterprise`.
 */
export function useBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listProducts({ limit: 100 })
      .then((data) => {
        if (cancelled) return;
        const byId = new Map<string, BusinessSummary>();
        for (const product of data.products) {
          const enterprise = product.userEnterprise;
          if (!enterprise) continue;
          const existing = byId.get(enterprise.idUserEnterprise);
          if (existing) existing.productCount += 1;
          else byId.set(enterprise.idUserEnterprise, { enterprise, productCount: 1 });
        }
        setBusinesses(Array.from(byId.values()).sort((a, b) => b.productCount - a.productCount));
      })
      .catch(() => setBusinesses([]))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { businesses, isLoading };
}
