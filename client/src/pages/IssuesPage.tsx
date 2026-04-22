import { useState } from 'react';
import { Download, FileJson, Inbox, KanbanSquare, LayoutList, Plus, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { IssueFilters } from '@/components/issues/IssueFilters';
import { IssueCard } from '@/components/issues/IssueCard';
import { IssueCardSkeleton } from '@/components/issues/IssueCardSkeleton';
import { BoardView } from '@/components/issues/BoardView';
import { IssueFormModal } from '@/components/issues/IssueFormModal';
import { StatCard, STAT_CONFIG } from '@/components/issues/StatCard';
import { StatusRingChart } from '@/components/issues/StatusRingChart';
import {
  fetchAllIssuesForExport,
  useCreateIssue,
  useIssueStats,
  useIssues,
} from '@/features/issues/hooks';
import { exportIssuesToCsv, exportIssuesToJson } from '@/lib/export';
import { getErrorMessage } from '@/lib/api';
import { PAGE_SIZE } from '@/constants/issue';
import { useFiltersFromUrl } from '@/hooks/useFiltersFromUrl';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'board';

export const IssuesPage = () => {
  const { filters, page, sort, setFilters, setPage, setSort } = useFiltersFromUrl();
  const [exporting, setExporting] = useState(false);
  const [view, setView] = useState<ViewMode>('list');
  const [showNewModal, setShowNewModal] = useState(false);
  const create = useCreateIssue();

  const stats = useIssueStats();
  const list = useIssues({ ...filters, page, limit: PAGE_SIZE, sort });

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const issues = await fetchAllIssuesForExport();
      if (format === 'csv') exportIssuesToCsv(issues);
      else exportIssuesToJson(issues);
      toast.success(`Exported ${issues.length} issue${issues.length === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const items = list.data?.items ?? [];
  const pagination = list.data?.pagination;
  const isInitialLoad = list.isLoading && !list.data;
  const hasActiveFilters =
    !!filters.q || !!filters.status || !!filters.priority || !!filters.severity;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Issues</h1>
          <p className="text-sm text-muted-foreground">
            Track, filter, and resolve what matters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            {([
              { mode: 'list', icon: LayoutList, label: 'List' },
              { mode: 'board', icon: KanbanSquare, label: 'Board' },
            ] as const).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all',
                  view === mode
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={exporting}>
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting…' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleExport('csv')}>
                <Download className="h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExport('json')}>
                <FileJson className="h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => setShowNewModal(true)}>
            <Plus className="h-4 w-4" />
            New issue
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          {STAT_CONFIG.map((cfg) => (
            <StatCard
              key={cfg.key}
              label={cfg.label}
              value={stats.data?.[cfg.key]}
              icon={cfg.icon}
              accent={cfg.accent}
              bg={cfg.bg}
              activeBorder={cfg.activeBorder}
              active={view === 'list' && filters.status === cfg.key}
              onClick={() => {
                setView('list');
                setFilters({
                  ...filters,
                  status: filters.status === cfg.key ? '' : cfg.key,
                });
              }}
            />
          ))}
        </div>
        <StatusRingChart
          counts={stats.data}
          isLoading={stats.isLoading}
          activeStatus={view === 'list' ? filters.status ?? '' : ''}
          onSegmentClick={(status) => {
            setView('list');
            setFilters({
              ...filters,
              status: filters.status === status ? '' : status,
            });
          }}
        />
      </div>

      {view === 'board' && <BoardView onNewIssue={() => setShowNewModal(true)} searchQuery={filters.q} />}

      {view === 'list' && (
        <>
          <IssueFilters
            filters={filters}
            onChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="hidden sm:flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2">
              <div className="h-2.5 w-2.5 shrink-0" />
              <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">ID</span>
              <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Issue</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</span>
              <span className="hidden md:block w-[5.5rem] shrink-0 ml-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Priority</span>
              <span className="hidden lg:block w-24 shrink-0 ml-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Created</span>
              <span className="hidden sm:block w-7 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">By</span>
              <span className="w-7 shrink-0" />
            </div>

            {isInitialLoad ? (
              <div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IssueCardSkeleton key={i} />
                ))}
              </div>
            ) : list.isError ? (
              <EmptyState
                icon={XCircle}
                title="Couldn't load issues"
                description={getErrorMessage(list.error, 'Please try again.')}
                action={
                  <Button variant="outline" onClick={() => list.refetch()}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              hasActiveFilters ? (
                <EmptyState
                  icon={Inbox}
                  title="No matching issues"
                  description="Try clearing or adjusting your filters."
                  action={
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFilters({ q: '', status: '', priority: '', severity: '' })
                      }
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No issues yet"
                  description="Create your first issue to get started."
                  action={
                    <Button onClick={() => setShowNewModal(true)}>
                      <Plus className="h-4 w-4" />
                      New issue
                    </Button>
                  }
                />
              )
            ) : (
              <div className={list.isFetching ? 'opacity-60 transition-opacity' : ''}>
                {items.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}
      <IssueFormModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
        onSubmit={async (values) => {
          try {
            await create.mutateAsync(values);
            toast.success('Issue created');
            setShowNewModal(false);
          } catch (err) {
            toast.error(getErrorMessage(err, 'Could not create issue'));
          }
        }}
      />
    </div>
  );
};
