import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, MapPin, Clock, Tag, Navigation, RotateCcw } from 'lucide-react';
import type { DistanceFilter, TimeFilter, CategoryFilter, SortOption } from './FilterBar';

interface FilterSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ icon, title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-stone-200 dark:border-stone-800 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {icon}
          {title}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-stone-400" />
        ) : (
          <ChevronDown size={16} className="text-stone-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

interface FilterOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  disabledIcon?: React.ReactNode;
}

function FilterOption({ label, selected, onClick, disabled, disabledIcon }: FilterOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
        selected
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <span>{label}</span>
      {disabled && disabledIcon}
    </button>
  );
}

interface FilterSidebarProps {
  filters: {
    sort: SortOption;
    distance: DistanceFilter;
    time: TimeFilter;
    category: CategoryFilter;
  };
  onSortChange: (value: SortOption) => void;
  onDistanceChange: (value: DistanceFilter) => void;
  onTimeChange: (value: TimeFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  locationEnabled: boolean;
  onEnableLocation: () => void;
  categories: string[];
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'verified', label: 'Most Verified' },
];

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

function formatCategoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

export function FilterSidebar({
  filters,
  onSortChange,
  onDistanceChange,
  onTimeChange,
  onCategoryChange,
  onReset,
  hasActiveFilters,
  locationEnabled,
  onEnableLocation,
  categories,
}: FilterSidebarProps) {
  const locationRequiredIcon = <Navigation size={12} className="text-amber-500" />;

  const handleDistanceClick = (value: DistanceFilter) => {
    if (value !== 'any' && !locationEnabled) {
      onEnableLocation();
      return;
    }
    onDistanceChange(value);
  };

  const handleSortClick = (value: SortOption) => {
    if (value === 'nearest' && !locationEnabled) {
      onEnableLocation();
      return;
    }
    onSortChange(value);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <FilterSection
        icon={<ArrowUpDown size={15} className="text-stone-500 dark:text-stone-400" />}
        title="Sort By"
      >
        {sortOptions.map((opt) => (
          <FilterOption
            key={opt.value}
            label={opt.label}
            selected={filters.sort === opt.value}
            onClick={() => handleSortClick(opt.value)}
            disabled={opt.value === 'nearest' && !locationEnabled}
            disabledIcon={locationRequiredIcon}
          />
        ))}
      </FilterSection>

      <FilterSection
        icon={<MapPin size={15} className="text-stone-500 dark:text-stone-400" />}
        title="Distance"
      >
        {distanceOptions.map((opt) => (
          <FilterOption
            key={opt.value}
            label={opt.label}
            selected={filters.distance === opt.value}
            onClick={() => handleDistanceClick(opt.value)}
            disabled={opt.value !== 'any' && !locationEnabled}
            disabledIcon={locationRequiredIcon}
          />
        ))}
      </FilterSection>

      <FilterSection
        icon={<Clock size={15} className="text-stone-500 dark:text-stone-400" />}
        title="Time"
      >
        {timeOptions.map((opt) => (
          <FilterOption
            key={opt.value}
            label={opt.label}
            selected={filters.time === opt.value}
            onClick={() => onTimeChange(opt.value)}
          />
        ))}
      </FilterSection>

      {categories.length > 0 && (
        <FilterSection
          icon={<Tag size={15} className="text-stone-500 dark:text-stone-400" />}
          title="Category"
        >
          <FilterOption
            label="All Categories"
            selected={filters.category === 'all'}
            onClick={() => onCategoryChange('all')}
          />
          {categories.map((cat) => (
            <FilterOption
              key={cat}
              label={formatCategoryLabel(cat)}
              selected={filters.category === cat}
              onClick={() => onCategoryChange(cat)}
            />
          ))}
        </FilterSection>
      )}
    </div>
  );
}
