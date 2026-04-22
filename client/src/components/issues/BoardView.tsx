import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useIssues } from '@/features/issues/hooks';
import { BoardCard } from './BoardCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { IssueStatus } from '@/types/issue';

const PAGE_SIZE = 10;

interface ColConfig {
  key: IssueStatus;
  label: string;
  dot: string;
  headerBg: string;
}

const COLUMNS: ColConfig[] = [
  { key: 'open',        label: 'Open',        dot: 'bg-blue-500',    headerBg: 'bg-blue-50 dark:bg-blue-500/10' },
  { key: 'in_progress', label: 'In Progress', dot: 'bg-amber-500',   headerBg: 'bg-amber-50 dark:bg-amber-500/10' },
  { key: 'resolved',    label: 'Resolved',    dot: 'bg-emerald-500', headerBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { key: 'closed',      label: 'Closed',      dot: 'bg-gray-400',    headerBg: 'bg-gray-50 dark:bg-gray-500/10' },
];

function BoardCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function BoardColumn({ key: status, label, dot, headerBg, onNewIssue, searchQuery }: ColConfig & { onNewIssue: () => void; searchQuery?: string }) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data, isLoading, isFetching } = useIssues({ status, limit, q: searchQuery || undefined });
  const issues = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const hasMore = issues.length < total;

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 ${headerBg}`}>
        <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
        <span className="text-sm font-semibold">{label}</span>
        <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/60 dark:bg-black/20 px-1.5 text-[11px] font-semibold">
          {isLoading ? '…' : total}
        </span>
        <button
          onClick={onNewIssue}
          title="Add issue"
          className="flex h-5 w-5 items-center justify-center rounded-md text-current opacity-60 transition-opacity hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <BoardCardSkeleton key={i} />)
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
            <p className="text-xs text-muted-foreground">No issues</p>
          </div>
        ) : (
          issues.map((issue) => <BoardCard key={issue.id} issue={issue} />)
        )}

        {hasMore && (
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            disabled={isFetching}
            className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
          >
            {isFetching ? 'Loading…' : `Load more (${total - issues.length} remaining)`}
          </button>
        )}
      </div>
    </div>
  );
}

interface BoardViewProps {
  onNewIssue: () => void;
  searchQuery?: string;
}

export const BoardView = ({ onNewIssue, searchQuery }: BoardViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect(); };
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className="absolute left-0 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className="absolute right-0 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="overflow-x-auto pb-3
          [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_hsl(var(--muted))]
          [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-corner]:bg-muted
          [&::-webkit-scrollbar-track]:bg-muted
          [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
      >
        <div className="flex min-w-max gap-4 pt-1 pb-3 pr-4">
          {COLUMNS.map((col) => (
            <BoardColumn key={col.key} {...col} onNewIssue={onNewIssue} searchQuery={searchQuery} />
          ))}
        </div>
      </div>
    </div>
  );
};
