import { useEffect, useState, useMemo, useCallback } from 'react';
import { MapPin, Clock, Tag, MapPinOff } from 'lucide-react';
import { DiscoverMapView } from '../components/DiscoverMapView';
import { BottomNav } from '../components/BottomNav';
import { FloatingFilterDropdown } from '../components/FloatingFilterDropdown';
import { MapStyleToggle } from '../components/MapStyleToggle';
import { LogoBadge } from '../components/LogoBadge';
import { useMapItems } from '../hooks/useMapItems';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useFilters } from '../contexts/FilterContext';
import type { TimeFilter, CategoryFilter } from '../components/FilterBar';
import { timeOptions } from '../components/FilterBar';
import { capitalize } from '../utils/format';

const MAP_STYLE_STORAGE_KEY = 'foundit_map_style';

type MapStyle = 'light' | 'dark';

function getStoredMapStyle(): MapStyle | null {
  try {
    const stored = localStorage.getItem(MAP_STYLE_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return null;
}

export function MapPage() {
  const { user, loading: authLoading } = useAuth();
  const { location, requestLocation, checkPermission, permissionStatus, loading: locationLoading, setLocationEnabled } = useLocation();
  const userCoords = useMemo(
    () => (location ? { lat: location.latitude, lng: location.longitude } : null),
    [location]
  );
  const { filters, setFilters } = useFilters();
  const mapFilters = useMemo(() => ({ ...filters, distance: 'any' as const }), [filters]);
  const { items } = useMapItems(userCoords, mapFilters, !!user, authLoading);
  const { categories } = useCategories();
  const [mapStyle, setMapStyle] = useState<MapStyle | null>(getStoredMapStyle);

  const categoryOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat, label: capitalize(cat) })),
  ];

  useEffect(() => {
    checkPermission().then((status) => {
      if (status === 'granted') {
        requestLocation();
      }
    });
  }, [checkPermission, requestLocation]);

  const handleEnableLocation = useCallback(async () => {
    const coords = await requestLocation(true);
    if (coords) {
      setLocationEnabled(true);
    }
  }, [requestLocation, setLocationEnabled]);

  const handleMapStyleChange = useCallback((style: MapStyle) => {
    setMapStyle(style);
    try {
      localStorage.setItem(MAP_STYLE_STORAGE_KEY, style);
    } catch {}
  }, []);

  const showLocationPrompt = !userCoords && permissionStatus !== 'denied';
  const showDeniedMessage = !userCoords && permissionStatus === 'denied';

  return (
    <div className="h-screen-safe bg-stone-50 dark:bg-stone-950 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <DiscoverMapView
          items={items}
          userLocation={userCoords}
          isGuest={!user}
          onEnableLocation={handleEnableLocation}
          locationLoading={locationLoading}
          mapStyleOverride={mapStyle || undefined}
        />

        <div className="absolute top-0 left-0 right-0 z-20 safe-area-top">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 pt-4">
            <LogoBadge />
            <div className="flex items-center gap-2">
              <MapStyleToggle
                style={mapStyle || 'dark'}
                onChange={handleMapStyleChange}
              />
              <FloatingFilterDropdown
                icon={<Clock size={20} />}
                label="Time"
                options={timeOptions}
                value={filters.time}
                defaultValue="all"
                onChange={(value: TimeFilter) => setFilters({ ...filters, time: value })}
              />
              {categories.length > 0 && (
                <FloatingFilterDropdown
                  icon={<Tag size={20} />}
                  label="Category"
                  options={categoryOptions}
                  value={filters.category}
                  defaultValue="all"
                  onChange={(value: CategoryFilter) => setFilters({ ...filters, category: value })}
                />
              )}
            </div>
          </div>
        </div>

        {showLocationPrompt && !locationLoading && (
          <div className="absolute top-20 left-0 right-0 z-20 px-3 sm:px-4">
            <button
              onClick={handleEnableLocation}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white py-3.5 px-5 rounded-xl font-semibold text-base shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <MapPin size={20} className="text-white" />
              <span>Enable Location</span>
            </button>
          </div>
        )}

        {showDeniedMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
            <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-900 dark:text-stone-100 py-4 px-6 rounded-2xl text-center shadow-xl shadow-black/20 border border-stone-200/50 dark:border-stone-700/50">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="bg-stone-200 dark:bg-stone-700 p-2 rounded-lg">
                  <MapPinOff size={20} className="text-stone-500 dark:text-stone-400" />
                </div>
                <span className="font-semibold">Location Blocked</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Enable location in your browser settings to see your position on the map
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-30">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
