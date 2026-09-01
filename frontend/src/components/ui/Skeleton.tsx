import { cn } from '@/lib/utils';

export function Skeleton({ id, className }: { id?: string; className?: string }) {
  return <div id={id} className={cn('skeleton shimmer rounded-lg', className)} />;
}
