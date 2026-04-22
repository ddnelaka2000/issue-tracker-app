import { mutationOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { issueKeys, issueQueries } from './queries';
import type { Issue, IssueInput, IssueStatus } from '@/types/issue';

export const issueMutations = {
  create: mutationOptions({
    mutationKey: ['issues', 'create'] as const,
    mutationFn: async (payload: IssueInput) => {
      const { data } = await api.post<{ issue: Issue }>('/issues', payload);
      return data.issue;
    },
    onSuccess: (issue) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists });
      queryClient.invalidateQueries({ queryKey: issueKeys.stats });
      queryClient.setQueryData(issueQueries.detail(issue.id).queryKey, issue);
    },
  }),

  update: (id: string) =>
    mutationOptions({
      mutationKey: ['issues', 'update', id] as const,
      mutationFn: async (payload: Partial<IssueInput>) => {
        const { data } = await api.patch<{ issue: Issue }>(`/issues/${id}`, payload);
        return data.issue;
      },
      onSuccess: (issue) => {
        queryClient.setQueryData(issueQueries.detail(id).queryKey, issue);
        queryClient.invalidateQueries({ queryKey: issueKeys.lists });
        queryClient.invalidateQueries({ queryKey: issueKeys.stats });
      },
    }),

  updateStatus: (id: string) =>
    mutationOptions({
      mutationKey: ['issues', 'updateStatus', id] as const,
      mutationFn: async (status: IssueStatus) => {
        const { data } = await api.patch<{ issue: Issue }>(`/issues/${id}`, { status });
        return data.issue;
      },
      onMutate: async (newStatus) => {
        const key = issueQueries.detail(id).queryKey;
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<Issue>(key);
        if (previous) {
          queryClient.setQueryData<Issue>(key, { ...previous, status: newStatus });
        }
        return { previous };
      },
      onError: (_err, _newStatus, context) => {
        if (context?.previous) {
          queryClient.setQueryData(issueQueries.detail(id).queryKey, context.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: issueQueries.detail(id).queryKey });
        queryClient.invalidateQueries({ queryKey: issueKeys.lists });
        queryClient.invalidateQueries({ queryKey: issueKeys.stats });
      },
    }),

  delete: mutationOptions({
    mutationKey: ['issues', 'delete'] as const,
    mutationFn: async (id: string) => {
      await api.delete(`/issues/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: issueQueries.detail(id).queryKey });
      queryClient.invalidateQueries({ queryKey: issueKeys.lists });
      queryClient.invalidateQueries({ queryKey: issueKeys.stats });
    },
  }),
} as const;
