import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2 select-none', className)}>
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold',
          dark ? 'bg-white text-ink-950' : 'bg-gradient-to-br from-ink-800 to-ink-950 text-white',
        )}
      >
        A
      </span>
      <span className={cn('text-[1.05rem] font-semibold tracking-tight', dark ? 'text-white' : 'text-ink-900')}>
        Agora
      </span>
    </Link>
  );
}
