import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Logo({ id = 'logo', className, dark = false }: { id?: string; className?: string; dark?: boolean }) {
  return (
    <Link to="/" id={id} className={cn('logo inline-flex items-center gap-2 select-none', className)}>
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold',
          dark ? 'bg-white text-primary' : 'bg-primary text-white',
        )}
      >
        A
      </span>
      <span className={cn('logo__word text-[1.05rem] font-semibold tracking-tight', dark ? 'text-white' : 'text-ink-900')}>
        Agora
      </span>
    </Link>
  );
}
