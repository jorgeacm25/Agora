import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** Identificador del bloque, para engancharlo desde fuera. */
  id?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ id, icon, title, description, action }: EmptyStateProps) {
  return (
    <div id={id} className="empty flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center">
      {icon && <div className="empty__icon flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">{icon}</div>}
      <div className="empty__body">
        <p className="empty__title font-medium text-ink-900">{title}</p>
        {description && <p className="empty__description mt-1 text-sm text-ink-500 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
