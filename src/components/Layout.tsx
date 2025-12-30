import { ReactNode, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Tag, ChevronDown } from 'lucide-react';
import { BottomNav } from './BottomNav';
import type { FilterState, TimeFilter, CategoryFilter } from './FilterBar';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav }: LayoutProps) {
  return (
    <div className="h-screen-safe bg-stone-50 dark:bg-stone-950 flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col pb-20 min-h-0">
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}

interface HeaderFilterDropdownProps<T extends string> {
  icon: React.ReactNode;
  label: string;
  options: { value: T; label: string }[];
  value: T;
  defaultValue: T;
  onChange: (value: T) => void;
}

function HeaderFilterDropdown<T extends string>({
  icon,
  label,
  options,
  value,
  defaultValue,
  onChange,
}: HeaderFilterDropdownProps<T>) {
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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          isActive
            ? 'bg-emerald-500 text-white'
            : 'bg-stone-700/80 text-stone-300 hover:bg-stone-600/80'
        }`}
      >
        {icon}
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 py-1 min-w-[140px] z-[100]"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                value === option.value
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  filters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  categories?: string[];
}

export function Header({ title, showBack, rightAction, filters, onFiltersChange, categories = [] }: HeaderProps) {
  const navigate = useNavigate();

  const categoryOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat, label: formatCategoryLabel(cat) })),
  ];

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    if (filters && onFiltersChange) {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const hasFilters = filters && onFiltersChange;

  return (
    <header className={`sticky top-0 z-40 ${hasFilters ? '' : 'bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50'}`}>
      <div className="px-4 h-14 flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="font-semibold text-stone-900 dark:text-stone-100">Foundit.Family</span>
          </div>
        )}

        {title && (
          <h1 className="flex-1 text-center font-semibold text-stone-900 dark:text-stone-100">
            {title}
          </h1>
        )}

        {filters && onFiltersChange && (
          <div className="flex items-center gap-2 ml-auto">
            <HeaderFilterDropdown
              icon={<Clock size={18} />}
              label="Time"
              options={timeOptions}
              value={filters.time}
              defaultValue="all"
              onChange={(value: TimeFilter) => updateFilter('time', value)}
            />
            {categories.length > 0 && (
              <HeaderFilterDropdown
                icon={<Tag size={18} />}
                label="Category"
                options={categoryOptions}
                value={filters.category}
                defaultValue="all"
                onChange={(value: CategoryFilter) => updateFilter('category', value)}
              />
            )}
          </div>
        )}

        {rightAction && !filters && (
          <div className="ml-auto">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
}
