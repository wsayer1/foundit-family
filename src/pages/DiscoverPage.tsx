import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, Loader2, SlidersHorizontal } from 'lucide-react';
import { Layout, Header } from '../components/Layout';
import { ItemCard, ItemCardSkeleton } from '../components/ItemCard';
import { EditItemModal } from '../components/EditItemModal';
import { FilterBar } from '../components/FilterBar';
import { PullToRefresh } from '../components/PullToRefresh';
import { GuestHero, GuestBottomCTA } from '../components/GuestHero';
import { useItems, useCategories, useSiteStats } from '../hooks/useItems';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useFilters, DEFAULT_FILTERS } from '../contexts/FilterContext';
import type { ItemWithProfile } from '../types/database';

export function DiscoverPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { requestLocation, permissionStatus, checkPermission, locationEnabled } = useLocation();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { filters, setFilters, hasActiveFilters } = useFilters();
  const [editingItem, setEditingItem] = useState<ItemWithProfile | null>(null);

  const { items, loading, loadingMore, hasMore, loadMore, refresh, guestLimitReached } = useItems(
    locationEnabled ? userCoords : null,
    filters,
    !!user
  );
  const { categories } = useCategories();
  const { stats } = useSiteStats();

  const handleRefresh = async () => {
    refresh();
    await new Promise(resolve => setTimeout(resolve, 800));
  };

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
    <Layout>
      <Header />
      <div className="sticky top-14 z-30 bg-stone-50 dark:bg-stone-950 border-b border-stone-200/50 dark:border-stone-800/50">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          locationEnabled={permissionStatus === 'granted'}
          onEnableLocation={handleEnableLocation}
          categories={categories}
        />
      </div>
      <PullToRefresh onRefresh={handleRefresh} className="flex-1">
        <div className="max-w-lg mx-auto px-4 py-4">
          {!user && <GuestHero stats={stats} />}

          {user && permissionStatus !== 'granted' && permissionStatus !== 'unknown' && (
            <button
              onClick={handleEnableLocation}
              className="w-full mb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-xl">
                <MapPin className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-stone-800 dark:text-stone-200">Enable location</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">See items near you first</p>
              </div>
              <Sparkles className="text-amber-500 dark:text-amber-400" size={20} />
            </button>
          )}

          {loading && !items.length ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-stone-100 dark:bg-stone-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                {hasActiveFilters ? (
                  <SlidersHorizontal className="text-stone-400 dark:text-stone-500" size={32} />
                ) : (
                  <MapPin className="text-stone-400 dark:text-stone-500" size={32} />
                )}
              </div>
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-lg mb-2">
                {hasActiveFilters ? 'No matching finds' : 'No finds yet'}
              </h3>
              <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-xs mx-auto">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more items'
                  : 'Be the first to share a curbside treasure in your area!'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-6 py-3 rounded-xl font-medium hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={() => navigate('/post')}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                  Post an item
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    userLocation={userCoords}
                    currentUserId={user?.id}
                    onClick={() => navigate(`/item/${item.id}`)}
                    onEdit={() => setEditingItem(item)}
                  />
                ))}
              </div>
              {guestLimitReached && <GuestBottomCTA />}
              {hasMore && !guestLimitReached && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-3 text-stone-600 dark:text-stone-400 font-medium hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </PullToRefresh>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            setEditingItem(null);
            refresh();
          }}
          onDeleted={() => {
            setEditingItem(null);
            refreshProfile();
            refresh();
          }}
        />
      )}
    </Layout>
  );
}
