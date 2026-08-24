import type { InternalAxiosRequestConfig } from 'axios';
import type { Paginated, Product, ProductFilters } from '@/types';
import { MOCK_PRODUCTS, MOCK_SERVICES, findMockEnterprise, findMockProduct, mockRatingsFor } from '@/lib/mockData';

/**
 * Local-dev-only fallback: when the real backend isn't reachable (no
 * response at all — connection refused, not a 4xx/5xx from a real
 * server), serve read-only sample data instead of an error screen, so the
 * app has something to look at right after cloning it. A real backend
 * response is never intercepted or replaced.
 */
export function tryMockResponse(config: InternalAxiosRequestConfig): unknown {
  if (config.method?.toLowerCase() !== 'get') return undefined;
  const url = (config.url ?? '').split('?')[0].replace(/\/+$/, '');

  if (url === '/products') {
    return mockListProducts((config.params ?? {}) as ProductFilters);
  }
  const productMatch = url.match(/^\/products\/([\w-]+)$/);
  if (productMatch) return findMockProduct(productMatch[1]);

  const ratingsMatch = url.match(/^\/ratings\/product\/([\w-]+)$/);
  if (ratingsMatch) return mockRatingsFor(ratingsMatch[1]);

  const enterpriseMatch = url.match(/^\/user-enterprise\/([\w-]+)$/);
  if (enterpriseMatch) return findMockEnterprise(enterpriseMatch[1]);

  if (url.match(/^\/services\/enterprise\/[\w-]+$/) || url === '/services') {
    return MOCK_SERVICES;
  }

  return undefined;
}

function mockListProducts(filters: ProductFilters): Paginated<Product> {
  let list = MOCK_PRODUCTS;
  if (filters.minPrice != null) list = list.filter((p) => (p.priceUsd ?? 0) >= filters.minPrice!);
  if (filters.maxPrice != null) list = list.filter((p) => (p.priceUsd ?? 0) <= filters.maxPrice!);
  if (filters.minRating != null) {
    list = list.filter((p) => {
      const ratings = mockRatingsFor(p.idProduct);
      if (ratings.length === 0) return false;
      const avg = ratings.reduce((sum, r) => sum + r.quantity, 0) / ratings.length;
      return avg >= filters.minRating!;
    });
  }
  const total = list.length;
  const limit = filters.limit ?? total;
  const page = filters.page ?? 1;
  const start = (page - 1) * limit;
  return { products: list.slice(start, start + limit), total };
}
