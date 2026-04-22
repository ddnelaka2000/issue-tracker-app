import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IPagination {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function buildWindow(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export const Pagination = ({ page, totalPages, total, limit, onPageChange, className }: IPagination) => {
  if (totalPages <= 1) return null;

  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);
  const window = buildWindow(page, totalPages);

  return (
    <nav
      className={cn(
        'flex flex-col items-center justify-between gap-3 sm:flex-row',
        className,
      )}
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">{rangeStart}</span>–
        <span className="font-medium text-foreground">{rangeEnd}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {window.map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className="w-9"
            >
              {p}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};
