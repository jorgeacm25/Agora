import { apiClient } from './client';
import type { Service } from '@/types';

export interface ServiceInput {
  name: string;
  priceCup?: number | null;
  priceUsd?: number | null;
  description: string;
  userEnterpriseId: string;
}

export function listServices() {
  return apiClient.get<Service[]>('/services').then((res) => res.data);
}

export function listServicesByEnterprise(enterpriseId: string) {
  return apiClient.get<Service[]>(`/services/enterprise/${enterpriseId}`).then((res) => res.data);
}

export function getService(id: string) {
  return apiClient.get<Service>(`/services/${id}`).then((res) => res.data);
}

export function createService(input: ServiceInput) {
  return apiClient.post<Service>('/services', input).then((res) => res.data);
}

export function updateService(id: string, input: Partial<ServiceInput>) {
  return apiClient.patch<void>(`/services/${id}`, input).then((res) => res.data);
}

export function deleteService(id: string) {
  return apiClient.delete<void>(`/services/${id}`).then((res) => res.data);
}
