import { apiClient } from './client';

export interface Subscription {
  idSubscription: string;
  userId: string;
  /**
   * A qué empresa pertenece la suscripción. En el diagrama acordado
   * `Subscription` se conecta con `User` y con `UserEnterprise`, y es esa
   * conexión la que dice de qué tipo es el plan. El backend todavía no la
   * implementa —`subscriptions` solo tiene `userId`—, así que llega vacío y
   * hay que caer en el nombre. Ver `daAccesoDeNegocio`.
   */
  userEnterpriseId?: string | null;
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

/**
 * Quien lleva el estado es el backend: al pedir la suscripción activa la
 * verifica y, si ya venció, la guarda con `status: false`. Lo que no hace es
 * responder 404 en ese caso —devuelve la suscripción caducada—, así que aquí
 * se lee el campo en vez de dar por buena cualquier respuesta.
 */
export function estaVigente(s: Subscription | null | undefined): boolean {
  return Boolean(s?.status);
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
