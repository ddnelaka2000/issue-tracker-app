import { useState } from 'react';
import { toast } from 'sonner';
import { useUpdateIssueStatus } from '@/features/issues/hooks';
import { getErrorMessage } from '@/lib/api';
import type { IssueStatus } from '@/types/issue';

export function useStatusChange(issueId: string, currentStatus: IssueStatus) {
  const updateStatus = useUpdateIssueStatus(issueId);
  const [confirmStatus, setConfirmStatus] = useState<IssueStatus | null>(null);

  const handleStatusSelect = (newStatus: IssueStatus) => {
    if (newStatus === currentStatus) return;
    if (newStatus === 'resolved' || newStatus === 'closed') {
      setConfirmStatus(newStatus);
      return;
    }
    updateStatus.mutateAsync(newStatus).catch((err) => {
      toast.error(getErrorMessage(err, 'Could not update status'));
    });
  };

  const confirmChange = async () => {
    if (!confirmStatus) return;
    try {
      await updateStatus.mutateAsync(confirmStatus);
      toast.success(`Marked as ${confirmStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update status'));
    } finally {
      setConfirmStatus(null);
    }
  };

  return {
    confirmStatus,
    setConfirmStatus,
    handleStatusSelect,
    confirmChange,
    isPending: updateStatus.isPending,
  };
}
