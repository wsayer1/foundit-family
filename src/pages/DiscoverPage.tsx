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
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { requestLocation, permissionStatus, checkPermission, locationEnabled } = useLocation();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { filters, setFilters, hasActiveFilters } = useFilters();
  const [editingItem, setEditingItem] = useState<ItemWithProfile | null>(null);

  const { items, loading, loadingMore, hasMore, loadMore, refresh, guestLimitReached } = useItems(
    locationEnabled ? userCoords : null,
    filters,
    !!user,
    authLoading
  );
  const { categories } = useCategories();
  const { stats } = useSiteStats(!!user);

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

          {(loading || authLoading) && !items.length ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            hasActiveFilters ? (
              <div className="text-center py-16">
                <div className="bg-stone-100 dark:bg-stone-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="text-stone-400 dark:text-stone-500" size={32} />
                </div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-lg mb-2">
                  No matching finds
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-xs mx-auto">
                  Try adjusting your filters to see more items
                </p>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-6 py-3 rounded-xl font-medium hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="py-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Sparkles size={16} />
                    Be a pioneer
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                    Your neighborhood awaits
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                    Help your community by sharing curbside treasures. Post items you find and help others discover hidden gems nearby.
                  </p>
                </div>

                <div className="relative mb-8">
                  <div className="absolute -inset-4 bg-gradient-to-b from-emerald-100/50 to-transparent dark:from-emerald-900/20 dark:to-transparent rounded-3xl" />
                  <div className="relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700">
                      <img
                        src="https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=800"
                        alt="Example item"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <Sparkles size={12} />
                        Example
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-stone-800 dark:text-stone-200 font-medium leading-snug">
                        Vintage wooden bookshelf in great condition. Perfect for a reading nook!
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Y</span>
                        </div>
                        <span className="text-stone-600 dark:text-stone-400">You</span>
                        <span className="text-stone-300 dark:text-stone-600">·</span>
                        <span>Just now</span>
                        <span className="text-stone-300 dark:text-stone-600">·</span>
                        <MapPin size={12} />
                        <span>Nearby</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/post')}
                    className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-semibold hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <MapPin size={20} />
                    Post your first find
                  </button>
                  <p className="text-center text-sm text-stone-400 dark:text-stone-500">
                    Spotted something interesting on your street? Share it!
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Free</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Always free items</div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Local</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">In your area</div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Fast</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Real-time updates</div>
                  </div>
                </div>
              </div>
            )
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
