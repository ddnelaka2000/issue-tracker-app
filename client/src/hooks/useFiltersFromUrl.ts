import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { IssuePriority, IssueSeverity, IssueStatus } from '@/types/issue';
import { DEFAULT_SORT, type Filters } from '@/components/issues/IssueFilters';

export const useFiltersFromUrl = () => {
  const [params, setParams] = useSearchParams();

  const filters: Filters = useMemo(
    () => ({
      q: params.get('q') ?? '',
      status: (params.get('status') as IssueStatus) ?? '',
      priority: (params.get('priority') as IssuePriority) ?? '',
      severity: (params.get('severity') as IssueSeverity) ?? '',
    }),
    [params],
  );

  const page = Number(params.get('page') || '1');
  const sort = params.get('sort') ?? DEFAULT_SORT;

  const setFilters = (next: Filters) => {
    const p = new URLSearchParams();
    if (next.q) p.set('q', next.q);
    if (next.status) p.set('status', next.status);
    if (next.priority) p.set('priority', next.priority);
    if (next.severity) p.set('severity', next.severity);
    const currentSort = params.get('sort');
    if (currentSort) p.set('sort', currentSort);
    setParams(p, { replace: true });
  };

  const setPage = (newPage: number) => {
    const p = new URLSearchParams(params);
    if (newPage <= 1) p.delete('page');
    else p.set('page', String(newPage));
    setParams(p, { replace: true });
  };

  const setSort = (newSort: string) => {
    const p = new URLSearchParams(params);
    if (!newSort || newSort === DEFAULT_SORT) p.delete('sort');
    else p.set('sort', newSort);
    p.delete('page');
    setParams(p, { replace: true });
  };

  return { filters, page, sort, setFilters, setPage, setSort };
};
