import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function HorizontalScroller({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-4 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      {children}
    </div>
  );
}
