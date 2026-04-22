import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { IssueForm } from '@/components/issues/IssueForm';
import { useCreateIssue } from '@/features/issues/hooks';
import { getErrorMessage } from '@/lib/api';

export const NewIssuePage = () => {
  const navigate = useNavigate();
  const create = useCreateIssue();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/issues"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All issues
      </Link>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New issue</h1>
        <p className="text-sm text-muted-foreground">
          Describe what's happening and we'll file it.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-5 sm:p-6">
        <IssueForm
          submitLabel="Create issue"
          onCancel={() => navigate('/issues')}
          onSubmit={async (values) => {
            try {
              const issue = await create.mutateAsync(values);
              toast.success('Issue created');
              navigate(`/issues/${issue.id}`, { replace: true });
            } catch (err) {
              toast.error(getErrorMessage(err, 'Could not create issue'));
            }
          }}
        />
      </div>
    </div>
  );
};
