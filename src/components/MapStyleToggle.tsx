import { Sun, Moon } from 'lucide-react';

type MapStyle = 'light' | 'dark';

interface MapStyleToggleProps {
  style: MapStyle;
  onChange: (style: MapStyle) => void;
  className?: string;
}

export function MapStyleToggle({ style, onChange, className = '' }: MapStyleToggleProps) {
  const toggle = () => {
    onChange(style === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className={`bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm w-11 h-11 rounded-xl shadow-lg flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors ${className}`}
      aria-label={`Switch to ${style === 'light' ? 'dark' : 'light'} map`}
    >
      {style === 'light' ? (
        <Moon size={18} className="text-stone-600 dark:text-stone-300" />
      ) : (
        <Sun size={18} className="text-amber-500" />
      )}
    </button>
  );
}
