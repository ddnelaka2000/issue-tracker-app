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
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useAuthStore } from '@/stores/authStore';
import { useStatusChange } from '@/hooks/useStatusChange';
import { cn } from '@/lib/utils';
import type { Issue, IssueStatus } from '@/types/issue';

const ALL_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-slate-300 dark:bg-slate-500',
  medium: 'bg-blue-400',
  high: 'bg-orange-400',
  critical: 'bg-red-500',
};

function shortId(id: string) {
  return id.replace(/-/g, '').slice(-6).toUpperCase();
}

function userInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

interface IIssueCard {
  issue: Issue;
}

export const IssueCard = ({ issue }: IIssueCard) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { confirmStatus, setConfirmStatus, handleStatusSelect, confirmChange, isPending } =
    useStatusChange(issue.id, issue.status);

  return (
    <>
      <div
        className="group flex items-center gap-4 border-b border-border px-4 py-5 last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => navigate(`/issues/${issue.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/issues/${issue.id}`)}
      >
        <div
          title={`Priority: ${issue.priority}`}
          className={cn(
            'h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10',
            PRIORITY_DOT[issue.priority] ?? 'bg-slate-300',
          )}
        />

        <span className="hidden sm:block w-16 shrink-0 font-mono text-[11px] font-semibold text-primary/60 dark:text-violet-400 tracking-wider select-none">
          #{shortId(issue.id)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-snug">
            {issue.title}
          </p>
          {issue.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {issue.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-primary/8 px-1.5 py-px text-[10px] font-medium text-primary/60 ring-1 ring-primary/15"
                >
                  {tag}
                </span>
              ))}
              {issue.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{issue.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={statusTriggerClass(issue.status)}>
                {(() => { const Icon = STATUS_STYLES[issue.status].icon; return <Icon className="h-3 w-3" />; })()}
                {STATUS_STYLES[issue.status].label}
                <ChevronDown className="h-2.5 w-2.5 ml-auto opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
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

        <div className="hidden md:block shrink-0 w-[5.5rem] ml-5">
          <PriorityBadge priority={issue.priority} showIcon />
        </div>

        <div className="hidden lg:block shrink-0 w-24 ml-4 text-[11px] text-muted-foreground tabular-nums">
          {format(new Date(issue.createdAt), 'MMM d, yyyy')}
        </div>

        {user && (
          <div
            title={user.name}
            className="hidden sm:flex shrink-0 h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary ring-1 ring-primary/20"
          >
            {userInitials(user.name)}
          </div>
        )}

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
