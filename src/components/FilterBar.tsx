import { useState, useRef, useEffect } from 'react';
import { MapPin, Clock, ArrowUpDown, ChevronDown, Navigation } from 'lucide-react';

export type DistanceFilter = 'any' | '500' | '1000' | '2000' | '5000' | '10000' | '25000';
export type TimeFilter = 'all' | '2h' | '8h' | '24h' | '48h' | 'week';
export type SortOption = 'nearest' | 'recent' | 'verified';

export interface FilterState {
  distance: DistanceFilter;
  time: TimeFilter;
  sort: SortOption;
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  locationEnabled: boolean;
  onEnableLocation: () => void;
  hideDistance?: boolean;
  hideSort?: boolean;
}

const distanceOptions: { value: DistanceFilter; label: string }[] = [
  { value: 'any', label: 'Any Distance' },
  { value: '500', label: '500m' },
  { value: '1000', label: '1 km' },
  { value: '2000', label: '2 km' },
  { value: '5000', label: '5 km' },
  { value: '10000', label: '10 km' },
  { value: '25000', label: '25 km' },
];

const timeOptions: { value: TimeFilter; label: string }[] = [
  { value: '2h', label: 'Last 2 hours' },
  { value: '8h', label: 'Last 8 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '48h', label: 'Last 48 hours' },
  { value: 'week', label: 'Last week' },
  { value: 'all', label: 'All time' },
];

const sortOptions: { value: SortOption; label: string; shortLabel: string }[] = [
  { value: 'nearest', label: 'Nearest', shortLabel: 'Nearest' },
  { value: 'recent', label: 'Most Recent', shortLabel: 'Recent' },
  { value: 'verified', label: 'Most Verified', shortLabel: 'Verified' },
];

interface FilterDropdownProps<T extends string> {
  icon: React.ReactNode;
  label: string;
  options: { value: T; label: string }[];
  value: T;
  defaultValue: T;
  onChange: (value: T) => void;
  requiresLocation?: T[];
  locationEnabled: boolean;
  onEnableLocation: () => void;
}

function FilterDropdown<T extends string>({
  icon,
  label,
  options,
  value,
  defaultValue,
  onChange,
  requiresLocation = [],
  locationEnabled,
  onEnableLocation,
}: FilterDropdownProps<T>) {
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const isActive = value !== defaultValue;
  const isOpen = dropdownPos !== null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownPos(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (isOpen) {
      setDropdownPos(null);
    } else if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  const handleOptionClick = (optionValue: T) => {
    if (requiresLocation.includes(optionValue) && !locationEnabled) {
      onEnableLocation();
      setDropdownPos(null);
      return;
    }
    onChange(optionValue);
    setDropdownPos(null);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          isActive
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
        }`}
      >
        {icon}
        <span>{isActive ? selectedOption?.label : label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          className="fixed bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 py-1 min-w-[140px] z-[100]"
        >
          {options.map((option) => {
            const needsLocation = requiresLocation.includes(option.value);
            const isDisabled = needsLocation && !locationEnabled;

            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                  value === option.value
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                } ${isDisabled ? 'opacity-60' : ''}`}
              >
                <span>{option.label}</span>
                {isDisabled && (
                  <Navigation size={12} className="text-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SortDropdownProps {
  options: { value: SortOption; label: string; shortLabel: string }[];
  value: SortOption;
  onChange: (value: SortOption) => void;
  requiresLocation: SortOption[];
  locationEnabled: boolean;
  onEnableLocation: () => void;
}

function SortDropdown({
  options,
  value,
  onChange,
  requiresLocation,
  locationEnabled,
  onEnableLocation,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: SortOption) => {
    if (requiresLocation.includes(optionValue) && !locationEnabled) {
      onEnableLocation();
      setIsOpen(false);
      return;
    }
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
      >
        <ArrowUpDown size={14} />
        <span>{selectedOption?.shortLabel}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-stone-900 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 py-1 min-w-[140px] z-50">
          {options.map((option) => {
            const needsLocation = requiresLocation.includes(option.value);
            const isDisabled = needsLocation && !locationEnabled;

            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                  value === option.value
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                } ${isDisabled ? 'opacity-60' : ''}`}
              >
                <span>{option.label}</span>
                {isDisabled && (
                  <Navigation size={12} className="text-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FilterBar({ filters, onFiltersChange, locationEnabled, onEnableLocation, hideDistance, hideSort }: FilterBarProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex items-center py-3 pl-4">
      {!hideSort && (
        <>
          <SortDropdown
            options={sortOptions}
            value={filters.sort}
            onChange={(value) => updateFilter('sort', value)}
            requiresLocation={['nearest']}
            locationEnabled={locationEnabled}
            onEnableLocation={onEnableLocation}
          />

          <div className="w-px h-5 bg-stone-300 dark:bg-stone-700 flex-shrink-0" />
        </>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pl-2 pr-4 scrollbar-hide">
        {!hideDistance && (
          <FilterDropdown
            icon={<MapPin size={14} />}
            label="Distance"
            options={distanceOptions}
            value={filters.distance}
            defaultValue="any"
            onChange={(value) => updateFilter('distance', value)}
            requiresLocation={['500', '1000', '5000', '10000']}
            locationEnabled={locationEnabled}
            onEnableLocation={onEnableLocation}
          />
        )}

        <FilterDropdown
          icon={<Clock size={14} />}
          label="Time"
          options={timeOptions}
          value={filters.time}
          defaultValue="all"
          onChange={(value) => updateFilter('time', value)}
          locationEnabled={locationEnabled}
          onEnableLocation={onEnableLocation}
        />
      </div>
    </div>
  );
}
