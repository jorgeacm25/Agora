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
    <div id="pagination" className="pagination flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        icon={<ChevronLeft size={15} />}
      >
        Anterior
      </Button>
      <span id="pagination__status" className="pagination__status text-sm text-ink-500">
        Página <span id="pagination__page" className="pagination__page font-medium text-ink-900">{page}</span> de {totalPages}
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
