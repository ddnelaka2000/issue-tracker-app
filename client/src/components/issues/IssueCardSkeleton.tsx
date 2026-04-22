export const IssueCardSkeleton = () => (
  <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
    <div className="h-2.5 w-2.5 shrink-0 rounded-full animate-pulse bg-muted" />
    <div className="hidden sm:block h-3 w-16 shrink-0 animate-pulse rounded bg-muted" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
      <div className="flex gap-1">
        <div className="h-3 w-10 animate-pulse rounded bg-muted" />
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
      </div>
    </div>
    <div className="h-5 w-24 shrink-0 animate-pulse rounded-md bg-muted" />
    <div className="hidden md:block h-5 w-[4.5rem] shrink-0 animate-pulse rounded-md bg-muted" />
    <div className="hidden lg:block h-3 w-24 shrink-0 animate-pulse rounded bg-muted" />
    <div className="hidden sm:block h-7 w-7 shrink-0 animate-pulse rounded-full bg-muted" />
    <div className="h-7 w-7 shrink-0 animate-pulse rounded-md bg-muted" />
  </div>
);
