import { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck, faSquare } from "@fortawesome/free-regular-svg-icons";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

export const Checkbox = forwardRef(function Checkbox(
  { label, error, wrapperClassName = "", className = "", ...props },
  ref,
) {
  const hasError = Boolean(error);

  return (
    <div className={wrapperClassName}>
      <label className="flex cursor-pointer items-start gap-3">
        <div className="relative flex h-5 w-5 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            {...props}
          />
          <div className="text-slate-400 peer-checked:text-primary-600">
            <FontAwesomeIcon icon={faSquare} className="hidden peer-checked:hidden" />
            <FontAwesomeIcon icon={faSquareCheck} className="peer-checked:block" />
          </div>
        </div>
        {label && <span className="text-sm text-slate-700">{label}</span>}
      </label>
      {hasError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-xs" />
          {error}
        </p>
      )}
    </div>
  );
});
