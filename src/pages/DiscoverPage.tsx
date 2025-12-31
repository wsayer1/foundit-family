import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { MapPin, Sparkles, Loader2, SlidersHorizontal, Clock, Tag, ArrowUpDown, Check } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ItemCard, ItemCardSkeleton } from '../components/ItemCard';
import { EditItemModal } from '../components/EditItemModal';
import { PullToRefresh } from '../components/PullToRefresh';
import { GuestHero, GuestBottomCTA } from '../components/GuestHero';
import { FloatingAuthCard } from '../components/FloatingAuthCard';
import { FloatingFilterDropdown } from '../components/FloatingFilterDropdown';
import { useItems, useCategories, useSiteStats } from '../hooks/useItems';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { supabase } from '../lib/supabase';
import { dataURLtoBlob } from '../utils/image';
import { useFilters, DEFAULT_FILTERS } from '../contexts/FilterContext';
import type { ItemWithProfile } from '../types/database';
import type { DistanceFilter, TimeFilter, CategoryFilter, SortOption } from '../components/FilterBar';

interface PendingPost {
  imageData: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string | null;
  userId: string;
}

type PostingStatus = 'uploading' | 'success' | 'error';

function PendingPostCard({
  imageData,
  description,
  status,
  error,
}: {
  imageData: string;
  description: string;
  status: PostingStatus;
  error?: string;
}) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm border border-stone-200/50 dark:border-stone-700/50 mb-4">
      <div className="flex items-center gap-3 p-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800">
          <img
            src={imageData}
            alt="Posting"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-stone-800 dark:text-stone-200 font-medium text-sm line-clamp-2 leading-snug">
            {description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {status === 'uploading' && (
              <>
                <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse w-2/3" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Posting</span>
                </div>
              </>
            )}
            {status === 'success' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Check size={12} />
                </div>
                <span>Posted successfully</span>
              </div>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-500">{error || 'Failed to post'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'verified', label: 'Most Verified' },
];

function formatCategoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

export function DiscoverPage() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { requestLocation, permissionStatus, checkPermission, locationEnabled, setLocationEnabled } = useLocation();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { filters, setFilters, hasActiveFilters } = useFilters();
  const [editingItem, setEditingItem] = useState<ItemWithProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [pendingPost, setPendingPost] = useState<PendingPost | null>(null);
  const [postingStatus, setPostingStatus] = useState<PostingStatus>('uploading');
  const [postingError, setPostingError] = useState<string | undefined>();
  const isPostingRef = useRef(false);

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

  const uploadPost = useCallback(async (post: PendingPost) => {
    if (isPostingRef.current) return;
    isPostingRef.current = true;

    try {
      const blob = dataURLtoBlob(post.imageData);
      const fileName = `${post.userId}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('items').insert({
        user_id: post.userId,
        image_url: publicUrl,
        description: post.description,
        latitude: post.latitude,
        longitude: post.longitude,
        category: post.category,
      });

      if (insertError) throw insertError;

      setPostingStatus('success');
      refreshProfile();

      setTimeout(() => {
        setPendingPost(null);
        refresh();
      }, 1500);
    } catch (err) {
      setPostingStatus('error');
      setPostingError(err instanceof Error ? err.message : 'Failed to post');
      isPostingRef.current = false;
    }
  }, [refresh, refreshProfile]);

  useEffect(() => {
    const state = routerLocation.state as { pendingPost?: PendingPost } | null;
    if (state?.pendingPost && !pendingPost && !isPostingRef.current) {
      setPendingPost(state.pendingPost);
      setPostingStatus('uploading');
      setPostingError(undefined);
      uploadPost(state.pendingPost);
      navigate(routerLocation.pathname, { replace: true, state: {} });
    }
  }, [routerLocation, pendingPost, uploadPost, navigate]);

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
      setLocationEnabled(true);
      if (filters.sort === 'recent' && filters.distance === 'any') {
        setFilters({ ...filters, sort: 'nearest' });
      }
    }
  };

  const categoryOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat, label: formatCategoryLabel(cat) })),
  ];

  const isLocationEnabled = permissionStatus === 'granted';

  return (
    <Layout>
      <div className="absolute top-0 left-0 right-0 z-40 safe-area-top">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-4">
          <div className="flex-shrink-0 bg-stone-800 dark:bg-stone-900 p-2.5 sm:p-3 rounded-xl shadow-lg shadow-black/20 flex items-center gap-2 border border-stone-700">
            <MapPin size={24} className="text-emerald-500" strokeWidth={2.5} />
            <span className="hidden md:inline font-semibold text-white text-sm" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>Foundit.Family</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end">
            <FloatingFilterDropdown
              icon={<ArrowUpDown size={18} className="sm:w-5 sm:h-5" />}
              label="Sort"
              options={sortOptions}
              value={filters.sort}
              defaultValue="recent"
              onChange={(value: SortOption) => setFilters({ ...filters, sort: value })}
              requiresLocation={['nearest']}
              locationEnabled={isLocationEnabled}
              onEnableLocation={handleEnableLocation}
            />
            <FloatingFilterDropdown
              icon={<MapPin size={18} className="sm:w-5 sm:h-5" />}
              label="Distance"
              options={distanceOptions}
              value={filters.distance}
              defaultValue="any"
              onChange={(value: DistanceFilter) => setFilters({ ...filters, distance: value })}
              requiresLocation={['500', '1000', '2000', '5000', '10000', '25000']}
              locationEnabled={isLocationEnabled}
              onEnableLocation={handleEnableLocation}
            />
            <FloatingFilterDropdown
              icon={<Clock size={18} className="sm:w-5 sm:h-5" />}
              label="Time"
              options={timeOptions}
              value={filters.time}
              defaultValue="all"
              onChange={(value: TimeFilter) => setFilters({ ...filters, time: value })}
            />
            {categories.length > 0 && (
              <FloatingFilterDropdown
                icon={<Tag size={18} className="sm:w-5 sm:h-5" />}
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
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 pt-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          {!user && <GuestHero stats={stats} />}

          {user && !locationEnabled && permissionStatus !== 'granted' && permissionStatus !== 'unknown' && (
            <button
              onClick={handleEnableLocation}
              className="w-full mb-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-900 dark:text-stone-100 py-4 px-6 rounded-2xl font-semibold text-base shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-stone-200/50 dark:border-stone-700/50"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <MapPin size={20} className="text-white" />
                </div>
                <span>Enable Location</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 font-normal">To see treasure nearby</p>
            </button>
          )}

          {pendingPost && (
            <PendingPostCard
              imageData={pendingPost.imageData}
              description={pendingPost.description}
              status={postingStatus}
              error={postingError}
            />
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
            ) : user ? (
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
            ) : (
              <div className="text-center py-16">
                <div className="bg-stone-100 dark:bg-stone-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-stone-400 dark:text-stone-500" size={32} />
                </div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-lg mb-2">
                  No finds yet
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-xs mx-auto">
                  Be the first to share a curbside find in your area!
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                  Sign up to post
                </button>
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
                    onClick={() => {
                      if (user) {
                        navigate(`/item/${item.id}`);
                      } else {
                        setShowAuthModal(true);
                      }
                    }}
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

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <FloatingAuthCard
            onSuccess={() => setShowAuthModal(false)}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      )}
    </Layout>
  );
}
