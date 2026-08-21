import { API_BASE_URL, apiClient } from './client';
import type { Paginated, Product, ProductFilters } from '@/types';

export interface ProductInput {
  name: string;
  priceCup?: number | null;
  priceUsd?: number | null;
  description: string;
  unit: string;
  stock?: boolean;
  category: string;
  userEnterpriseId: string;
  image?: File | null;
}

function toFormData(input: ProductInput): FormData {
  const form = new FormData();
  form.append('name', input.name);
  form.append('description', input.description);
  form.append('unit', input.unit);
  form.append('category', input.category);
  form.append('userEnterpriseId', input.userEnterpriseId);
  form.append('stock', String(input.stock ?? true));
  if (input.priceCup !== undefined && input.priceCup !== null) {
    form.append('priceCup', String(input.priceCup));
  }
  if (input.priceUsd !== undefined && input.priceUsd !== null) {
    form.append('priceUsd', String(input.priceUsd));
  }
  if (input.image) {
    form.append('image', input.image);
  }
  return form;
}

export function listProducts(filters: ProductFilters = {}) {
  return apiClient
    .get<Paginated<Product>>('/products', { params: filters })
    .then((res) => res.data);
}

export function getProduct(id: string) {
  return apiClient.get<Product>(`/products/${id}`).then((res) => res.data);
}

export function createProduct(input: ProductInput) {
  return apiClient
    .post<Product>('/products', toFormData(input), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}

export function updateProduct(id: string, input: Partial<Omit<ProductInput, 'image'>>) {
  return apiClient.patch<void>(`/products/${id}`, input).then((res) => res.data);
}

export function deleteProduct(id: string) {
  return apiClient.delete<void>(`/products/${id}`).then((res) => res.data);
}

// Product.image is stored as "/products/image/<file>" (relative to the API's
// global "api" prefix), so we splice it onto the API origin ourselves.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function productImageUrl(image: string | null | undefined): string | null {
  if (!image) return null;
  return `${API_ORIGIN}/api${image}`;
}
