import { cn } from "@/lib/utils";

export function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-12", className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    </div>
  );
}

export function TableLoading({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <div className="h-11 w-8 shrink-0 rounded-sm bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-48 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-32 rounded bg-slate-50 animate-pulse" />
          </div>
          <div className="h-6 w-20 rounded bg-slate-100 animate-pulse" />
          <div className="h-6 w-24 rounded bg-slate-50 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-3">
        !
      </div>
      <p className="text-sm font-medium text-slate-900">Something went wrong</p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}
