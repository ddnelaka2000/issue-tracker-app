import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { issueQueries } from './queries';
import { issueMutations } from './mutations';
import type { Issue, IssueListParams } from '@/types/issue';

export function useIssues(params: IssueListParams) {
  return useQuery(issueQueries.list(params));
}

export function useIssue(id: string | undefined) {
  return useQuery(issueQueries.detail(id));
}

export function useIssueStats() {
  return useQuery(issueQueries.stats());
}

export function useAnalytics() {
  return useQuery(issueQueries.analytics());
}

export function useCreateIssue() {
  return useMutation(issueMutations.create);
}

export function useUpdateIssue(id: string) {
  return useMutation(issueMutations.update(id));
}

export function useUpdateIssueStatus(id: string) {
  return useMutation(issueMutations.updateStatus(id));
}

export function useDeleteIssue() {
  return useMutation(issueMutations.delete);
}

export async function fetchAllIssuesForExport(): Promise<Issue[]> {
  const { data } = await api.get<{ issues: Issue[] }>('/issues/export');
  return data.issues;
}
