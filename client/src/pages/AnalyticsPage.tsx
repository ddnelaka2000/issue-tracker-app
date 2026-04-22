import { useMemo } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, Circle, XCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAnalytics, useIssueStats } from '@/features/issues/hooks';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  open: '#6366f1',
  in_progress: '#f59e0b',
  resolved: '#10b981',
  closed: '#9ca3af',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#60a5fa',
  high: '#fb923c',
  critical: '#ef4444',
};

const SEVERITY_COLORS: Record<string, string> = {
  minor: '#94a3b8',
  major: '#f59e0b',
  blocker: '#ef4444',
};

const TAG_PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#84cc16',
];

function label(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildTimeline(raw: { _id: { date: string; status: string }; count: number }[]) {
  const byDate: Record<string, Record<string, number>> = {};
  for (const row of raw) {
    const { date, status } = row._id;
    byDate[date] ??= {};
    byDate[date][status] = (byDate[date][status] ?? 0) + row.count;
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date: date.slice(5),
      ...counts,
    }));
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}
function StatCard({ icon: Icon, label: lbl, value, color, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-start gap-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{lbl}</p>
        <p className="mt-0.5 text-2xl font-bold tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function ChartSkeleton({ h = 'h-48' }: { h?: string }) {
  return <Skeleton className={cn('w-full rounded-lg', h)} />;
}

function CustomTooltip({ active, payload, label: ttLabel }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-foreground">{ttLabel}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{label(p.name)}</span>
          <span className="ml-auto font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const { data, isLoading, isError } = useAnalytics();
  const statsQuery = useIssueStats();

  const timelineData = useMemo(
    () => (data ? buildTimeline(data.timeline) : []),
    [data],
  );

  const statusData = useMemo(
    () =>
      data
        ? Object.entries(data.statusCounts).map(([key, val]) => ({
            name: key,
            value: val,
          }))
        : [],
    [data],
  );

  const priorityData = useMemo(
    () =>
      data
        ? ['low', 'medium', 'high', 'critical'].map((k) => ({
            name: k,
            value: data.priorityCounts[k] ?? 0,
          }))
        : [],
    [data],
  );

  const severityData = useMemo(
    () =>
      data
        ? ['minor', 'major', 'blocker'].map((k) => ({
            name: k,
            value: data.severityCounts[k] ?? 0,
          }))
        : [],
    [data],
  );

  const tagData = useMemo(
    () => data?.topTags.map((t) => ({ name: t._id, value: t.count })) ?? [],
    [data],
  );

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Could not load analytics"
        description="There was a problem fetching your data. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Analytics</h1>
          <p className="text-xs text-muted-foreground">Overview of your issues across all dimensions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsQuery.isLoading || !statsQuery.data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard icon={Circle} label="Open" value={statsQuery.data.open} color="bg-indigo-500" sub="awaiting work" />
            <StatCard icon={TrendingUp} label="In Progress" value={statsQuery.data.in_progress} color="bg-amber-500" sub="active" />
            <StatCard icon={CheckCircle2} label="Resolved" value={statsQuery.data.resolved} color="bg-emerald-500" sub="completed" />
            <StatCard icon={XCircle} label="Closed" value={statsQuery.data.closed} color="bg-gray-400" sub="no longer tracked" />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Issues created — last 30 days">
            {isLoading ? (
              <ChartSkeleton h="h-52" />
            ) : timelineData.length === 0 ? (
              <div className="flex h-52 items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No activity in the last 30 days</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    {Object.entries(STATUS_COLORS).map(([key, color]) => (
                      <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {Object.entries(STATUS_COLORS).map(([key, color]) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stroke={color}
                      fill={`url(#grad-${key})`}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Status breakdown">
          {isLoading ? (
            <ChartSkeleton h="h-52" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {statusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[entry.name] ?? '#6366f1' }}
                    />
                    <span className="text-muted-foreground">{label(entry.name)}</span>
                    <span className="font-semibold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard title="By priority">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={priorityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={label} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="issues" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="By severity">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={severityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={label} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="issues" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] ?? '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {(isLoading || tagData.length > 0) && (
        <SectionCard title="Top tags">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={tagData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                barSize={16}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="issues" radius={[0, 4, 4, 0]}>
                  {tagData.map((entry, i) => (
                    <Cell key={entry.name} fill={TAG_PALETTE[i % TAG_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      )}
    </div>
  );
}
