import { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    success,
    icon,
    rightIcon,
    onRightIconClick,
    helperText,
    className = "",
    wrapperClassName = "",
    ...props
  },
  ref,
) {
  const hasError = Boolean(error);
  const isSuccess = Boolean(success);

  const baseStyles =
    "w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

  const defaultStyles =
    "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500/20";
  const errorStyles =
    "border-red-400 bg-red-50/50 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/20";
  const successStyles =
    "border-green-400 bg-green-50/50 text-green-900 placeholder:text-green-300 focus:border-green-500 focus:ring-green-500/20";

  const inputStyles = hasError
    ? errorStyles
    : isSuccess
      ? successStyles
      : defaultStyles;

  const iconPosition = icon ? "pl-12" : "";
  const rightIconPosition = rightIcon ? "pr-12" : icon ? "pr-4" : "pr-4";

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div
            className={`absolute top-1/2 left-4 -translate-y-1/2 ${hasError ? "text-red-400" : isSuccess ? "text-green-400" : "text-slate-400"}`}
          >
            <FontAwesomeIcon icon={icon} />
          </div>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${inputStyles} ${iconPosition} ${rightIconPosition} ${className}`}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className={`absolute top-1/2 right-4 -translate-y-1/2 ${hasError ? "text-red-400" : isSuccess ? "text-green-400" : "text-slate-400"} transition hover:text-slate-600`}
          >
            <FontAwesomeIcon icon={rightIcon} />
          </button>
        )}
        {!rightIcon && isSuccess && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2 text-green-500">
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
        )}
      </div>
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
