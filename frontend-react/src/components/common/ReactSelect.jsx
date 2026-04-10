import Select from "react-select";
import { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

export const ReactSelect = forwardRef(function ReactSelect(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder = "Selecciona una opción",
    isClearable = true,
    isSearchable = true,
    isLoading = false,
    wrapperClassName = "",
    className = "",
    value,
    onChange,
    ...props
  },
  ref,
) {
  const hasError = Boolean(error);

  // Transform options to react-select format
  const selectOptions = options.map((opt) => ({
    value: opt.value ?? opt.id,
    label: opt.label ?? opt.nombre,
    ...opt,
  }));

  // Custom styles
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.75rem",
      borderColor: hasError ? "#f87171" : state.isFocused ? "#facc15" : "#cbd5e1",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(250, 204, 21, 0.2)" : base.boxShadow,
      "&:hover": {
        borderColor: hasError ? "#f87171" : "#94a3b8",
      },
      minHeight: "44px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#fef08a" : state.isFocused ? "#fefce8" : base.backgroundColor,
      color: "#0f172a",
      "&:active": {
        backgroundColor: "#fef08a",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#0f172a",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#94a3b8",
    }),
  };

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      )}
      <Select
        ref={ref}
        options={selectOptions}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isLoading={isLoading}
        styles={customStyles}
        className={className}
        noOptionsMessage={() => "No hay opciones disponibles"}
        loadingMessage={() => "Cargando..."}
        {...props}
      />
      {(hasError || helperText) && (
        <div className="mt-1.5 flex items-center gap-1.5">
          {hasError && (
            <FontAwesomeIcon icon={faCircleExclamation} className="text-xs text-red-500" />
          )}
          <p className={`text-xs ${hasError ? "text-red-600" : "text-slate-500"}`}>
            {hasError ? error : helperText}
          </p>
        </div>
      )}
    </div>
  );
});
