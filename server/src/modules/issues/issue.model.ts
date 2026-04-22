import { Schema, model, Types, type InferSchemaType, type Model, type HydratedDocument } from 'mongoose';

export const ISSUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const ISSUE_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export const ISSUE_SEVERITIES = ['minor', 'major', 'blocker'] as const;
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

const issueSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ISSUE_PRIORITIES,
      default: 'medium',
      index: true,
    },
    severity: {
      type: String,
      enum: ISSUE_SEVERITIES,
      default: 'minor',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: 'At most 10 tags',
      },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

/**
 * Text index powers the `q=` search — Mongo scores hits by relevance.
 * Compound index on (createdBy, status) accelerates the "my issues" dashboard
 * and status-grouped counts without a collection scan.
 */
issueSchema.index({ title: 'text', description: 'text', tags: 'text' });
issueSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
issueSchema.index({ createdBy: 1, createdAt: -1 });

// Keep resolvedAt / closedAt in sync with status transitions
issueSchema.pre('save', function autoStampTransitions(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) this.resolvedAt = new Date();
    if (this.status === 'closed' && !this.closedAt) this.closedAt = new Date();
    if (this.status !== 'resolved') this.resolvedAt = null;
    if (this.status !== 'closed') this.closedAt = null;
  }
  next();
});

export type IssueDoc = HydratedDocument<InferSchemaType<typeof issueSchema>>;
export type IssueModel = Model<InferSchemaType<typeof issueSchema>>;

export const Issue: IssueModel = model('Issue', issueSchema);
