import { useEffect, useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { DiscoverMapView } from '../components/DiscoverMapView';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Layout';
import { useItems, useCategories } from '../hooks/useItems';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useFilters } from '../contexts/FilterContext';

export function MapPage() {
  const { user, loading: authLoading } = useAuth();
  const { requestLocation, checkPermission, locationEnabled, permissionStatus } = useLocation();
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
    }
  };

  const showLocationPrompt = permissionStatus !== 'granted' && permissionStatus !== 'unknown';

  return (
    <div className="h-screen-safe bg-stone-50 dark:bg-stone-950 flex flex-col overflow-hidden">
      <Header
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />
      <div className="flex-1 min-h-0 relative">
        <DiscoverMapView items={items} userLocation={userCoords} isGuest={!user} />
        {showLocationPrompt && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
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
