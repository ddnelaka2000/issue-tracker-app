import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { validate } from '@/middleware/validate.middleware';
import { requireAuth } from '@/middleware/auth.middleware';
import * as issueController from './issue.controller';
import {
  createIssueSchema,
  updateIssueSchema,
  listIssuesQuerySchema,
  issueIdParamSchema,
} from './issue.schema';

export const issueRouter = Router();

// All issue endpoints require auth
issueRouter.use(requireAuth);

issueRouter.get(
  '/',
  validate(listIssuesQuerySchema, 'query'),
  asyncHandler(issueController.list),
);

issueRouter.get('/stats', asyncHandler(issueController.stats));

issueRouter.get('/analytics', asyncHandler(issueController.analytics));

issueRouter.get('/export', asyncHandler(issueController.exportAll));

issueRouter.post(
  '/',
  validate(createIssueSchema),
  asyncHandler(issueController.create),
);

issueRouter.get(
  '/:id',
  validate(issueIdParamSchema, 'params'),
  asyncHandler(issueController.getById),
);

issueRouter.patch(
  '/:id',
  validate(issueIdParamSchema, 'params'),
  validate(updateIssueSchema),
  asyncHandler(issueController.update),
);

issueRouter.delete(
  '/:id',
  validate(issueIdParamSchema, 'params'),
  asyncHandler(issueController.remove),
);
