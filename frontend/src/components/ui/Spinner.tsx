import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, size = 22 }: { className?: string; size?: number }) {
  return <Loader2 size={size} className={cn('animate-spin text-ink-400', className)} />;
}

export function PageSpinner() {
  return (
    <div id="page-spinner" className="page-spinner flex min-h-[40vh] items-center justify-center">
      <Spinner size={28} />
    </div>
  );
}
