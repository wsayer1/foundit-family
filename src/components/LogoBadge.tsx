import { Link } from 'react-router-dom';

interface LogoBadgeProps {
  hideWordmarkOnMobile?: boolean;
}

export function LogoBadge({ hideWordmarkOnMobile = false }: LogoBadgeProps) {
  return (
    <Link
      to="/"
      state={{ fromLogo: true }}
      className="flex-shrink-0 bg-white dark:bg-stone-900 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/20 flex items-center gap-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
    >
      <img
        src="/foundit.family_logo_small_light_grey_bg.png"
        alt="Foundit.Family"
        className="h-7 sm:h-8 w-auto rounded-lg"
      />
      <span
        className={`${hideWordmarkOnMobile ? 'hidden sm:inline ' : ''}font-semibold text-stone-900 dark:text-white text-sm`}
        style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
      >
        foundit.family
      </span>
    </Link>
  );
}
