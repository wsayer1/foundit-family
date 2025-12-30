import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Navigation } from 'lucide-react';

interface FloatingFilterDropdownProps<T extends string> {
  icon: React.ReactNode;
  label: string;
  options: { value: T; label: string }[];
  value: T;
  defaultValue: T;
  onChange: (value: T) => void;
  requiresLocation?: T[];
  locationEnabled?: boolean;
  onEnableLocation?: () => void;
}

export function FloatingFilterDropdown<T extends string>({
  icon,
  label,
  options,
  value,
  defaultValue,
  onChange,
  requiresLocation = [],
  locationEnabled = true,
  onEnableLocation,
}: FloatingFilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const isActive = value !== defaultValue;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: T) => {
    if (requiresLocation?.includes(optionValue) && !locationEnabled) {
      onEnableLocation?.();
      setIsOpen(false);
      return;
    }
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-3 min-h-[44px] sm:min-h-[48px] rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-lg ${
          isActive
            ? 'bg-emerald-500 text-white shadow-emerald-500/30'
            : 'bg-white/95 dark:bg-stone-800/95 backdrop-blur-md text-stone-700 dark:text-stone-200 shadow-black/15'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{isActive ? selectedOption?.label : label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform sm:w-[18px] sm:h-[18px] ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-1 min-w-[160px] z-[100]"
        >
          {options.map((option) => {
            const needsLocation = requiresLocation?.includes(option.value);
            const isDisabled = needsLocation && !locationEnabled;

            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                  value === option.value
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                } ${isDisabled ? 'opacity-60' : ''}`}
              >
                <span>{option.label}</span>
                {isDisabled && <Navigation size={12} className="text-amber-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
