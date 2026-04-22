import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Pencil,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STATUS_STYLES, StatusBadge, statusTriggerClass } from '@/components/common/StatusBadge';
import { PriorityBadge, SeverityBadge } from '@/components/common/PriorityBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { IssueFormModal } from '@/components/issues/IssueFormModal';
import {
  useDeleteIssue,
  useIssue,
  useUpdateIssue,
} from '@/features/issues/hooks';
import { useStatusChange } from '@/hooks/useStatusChange';
import { getErrorMessage } from '@/lib/api';
import type { IssueStatus } from '@/types/issue';

const ALL_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

export const IssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const issueQuery = useIssue(id);
  const updateIssue = useUpdateIssue(id ?? '');
  const deleteIssue = useDeleteIssue();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (issueQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (issueQuery.isError || !issueQuery.data) {
    return (
      <EmptyState
        icon={XCircle}
        title="Issue not found"
        description="It may have been deleted, or you may not have access."
        action={
          <Button asChild variant="outline">
            <Link to="/issues">
              <ArrowLeft className="h-4 w-4" />
              Back to issues
            </Link>
          </Button>
        }
      />
    );
  }

  const issue = issueQuery.data;
  const { confirmStatus, setConfirmStatus, handleStatusSelect, confirmChange, isPending } =
    useStatusChange(issue.id, issue.status);

  const runDelete = async () => {
    if (!id) return;
    try {
      await deleteIssue.mutateAsync(id);
      toast.success('Issue deleted');
      navigate('/issues', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete'));
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to="/issues"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All issues
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">
            {issue.title}
          </h1>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={isPending}
                className={statusTriggerClass(issue.status, 'disabled:opacity-50')}
              >
                {(() => { const Icon = STATUS_STYLES[issue.status].icon; return <Icon className="h-3 w-3" />; })()}
                {STATUS_STYLES[issue.status].label}
                <ChevronDown className="h-2.5 w-2.5 ml-auto opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Change status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => handleStatusSelect(s)}
                  className="flex items-center gap-2"
                >
                  <StatusBadge status={s} />
                  {issue.status === s && (
                    <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <PriorityBadge priority={issue.priority} />
          <SeverityBadge severity={issue.severity} />
          {issue.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary/70 ring-1 ring-primary/15"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Description
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {issue.description || (
            <span className="text-muted-foreground italic">No description provided.</span>
          )}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border bg-card p-5 text-sm shadow-sm sm:grid-cols-4">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Created
          </dt>
          <dd className="mt-1 font-medium">
            {format(new Date(issue.createdAt), 'MMM d, yyyy')}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Updated
          </dt>
          <dd className="mt-1 font-medium">
            {format(new Date(issue.updatedAt), 'MMM d, yyyy')}
          </dd>
        </div>
        {issue.resolvedAt && (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Resolved
            </dt>
            <dd className="mt-1 font-medium">
              {format(new Date(issue.resolvedAt), 'MMM d, yyyy')}
            </dd>
          </div>
        )}
        {issue.closedAt && (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Closed
            </dt>
            <dd className="mt-1 font-medium">
              {format(new Date(issue.closedAt), 'MMM d, yyyy')}
            </dd>
          </div>
        )}
      </dl>

      <IssueFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        issue={issue}
        onSubmit={async (values) => {
          try {
            await updateIssue.mutateAsync(values);
            toast.success('Issue updated');
            setShowEditModal(false);
          } catch (err) {
            toast.error(getErrorMessage(err, 'Could not save changes'));
          }
        }}
      />

      <ConfirmDialog
        open={confirmStatus === 'resolved'}
        onOpenChange={(o) => !o && setConfirmStatus(null)}
        title="Mark as resolved?"
        description="This issue will be moved to Resolved. You can reopen it via the status dropdown."
        confirmText="Mark resolved"
        onConfirm={confirmChange}
        loading={isPending}
      />
      <ConfirmDialog
        open={confirmStatus === 'closed'}
        onOpenChange={(o) => !o && setConfirmStatus(null)}
        title="Close this issue?"
        description="Closing signals this is no longer being worked on. You can reopen it later."
        confirmText="Close issue"
        onConfirm={confirmChange}
        loading={isPending}
      />
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete this issue?"
        description="This action is permanent and cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={runDelete}
        loading={deleteIssue.isPending}
      />
    </div>
  );
};
