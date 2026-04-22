import { ArrowDown, ArrowUp, Flame, Minus } from 'lucide-react';
import type { IssuePriority, IssueSeverity } from '@/types/issue';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES: Record<
  IssuePriority,
  { label: string; icon: typeof ArrowUp; className: string }
> = {
  low: {
    label: 'Low',
    icon: ArrowDown,
    className:
      'bg-gray-50 text-gray-700 ring-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/30',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    className:
      'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30',
  },
  high: {
    label: 'High',
    icon: ArrowUp,
    className:
      'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30',
  },
  critical: {
    label: 'Critical',
    icon: Flame,
    className:
      'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
  },
};

const SEVERITY_STYLES: Record<IssueSeverity, { label: string; className: string }> = {
  minor: {
    label: 'Minor',
    className:
      'bg-gray-50 text-gray-700 ring-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/30',
  },
  major: {
    label: 'Major',
    className:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
  },
  blocker: {
    label: 'Blocker',
    className:
      'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
  },
};

interface IPriorityBadge {
  priority: IssuePriority;
  className?: string;
  showIcon?: boolean;
}

interface ISeverityBadge {
  severity: IssueSeverity;
  className?: string;
}

export const PriorityBadge = ({ priority, className, showIcon = true }: IPriorityBadge) => {
  const style = PRIORITY_STYLES[priority];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        'inline-flex w-[5.5rem] items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        style.className,
        className,
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {style.label}
    </span>
  );
};

export const SeverityBadge = ({ severity, className }: ISeverityBadge) => {
  const style = SEVERITY_STYLES[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
};
