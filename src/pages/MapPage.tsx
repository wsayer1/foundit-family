import { useEffect, useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { DiscoverMapView } from '../components/DiscoverMapView';
import { FilterBar } from '../components/FilterBar';
import { BottomNav } from '../components/BottomNav';
import { useItems, useCategories } from '../hooks/useItems';
import { useLocation } from '../contexts/LocationContext';
import { useFilters } from '../contexts/FilterContext';

export function MapPage() {
  const { requestLocation, checkPermission, permissionStatus, locationEnabled } = useLocation();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { filters, setFilters } = useFilters();
  const mapFilters = useMemo(() => ({ ...filters, distance: 'any' as const }), [filters]);
  const { items } = useItems(locationEnabled ? userCoords : null, mapFilters);
  const { categories } = useCategories();

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
      if (filters.sort === 'recent' && filters.distance === 'any') {
        setFilters({ ...filters, sort: 'nearest' });
      }
    }
  };

  return (
    <div className="h-screen-safe bg-stone-50 dark:bg-stone-950 flex flex-col overflow-hidden">
      <header className="flex-shrink-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="font-semibold text-stone-900 dark:text-stone-100">Street Finds</span>
          </div>
          <div className="flex justify-end" />
        </div>
      </header>

      <div className="flex-1 min-h-0 relative pb-20">
        <DiscoverMapView items={items} userLocation={locationEnabled ? userCoords : null} />
        <div className="absolute top-3 left-3 right-3 z-10">
          <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              locationEnabled={permissionStatus === 'granted'}
              onEnableLocation={handleEnableLocation}
              hideDistance
              hideSort
              categories={categories}
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
