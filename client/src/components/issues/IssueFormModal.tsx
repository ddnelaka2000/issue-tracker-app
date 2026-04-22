import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IssueForm } from '@/components/issues/IssueForm';
import type { Issue, IssueInput } from '@/types/issue';

interface IssueFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue?: Issue;
  onSubmit: (values: IssueInput) => Promise<void>;
}

export const IssueFormModal = ({
  open,
  onOpenChange,
  issue,
  onSubmit,
}: IssueFormModalProps) => {
  const isEdit = Boolean(issue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle>{isEdit ? 'Edit issue' : 'New issue'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details below. Only changed fields are saved.'
              : "Describe what's happening and we'll track it."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <IssueForm
            initialValues={issue}
            submitLabel={isEdit ? 'Save changes' : 'Create issue'}
            showStatus={isEdit}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
