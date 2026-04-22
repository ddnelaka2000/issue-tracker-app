import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { IssueStatus } from '@/types/issue';

const RING_CONFIG: { key: IssueStatus; label: string; color: string }[] = [
  { key: 'open',        label: 'Open',        color: '#3b82f6' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'resolved',    label: 'Resolved',    color: '#10b981' },
  { key: 'closed',      label: 'Closed',      color: '#9ca3af' },
];

function RingTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md flex items-center gap-2">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.payload.color }} />
      <span className="text-muted-foreground">{p.name}</span>
      <span className="font-semibold text-foreground">{p.value}</span>
    </div>
  );
}

interface Props {
  counts: Record<string, number> | undefined;
  isLoading: boolean;
  activeStatus: IssueStatus | '';
  onSegmentClick: (status: IssueStatus) => void;
}

export function StatusRingChart({ counts, isLoading, activeStatus, onSegmentClick }: Props) {
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  const data = RING_CONFIG.map((cfg) => ({
    ...cfg,
    name: cfg.label,
    value: counts?.[cfg.key] ?? 0,
  }));

  const isEmpty = total === 0;
  const chartData = isEmpty
    ? [{ key: '__empty', name: 'No issues', value: 1, color: 'hsl(var(--muted))', label: '' }]
    : data.filter((d) => d.value > 0);

  if (isLoading) {
    return <Skeleton className="rounded-xl h-full min-h-[11rem]" />;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Status overview
        </p>
        <Link
          to="/analytics"
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <TrendingUp className="h-3 w-3" />
          View analytics
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:gap-5">
        <div className="relative shrink-0 h-32 w-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={58}
                paddingAngle={chartData.length > 1 ? 3 : 0}
                dataKey="value"
                strokeWidth={0}
                onClick={(entry) => !isEmpty && onSegmentClick(entry.key as IssueStatus)}
                style={{ cursor: isEmpty ? 'default' : 'pointer' }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={entry.color}
                    opacity={activeStatus && activeStatus !== entry.key ? 0.35 : 1}
                  />
                ))}
              </Pie>
              {!isEmpty && <Tooltip content={<RingTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums leading-none">
              {isEmpty ? '0' : total}
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">total</span>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-1.5 min-w-0">
          {RING_CONFIG.map((cfg) => {
            const count = counts?.[cfg.key] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isActive = activeStatus === cfg.key;
            return (
              <button
                key={cfg.key}
                onClick={() => onSegmentClick(cfg.key)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-1.5 py-0.5 text-left transition-colors',
                  'hover:bg-muted/60',
                  isActive && 'bg-muted',
                )}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cfg.color }} />
                <span className="flex-1 truncate text-xs text-muted-foreground">{cfg.label}</span>
                <span className="shrink-0 tabular-nums text-xs font-semibold">{count}</span>
                <span className="shrink-0 w-7 text-right text-[10px] text-muted-foreground tabular-nums">
                  {total > 0 ? `${pct}%` : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
