import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
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

/**
 * Deja pasar solo lo que puede ser un precio mientras se escribe.
 *
 * Filtra al teclear en vez de avisar al enviar, porque una letra en un precio
 * no es una duda que resolver: es una tecla que sobra. Acepta la coma como
 * separador —en el teclado numérico está más a mano que el punto— y la
 * convierte, admite un solo separador y corta en dos decimales, que es lo que
 * el backend guarda.
 */
export function soloPrecio(valor: string): string {
  const limpio = valor.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [entera, ...resto] = limpio.split('.');
  if (resto.length === 0) return entera;
  return `${entera}.${resto.join('').slice(0, 2)}`;
}
