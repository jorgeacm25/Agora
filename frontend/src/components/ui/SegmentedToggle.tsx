import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Option<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
}

interface SegmentedToggleProps<T extends string> {
  /** Identificador del bloque, para engancharlo desde fuera. */
  id?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedToggle<T extends string>({ id, options, value, onChange, className }: SegmentedToggleProps<T>) {
  return (
    <div id={id} className={cn('segmented inline-flex gap-1 rounded-xl bg-ink-100 p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            value === opt.value ? 'bg-ink-50 text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800',
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
