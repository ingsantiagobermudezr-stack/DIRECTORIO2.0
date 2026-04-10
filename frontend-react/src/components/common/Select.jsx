import { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    icon,
    options = [],
    placeholder = "Selecciona una opción",
    className = "",
    wrapperClassName = "",
    ...props
  },
  ref,
) {
  const hasError = Boolean(error);

  const baseStyles =
    "w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

  const defaultStyles =
    "border-slate-300 bg-white text-slate-900 focus:border-primary-500 focus:ring-primary-500/20";
  const errorStyles =
    "border-red-400 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-500/20";

  const selectStyles = hasError ? errorStyles : defaultStyles;

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div
            className={`absolute top-1/2 left-4 -translate-y-1/2 ${hasError ? "text-red-400" : "text-slate-400"}`}
          >
            <FontAwesomeIcon icon={icon} />
          </div>
        )}
        <select
          ref={ref}
          className={`${baseStyles} ${selectStyles} ${icon ? "pl-12" : ""} ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
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
