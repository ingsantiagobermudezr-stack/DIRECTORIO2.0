export function Loading({ text = "Cargando..." }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm">
      <span className="h-3 w-3 animate-pulse rounded-full bg-teal-500" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
