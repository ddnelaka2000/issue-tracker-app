import { z } from 'zod';
import { ISSUE_STATUSES, ISSUE_PRIORITIES, ISSUE_SEVERITIES } from './issue.model';

export const createIssueSchema = z.object({
  title: z.string().trim().min(3, 'Title too short').max(160),
  description: z.string().trim().min(1, 'Description is required').max(8000),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
  severity: z.enum(ISSUE_SEVERITIES).optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  tags: z.array(z.string().trim().min(1).max(24)).max(10).optional(),
});

export const updateIssueSchema = createIssueSchema.partial();

export const listIssuesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
  severity: z.enum(ISSUE_SEVERITIES).optional(),
  tag: z.string().trim().max(24).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'priority', '-priority']).default('-createdAt'),
});

export const issueIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid issue id'),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type ListIssuesQuery = z.infer<typeof listIssuesQuerySchema>;
