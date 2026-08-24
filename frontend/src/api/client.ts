import axios, { AxiosError } from 'axios';
import { tryMockResponse } from './mockFallback';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const TOKEN_KEY = 'agora_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    // Dev-only convenience: if the real backend simply isn't reachable
    // (no response at all — not a real 4xx/5xx), fall back to local sample
    // data so the app isn't just error toasts right after `git clone`.
    if (import.meta.env.DEV && !error.response && error.config) {
      const mocked = tryMockResponse(error.config);
      if (mocked !== undefined) {
        return Promise.resolve({
          data: mocked,
          status: 200,
          statusText: 'OK (mock)',
          headers: {},
          config: error.config,
        });
      }
    }
    const status = error.response?.status ?? 0;
    const raw = error.response?.data?.message;
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : raw ?? error.message ?? 'Ocurrió un error inesperado';
    return Promise.reject(new ApiError(message, status));
  },
);
