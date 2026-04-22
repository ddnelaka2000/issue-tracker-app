import { CheckCircle2, Circle, CircleDot, XCircle } from 'lucide-react';
import type { IssueStatus } from '@/types/issue';
import { cn } from '@/lib/utils';

export const STATUS_STYLES: Record<
  IssueStatus,
  { label: string; icon: typeof Circle; className: string }
> = {
  open: {
    label: 'Open',
    icon: Circle,
    className:
      'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30',
  },
  in_progress: {
    label: 'In Progress',
    icon: CircleDot,
    className:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
  },
  closed: {
    label: 'Closed',
    icon: XCircle,
    className:
      'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/30',
  },
};

export const STATUS_PILL_BASE =
  'inline-flex w-[7.5rem] whitespace-nowrap items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset';

export function statusTriggerClass(status: IssueStatus, extra?: string) {
  return cn(
    STATUS_PILL_BASE,
    'transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
    STATUS_STYLES[status].className,
    extra,
  );
}

interface IStatusBadge {
  status: IssueStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge = ({ status, className, showIcon = true }: IStatusBadge) => {
  const style = STATUS_STYLES[status];
  const Icon = style.icon;
  return (
    <span className={cn(STATUS_PILL_BASE, style.className, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {style.label}
    </span>
  );
};
