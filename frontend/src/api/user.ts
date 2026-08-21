import { apiClient } from './client';
import type { AuthUser } from '@/types';

export function updatePassword(currentPassword: string, newPassword: string) {
  return apiClient
    .patch<void>('/user/password', { currentPassword, newPassword })
    .then((res) => res.data);
}

export function deleteAccount(userId: string) {
  return apiClient.delete<void>(`/user/${userId}`).then((res) => res.data);
}

export function getUser(id: string) {
  return apiClient.get<AuthUser>(`/user/${id}`).then((res) => res.data);
}
