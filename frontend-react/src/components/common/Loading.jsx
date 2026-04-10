export function Loading({ text = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white/80 px-6 py-12 shadow-sm backdrop-blur-sm">
      {/* Animated spinner */}
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 animate-pulse rounded-full bg-primary-500" />
        </div>
      </div>
      <span className="animate-pulse text-sm font-medium text-slate-600">{text}</span>
    </div>
  );
}

export function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 animate-pulse rounded-lg bg-slate-200 ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-square w-full animate-pulse bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
