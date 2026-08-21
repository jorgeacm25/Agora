import { apiClient } from './client';
import type { LoginResponse } from '@/types';

export function login(username: string, password: string) {
  return apiClient
    .post<LoginResponse>('/auth/login', { username, password })
    .then((res) => res.data);
}

export function register(username: string, password: string) {
  return apiClient.post<void>('/user', { username, password }).then((res) => res.data);
}
