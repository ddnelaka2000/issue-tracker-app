import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AnalyticsData,
  Issue,
  IssueListParams,
  IssueListResponse,
  StatsResponse,
} from '@/types/issue';

function cleanParams(params: IssueListParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = value as string | number;
  }
  return out;
}

export const issueKeys = {
  lists: ['issues', 'list'] as const,
  details: ['issues', 'detail'] as const,
  stats: ['issues', 'stats'] as const,
  analytics: ['issues', 'analytics'] as const,
} as const;

export const issueQueries = {
  list: (params: IssueListParams) => {
    const cleaned = cleanParams(params);
    return queryOptions({
      queryKey: ['issues', 'list', cleaned] as const,
      queryFn: async ({ signal }) => {
        const { data } = await api.get<IssueListResponse>('/issues', {
          params: cleaned,
          signal,
        });
        return data;
      },
      placeholderData: (prev) => prev,
    });
  },

  detail: (id: string | undefined) =>
    queryOptions({
      queryKey: ['issues', 'detail', id] as const,
      queryFn: async ({ signal }) => {
        const { data } = await api.get<{ issue: Issue }>(`/issues/${id}`, { signal });
        return data.issue;
      },
      enabled: Boolean(id),
    }),

  stats: () =>
    queryOptions({
      queryKey: ['issues', 'stats'] as const,
      queryFn: async ({ signal }) => {
        const { data } = await api.get<StatsResponse>('/issues/stats', { signal });
        return data.counts;
      },
    }),

  analytics: () =>
    queryOptions({
      queryKey: ['issues', 'analytics'] as const,
      queryFn: async ({ signal }) => {
        const { data } = await api.get<AnalyticsData>('/issues/analytics', { signal });
        return data;
      },
    }),
} as const;
