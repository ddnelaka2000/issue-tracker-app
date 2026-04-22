export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueSeverity = 'minor' | 'major' | 'blocker';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  tags: string[];
  createdBy: string;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueInput {
  title: string;
  description: string;
  priority?: IssuePriority;
  severity?: IssueSeverity;
  status?: IssueStatus;
  tags?: string[];
}

export interface IssueListParams {
  q?: string;
  status?: IssueStatus | '';
  priority?: IssuePriority | '';
  severity?: IssueSeverity | '';
  tag?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface IssueListResponse {
  items: Issue[];
  pagination: Pagination;
}

export interface StatsResponse {
  counts: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface AnalyticsData {
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  timeline: { _id: { date: string; status: string }; count: number }[];
  topTags: { _id: string; count: number }[];
  total: number;
}

