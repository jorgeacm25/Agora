import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        icon={<ChevronLeft size={15} />}
      >
        Anterior
      </Button>
      <span className="text-sm text-ink-500">
        Página <span className="font-medium text-ink-900">{page}</span> de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Siguiente
        <ChevronRight size={15} />
      </Button>
    </div>
  );
}
