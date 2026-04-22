import { z } from 'zod';

export const issueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(10_000, 'Description is too long'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  severity: z.enum(['minor', 'major', 'blocker']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  tags: z.array(z.string()).max(20, 'Too many tags'),
});

export type IssueFormValues = z.infer<typeof issueSchema>;
