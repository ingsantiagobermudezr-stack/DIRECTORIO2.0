import clsx from "clsx";

export function Badge({ children, tone = "neutral" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        {
          "bg-emerald-100 text-emerald-800": tone === "success",
          "bg-amber-100 text-amber-800": tone === "warning",
          "bg-rose-100 text-rose-800": tone === "danger",
          "bg-slate-100 text-slate-700": tone === "neutral",
        },
      )}
    >
      {children}
    </span>
  );
}
