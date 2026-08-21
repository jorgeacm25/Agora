import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatPrice(value: number | null | undefined, currency: 'CUP' | 'USD'): string | null {
  if (value === null || value === undefined) return null;
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return currency === 'USD' ? `$${formatted}` : `${formatted} CUP`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
