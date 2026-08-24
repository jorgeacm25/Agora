import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-ink-200/80 bg-ink-50 shadow-card', className)}
      {...props}
    />
  );
}

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: 'neutral' | 'dark' | 'outline' | 'success' | 'danger' }) {
  const variants = {
    neutral: 'bg-ink-100 text-ink-700',
    dark: 'bg-neutral-900 text-white',
    outline: 'border border-ink-300 text-ink-600',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
