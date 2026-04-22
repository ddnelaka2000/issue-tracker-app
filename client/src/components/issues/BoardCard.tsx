import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { STATUS_STYLES, StatusBadge, statusTriggerClass } from '@/components/common/StatusBadge';
import { PriorityBadge, SeverityBadge } from '@/components/common/PriorityBadge';
import { useStatusChange } from '@/hooks/useStatusChange';
import { cn } from '@/lib/utils';
import type { Issue, IssueStatus } from '@/types/issue';

const ALL_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

interface IBoardCard {
  issue: Issue;
}

export const BoardCard = ({ issue }: IBoardCard) => {
  const navigate = useNavigate();
  const { confirmStatus, setConfirmStatus, handleStatusSelect, confirmChange, isPending } =
    useStatusChange(issue.id, issue.status);

  return (
    <>
      <div
        className="group relative rounded-xl border border-border bg-card p-3.5 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/20 transition-all"
        onClick={() => navigate(`/issues/${issue.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/issues/${issue.id}`)}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className={statusTriggerClass(issue.status)}>
                {(() => { const Icon = STATUS_STYLES[issue.status].icon; return <Icon className="h-3 w-3" />; })()}
                {STATUS_STYLES[issue.status].label}
                <ChevronDown className="h-2.5 w-2.5 ml-auto opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-52"
              onClick={(e) => e.stopPropagation()}
            >
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

        </div>

        <h3 className="text-sm font-semibold leading-snug text-foreground mb-2.5">
          {issue.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              PRIORITY_DOT[issue.priority],
            )}
            title={`${issue.priority} priority`}
          />
          <PriorityBadge priority={issue.priority} showIcon={false} />
          {issue.severity && <SeverityBadge severity={issue.severity} />}
        </div>

        {issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {issue.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary/70 ring-1 ring-primary/15"
              >
                {tag}
              </span>
            ))}
            {issue.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{issue.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          {format(new Date(issue.createdAt), 'MMM d, yyyy')}
        </p>
      </div>

      <ConfirmDialog
        open={confirmStatus === 'resolved'}
        onOpenChange={(o) => !o && setConfirmStatus(null)}
        title="Mark as resolved?"
        description="This issue will be moved to Resolved. You can reopen it later."
        confirmText="Mark resolved"
        onConfirm={confirmChange}
        loading={isPending}
      />
      <ConfirmDialog
        open={confirmStatus === 'closed'}
        onOpenChange={(o) => !o && setConfirmStatus(null)}
        title="Close this issue?"
        description="Closing signals this is no longer being worked on."
        confirmText="Close issue"
        onConfirm={confirmChange}
        loading={isPending}
      />
    </>
  );
};
