import { useEffect, useState, useMemo, useRef } from 'react';
import { MapPin, Clock, Tag, ChevronDown } from 'lucide-react';
import { DiscoverMapView } from '../components/DiscoverMapView';
import { BottomNav } from '../components/BottomNav';
import { useItems, useCategories } from '../hooks/useItems';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useFilters } from '../contexts/FilterContext';
import type { TimeFilter, CategoryFilter } from '../components/FilterBar';

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

interface MapFilterDropdownProps<T extends string> {
  icon: React.ReactNode;
  options: { value: T; label: string }[];
  value: T;
  defaultValue: T;
  onChange: (value: T) => void;
}

function MapFilterDropdown<T extends string>({
  icon,
  options,
  value,
  defaultValue,
  onChange,
}: MapFilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className={`flex items-center gap-1.5 px-4 py-3 min-h-[48px] rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-lg ${
          isActive
            ? 'bg-emerald-500 text-white shadow-emerald-500/30'
            : 'bg-white/95 dark:bg-stone-800/95 backdrop-blur-md text-stone-700 dark:text-stone-200 shadow-black/15'
        }`}
      >
        {icon}
        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-1 min-w-[160px] z-[100]"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
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

export function MapPage() {
  const { user, loading: authLoading } = useAuth();
  const { requestLocation, checkPermission, locationEnabled, permissionStatus } = useLocation();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { filters, setFilters } = useFilters();
  const mapFilters = useMemo(() => ({ ...filters, distance: 'any' as const }), [filters]);
  const { items } = useItems(locationEnabled ? userCoords : null, mapFilters, !!user, authLoading);
  const { categories } = useCategories();

  const categoryOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat, label: formatCategoryLabel(cat) })),
  ];

  useEffect(() => {
    checkPermission().then((status) => {
      if (status === 'granted') {
        requestLocation().then((coords) => {
          if (coords) {
            setUserCoords({ lat: coords.latitude, lng: coords.longitude });
          }
        });
      }
    });
  }, [checkPermission, requestLocation]);

  const handleEnableLocation = async () => {
    const coords = await requestLocation();
    if (coords) {
      setUserCoords({ lat: coords.latitude, lng: coords.longitude });
    }
  };

  const showLocationPrompt = permissionStatus !== 'granted' && permissionStatus !== 'unknown';

  return (
    <div className="h-screen-safe bg-stone-50 dark:bg-stone-950 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <DiscoverMapView items={items} userLocation={userCoords} isGuest={!user} />

        <div className="absolute top-0 left-0 right-0 z-20 safe-area-top">
          <div className="flex items-center justify-end gap-2 px-4 pt-4">
            <MapFilterDropdown
              icon={<Clock size={20} />}
              options={timeOptions}
              value={filters.time}
              defaultValue="all"
              onChange={(value: TimeFilter) => setFilters({ ...filters, time: value })}
            />
            {categories.length > 0 && (
              <MapFilterDropdown
                icon={<Tag size={20} />}
                options={categoryOptions}
                value={filters.category}
                defaultValue="all"
                onChange={(value: CategoryFilter) => setFilters({ ...filters, category: value })}
              />
            )}
          </div>
        </div>

        {showLocationPrompt && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
            <button
              onClick={handleEnableLocation}
              className="w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-900 dark:text-stone-100 py-4 px-6 rounded-2xl font-semibold text-base shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 border border-stone-200/50 dark:border-stone-700/50 min-h-[56px]"
            >
              <div className="bg-emerald-500 p-2 rounded-lg">
                <MapPin size={20} className="text-white" />
              </div>
              <span>Enable Location</span>
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-30">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
