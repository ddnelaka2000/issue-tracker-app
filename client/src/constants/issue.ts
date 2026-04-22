import type { IssuePriority, IssueSeverity, IssueStatus } from '@/types/issue';

export const PAGE_SIZE = 10;

export const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const PRIORITY_OPTIONS: { value: IssuePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const SEVERITY_OPTIONS: { value: IssueSeverity; label: string }[] = [
  { value: 'minor', label: 'Minor' },
  { value: 'major', label: 'Major' },
  { value: 'blocker', label: 'Blocker' },
];
