import type { Request, Response } from 'express';
import * as issueService from './issue.service';
import { ApiError } from '@/utils/ApiError';
import type { CreateIssueInput, UpdateIssueInput, ListIssuesQuery } from './issue.schema';

function requireUserId(req: Request): string {
  if (!req.user?.sub) throw ApiError.unauthorized();
  return req.user.sub;
}

export async function list(req: Request, res: Response) {
  const userId = requireUserId(req);
  const result = await issueService.listIssues(userId, req.query as unknown as ListIssuesQuery);
  res.json(result);
}

export async function stats(req: Request, res: Response) {
  const userId = requireUserId(req);
  const counts = await issueService.getStatusCounts(userId);
  res.json({ counts });
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  const userId = requireUserId(req);
  const issue = await issueService.getIssue(userId, req.params.id);
  res.json({ issue });
}

export async function create(req: Request, res: Response) {
  const userId = requireUserId(req);
  const issue = await issueService.createIssue(userId, req.body as CreateIssueInput);
  res.status(201).json({ issue });
}

export async function update(
  req: Request<{ id: string }, unknown, UpdateIssueInput>,
  res: Response,
) {
  const userId = requireUserId(req);
  const issue = await issueService.updateIssue(userId, req.params.id, req.body);
  res.json({ issue });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  const userId = requireUserId(req);
  await issueService.deleteIssue(userId, req.params.id);
  res.status(204).end();
}

export async function exportAll(req: Request, res: Response) {
  const userId = requireUserId(req);
  const issues = await issueService.exportAllIssues(userId);
  res.json({ issues });
}

export async function analytics(req: Request, res: Response) {
  const userId = requireUserId(req);
  const data = await issueService.getAnalytics(userId);
  res.json(data);
}
