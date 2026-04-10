import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faChartLine,
  faHeart,
  faMagnifyingGlass,
  faMessage,
  faShop,
  faStar,
  faBell,
  faReceipt,
  faUsers,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const iconMap = {
  box: faBoxOpen,
  search: faMagnifyingGlass,
  heart: faHeart,
  store: faShop,
  message: faMessage,
  star: faStar,
  chart: faChartLine,
  bell: faBell,
  receipt: faReceipt,
  users: faUsers,
  error: faCircleExclamation,
};

export function EmptyState({ title, description, actionLabel, actionLink, icon = "box" }) {
  const iconComponent = iconMap[icon] || iconMap.box;

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-b from-slate-50 via-white to-slate-50 p-10 text-center transition-all hover:border-primary-300 hover:shadow-md md:p-16">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary-100 opacity-30 blur-3xl transition-all group-hover:opacity-50" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary-200 opacity-20 blur-3xl transition-all group-hover:opacity-40" />

      <div className="relative">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner transition-all group-hover:scale-110">
          <FontAwesomeIcon
            icon={iconComponent}
            size="2x"
            className="text-slate-400 transition-all group-hover:text-primary-500"
          />
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>

        {/* Action Button */}
        {actionLabel && actionLink && (
          <Link
            to={actionLink}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-400 to-primary-500 px-6 py-3 font-semibold text-slate-900 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:translate-y-0"
          >
            <FontAwesomeIcon icon={iconComponent} />
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
