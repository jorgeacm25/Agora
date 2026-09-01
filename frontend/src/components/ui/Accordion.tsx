import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  /** Identificador del bloque, para engancharlo desde fuera. */
  id?: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ id, icon, title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div id={id} className="accordion border-t border-ink-200 last:border-b">
      <button
        onClick={() => setOpen((v) => !v)}
        className="accordion__trigger flex w-full items-center justify-between py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="accordion__label flex items-center gap-2.5 text-sm font-semibold text-ink-900">
          {icon}
          {title}
        </span>
        <ChevronDown size={16} className={cn('text-ink-400 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div
        className="accordion__panel grid overflow-hidden transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="accordion__content pb-4 pl-[26px] text-sm leading-relaxed text-ink-600">{children}</div>
        </div>
      </div>
    </div>
  );
}
