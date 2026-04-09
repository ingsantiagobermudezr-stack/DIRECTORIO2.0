import clsx from "clsx";
import { useToast } from "../../context/ToastContext";

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "pointer-events-auto w-80 rounded-xl border px-4 py-3 shadow-lg",
            {
              "border-emerald-300 bg-emerald-50": toast.type === "success",
              "border-rose-300 bg-rose-50": toast.type === "error",
              "border-slate-300 bg-white": toast.type !== "success" && toast.type !== "error",
            },
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              <p className="text-sm text-slate-600">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
