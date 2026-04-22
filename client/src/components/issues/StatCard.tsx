import { CheckCircle2, Circle, CircleDot, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { IssueStatus } from '@/types/issue';

export const STAT_CONFIG: {
  key: IssueStatus;
  label: string;
  icon: LucideIcon;
  accent: string;
  bg: string;
  activeBorder: string;
}[] = [
  {
    key: 'open',
    label: 'Open',
    icon: Circle,
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    activeBorder: 'border-blue-300 dark:border-blue-500/40',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: CircleDot,
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    activeBorder: 'border-amber-300 dark:border-amber-500/40',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    icon: CheckCircle2,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    activeBorder: 'border-emerald-300 dark:border-emerald-500/40',
  },
  {
    key: 'closed',
    label: 'Closed',
    icon: XCircle,
    accent: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-500/10',
    activeBorder: 'border-gray-300 dark:border-gray-500/40',
  },
];

interface IStatCard {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  accent: string;
  bg: string;
  activeBorder: string;
  active: boolean;
  onClick: () => void;
}

export const StatCard = ({ label, value, icon: Icon, accent, bg, activeBorder, active, onClick }: IStatCard) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex flex-col rounded-xl border p-4 text-left transition-all hover:shadow-md ${
      active
        ? `${bg} ${activeBorder} shadow-sm`
        : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${active ? bg : 'bg-muted'}`}>
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
      </span>
    </div>
    <span className={`mt-3 text-3xl font-bold tabular-nums tracking-tight ${active ? accent : ''}`}>
      {value ?? '—'}
    </span>
  </button>
);
