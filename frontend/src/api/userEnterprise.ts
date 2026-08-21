import { apiClient } from './client';
import type { UserEnterprise, Address, Contact } from '@/types';

export interface UserEnterpriseInput {
  companyName: string;
  address: Address;
  contact: Contact;
  code?: number;
}

export function createEnterprise(input: UserEnterpriseInput) {
  return apiClient.post<UserEnterprise>('/user-enterprise', input).then((res) => res.data);
}

export function getMyEnterprise() {
  return apiClient.get<UserEnterprise>('/user-enterprise').then((res) => res.data);
}

export function getEnterprise(id: string) {
  return apiClient.get<UserEnterprise>(`/user-enterprise/${id}`).then((res) => res.data);
}

export function updateEnterprise(id: string, input: Partial<UserEnterpriseInput>) {
  return apiClient.patch<UserEnterprise>(`/user-enterprise/${id}`, input).then((res) => res.data);
}

export function deleteEnterprise(id: string) {
  return apiClient.delete<void>(`/user-enterprise/${id}`).then((res) => res.data);
}
