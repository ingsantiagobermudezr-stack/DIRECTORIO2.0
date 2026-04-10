import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-400 to-primary-500 text-slate-900 shadow-md hover:shadow-lg hover:brightness-110 focus:ring-primary-500",
    secondary:
      "border-2 border-slate-300 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50 focus:ring-primary-500",
    success:
      "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg hover:brightness-110 focus:ring-green-500",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:brightness-110 focus:ring-red-500",
    warning:
      "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md hover:shadow-lg hover:brightness-110 focus:ring-yellow-500",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    link: "bg-transparent text-primary-600 underline-offset-4 hover:underline focus:ring-primary-500 shadow-none",
  };

  const sizes = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <FontAwesomeIcon icon={faSpinner} spin />}
      {!loading && icon && <FontAwesomeIcon icon={icon} />}
      {children}
    </button>
  );
}
