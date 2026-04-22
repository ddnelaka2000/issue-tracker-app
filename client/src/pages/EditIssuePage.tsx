import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { IssueForm } from '@/components/issues/IssueForm';
import { useIssue, useUpdateIssue } from '@/features/issues/hooks';
import { getErrorMessage } from '@/lib/api';

export const EditIssuePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const issueQuery = useIssue(id);
  const update = useUpdateIssue(id ?? '');

  if (issueQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-2/5" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (issueQuery.isError || !issueQuery.data) {
    return (
      <EmptyState
        icon={XCircle}
        title="Issue not found"
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={`/issues/${issue.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to issue
      </Link>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit issue</h1>
        <p className="text-sm text-muted-foreground">
          Update details. Only changed fields are sent.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-5 sm:p-6">
        <IssueForm
          initialValues={issue}
          submitLabel="Save changes"
          showStatus
          onCancel={() => navigate(`/issues/${issue.id}`)}
          onSubmit={async (values) => {
            try {
              await update.mutateAsync(values);
              toast.success('Issue updated');
              navigate(`/issues/${issue.id}`);
            } catch (err) {
              toast.error(getErrorMessage(err, 'Could not save changes'));
            }
          }}
        />
      </div>
    </div>
  );
};
