import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faClock,
  faExclamationCircle,
  faInfoCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";

const badgeStyles = {
  success: {
    container: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    icon: faCheckCircle,
  },
  warning: {
    container: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    icon: faExclamationCircle,
  },
  danger: {
    container: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
    icon: faXmarkCircle,
  },
  info: {
    container: "bg-sky-50 text-sky-700 ring-sky-600/20",
    dot: "bg-sky-500",
    icon: faInfoCircle,
  },
  neutral: {
    container: "bg-slate-100 text-slate-700 ring-slate-600/20",
    dot: "bg-slate-500",
    icon: faClock,
  },
  purple: {
    container: "bg-violet-50 text-violet-700 ring-violet-600/20",
    dot: "bg-violet-500",
    icon: faInfoCircle,
  },
};

export function Badge({ children, tone = "neutral", icon }) {
  const styles = badgeStyles[tone] || badgeStyles.neutral;
  const iconToUse = icon !== undefined ? icon : styles.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        styles.container,
      )}
    >
      {iconToUse && (
        <FontAwesomeIcon icon={iconToUse} className="h-3 w-3" />
      )}
      {children}
    </span>
  );
}
