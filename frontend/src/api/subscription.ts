import { apiClient } from './client';

export interface Subscription {
  idSubscription: string;
  userId: string;
  name: string;
  cost: number;
  description: string | null;
  status: boolean;
  quantityAccounts: number;
  durationDays: number;
  createdAt: string;
  expiresAt: string | null;
}

export interface SubscriptionInput {
  userId: string;
  name: string;
  cost: number;
  description?: string;
  quantityAccounts: number;
  durationDays: number;
}

export function getMyActiveSubscription() {
  return apiClient.get<Subscription>('/subscription').then((res) => res.data);
}

export function getMySubscriptionHistory() {
  return apiClient.get<Subscription[]>('/subscription/history').then((res) => res.data);
}

export function createSubscription(input: SubscriptionInput) {
  return apiClient.post<Subscription>('/subscription', input).then((res) => res.data);
}

export function cancelSubscription(id: string) {
  return apiClient.delete<void>(`/subscription/${id}`).then((res) => res.data);
}
