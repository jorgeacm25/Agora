import { Skeleton } from '@/components/ui/Skeleton';

export function ProductCardSkeleton() {
  return (
    <div id="product" className="product product--loading flex h-full flex-col overflow-hidden rounded-xl border border-ink-200/80 bg-ink-50">
      <Skeleton className="aspect-[4/3] w-full flex-auto min-h-0 rounded-none" />
      <div className="flex flex-col gap-1.5 p-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mt-1 h-5 w-16" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
