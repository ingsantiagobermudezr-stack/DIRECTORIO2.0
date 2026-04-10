import { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

export const TextArea = forwardRef(function TextArea(
  {
    label,
    error,
    helperText,
    className = "",
    wrapperClassName = "",
    ...props
  },
  ref,
) {
  const hasError = Boolean(error);

  const baseStyles =
    "w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

  const defaultStyles =
    "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500/20";
  const errorStyles =
    "border-red-400 bg-red-50/50 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/20";

  const textareaStyles = hasError ? errorStyles : defaultStyles;

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      )}
      <textarea
        ref={ref}
        className={`${baseStyles} ${textareaStyles} ${className}`}
        {...props}
      />
      {(hasError || helperText) && (
        <div className="mt-1.5 flex items-center gap-1.5">
          {hasError && (
            <FontAwesomeIcon icon={faCircleExclamation} className="text-xs text-red-500" />
          )}
          <p
            className={`text-xs ${hasError ? "text-red-600" : "text-slate-500"}`}
          >
            {hasError ? error : helperText}
          </p>
        </div>
      )}
    </div>
  );
});
