import { apiClient } from './client';
import type { Rating } from '@/types';

export function listRatingsByProduct(productId: string) {
  return apiClient.get<Rating[]>(`/ratings/product/${productId}`).then((res) => res.data);
}

export function listRatingsByService(serviceId: string) {
  return apiClient.get<Rating[]>(`/ratings/service/${serviceId}`).then((res) => res.data);
}

export function createRating(input: { quantity: number; userId: string; productId?: string; serviceId?: string }) {
  return apiClient.post<Rating>('/ratings', input).then((res) => res.data);
}

export function updateRating(id: string, quantity: number) {
  return apiClient.patch<Rating>(`/ratings/${id}`, { quantity }).then((res) => res.data);
}

export function deleteRating(id: string) {
  return apiClient.delete<void>(`/ratings/${id}`).then((res) => res.data);
}

export function averageRating(ratings: Rating[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r.quantity, 0) / ratings.length;
}
