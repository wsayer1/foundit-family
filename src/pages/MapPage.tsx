import { useEffect, useState, useMemo } from 'react';
import { DiscoverMapView } from '../components/DiscoverMapView';
import { FilterBar } from '../components/FilterBar';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Layout';
import { useItems, useCategories } from '../hooks/useItems';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useFilters } from '../contexts/FilterContext';

export function MapPage() {
  const { user, loading: authLoading } = useAuth();
  const { requestLocation, checkPermission, permissionStatus, locationEnabled } = useLocation();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { filters, setFilters } = useFilters();
  const mapFilters = useMemo(() => ({ ...filters, distance: 'any' as const }), [filters]);
  const { items } = useItems(locationEnabled ? userCoords : null, mapFilters, !!user, authLoading);
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
      <Header />
      <div className="flex-1 min-h-0 relative">
        <DiscoverMapView items={items} userLocation={userCoords} />
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
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
