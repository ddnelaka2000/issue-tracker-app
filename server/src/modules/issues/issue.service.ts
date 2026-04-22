import { Types, type FilterQuery } from 'mongoose';
import { Issue, ISSUE_STATUSES, type IssueStatus } from './issue.model';
import type { CreateIssueInput, UpdateIssueInput, ListIssuesQuery } from './issue.schema';
import { ApiError } from '@/utils/ApiError';

type IssueFilter = FilterQuery<ReturnType<typeof Issue.hydrate>>;

// The Mongo filter from the parsed query. Each param is optional
function buildFilter(query: ListIssuesQuery, userId: string): IssueFilter {
  const filter: IssueFilter = { createdBy: new Types.ObjectId(userId) };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.severity) filter.severity = query.severity;
  if (query.tag) filter.tags = query.tag;
  if (query.q) filter.$text = { $search: query.q };
  return filter;
}

export async function listIssues(userId: string, query: ListIssuesQuery) {
  const filter = buildFilter(query, userId);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Issue.find(filter, query.q ? { score: { $meta: 'textScore' } } : undefined)
      .sort(query.q ? { score: { $meta: 'textScore' } } : parseSort(query.sort))
      .skip(skip)
      .limit(query.limit)
      .lean({ virtuals: true }),
    Issue.countDocuments(filter),
  ]);

  return {
    items: items.map(normalize),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
      hasNextPage: skip + items.length < total,
    },
  };
}

export async function getStatusCounts(userId: string): Promise<Record<IssueStatus, number>> {
  const rows = await Issue.aggregate<{ _id: IssueStatus; count: number }>([
    { $match: { createdBy: new Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts = Object.fromEntries(ISSUE_STATUSES.map((s) => [s, 0])) as Record<IssueStatus, number>;
  for (const row of rows) counts[row._id] = row.count;
  return counts;
}

export async function getIssue(userId: string, issueId: string) {
  const issue = await Issue.findOne({ _id: issueId, createdBy: userId }).lean({ virtuals: true });
  if (!issue) throw ApiError.notFound('Issue not found');
  return normalize(issue);
}

export async function createIssue(userId: string, input: CreateIssueInput) {
  const issue = await Issue.create({ ...input, createdBy: userId });
  return issue.toJSON();
}

export async function updateIssue(userId: string, issueId: string, input: UpdateIssueInput) {
  const updateData: Record<string, unknown> = { ...input };

  if (input.status) {
    updateData.resolvedAt = input.status === 'resolved' ? new Date() : null;
    updateData.closedAt = input.status === 'closed' ? new Date() : null;
  }

  const issue = await Issue.findOneAndUpdate(
    { _id: issueId, createdBy: userId },
    { $set: updateData },
    { new: true, runValidators: true, context: 'query' },
  );
  if (!issue) throw ApiError.notFound('Issue not found');

  return issue.toJSON();
}

export async function deleteIssue(userId: string, issueId: string): Promise<void> {
  const result = await Issue.deleteOne({ _id: issueId, createdBy: userId });
  if (result.deletedCount === 0) throw ApiError.notFound('Issue not found');
}

// Export all issues unpaginated. Used by the CSV/JSON export
export async function exportAllIssues(userId: string) {
  const issues = await Issue.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return issues.map(normalize);
}

// Strip Mongo internals from a .lean() result
function normalize<T extends { _id: unknown; score?: number }>(doc: T) {
  const { _id, score: _score, ...rest } = doc as T & { _id: unknown };
  return { id: String(_id), ...rest };
}

export async function getAnalytics(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [facets] = await Issue.aggregate([
    { $match: { createdBy: new Types.ObjectId(userId) } },
    {
      $facet: {
        statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        priorityCounts: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        severityCounts: [{ $group: { _id: '$severity', count: { $sum: 1 } } }],
        timeline: [
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                status: '$status',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.date': 1 } },
        ],
        topTags: [
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ],
        totals: [{ $count: 'total' }],
      },
    },
  ]);

  const toMap = (arr: { _id: string; count: number }[]) =>
    Object.fromEntries(arr.map((r) => [r._id, r.count]));

  return {
    statusCounts: toMap(facets.statusCounts),
    priorityCounts: toMap(facets.priorityCounts),
    severityCounts: toMap(facets.severityCounts),
    timeline: facets.timeline as { _id: { date: string; status: string }; count: number }[],
    topTags: facets.topTags as { _id: string; count: number }[],
    total: (facets.totals[0]?.total as number) ?? 0,
  };
}

function parseSort(sort: string): Record<string, 1 | -1> {
  if (sort.startsWith('-')) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
}
