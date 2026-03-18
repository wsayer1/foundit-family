import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation as useRouterLocation, Link } from 'react-router-dom';
import { MapPin, Loader2, SlidersHorizontal, Clock, Tag, ArrowUpDown, Check } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ItemCard, ItemCardSkeleton } from '../components/ItemCard';
import { EditItemModal } from '../components/EditItemModal';
import { PullToRefresh } from '../components/PullToRefresh';
import { GuestHero, GuestBottomCTA } from '../components/GuestHero';
import { FloatingAuthCard } from '../components/FloatingAuthCard';
import { FloatingFilterDropdown } from '../components/FloatingFilterDropdown';
import { FilterSidebar } from '../components/FilterSidebar';
import { useItems, useCategories, useSiteStats, useAvailableItemCount, useRecentListings } from '../hooks/useItems';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { supabase } from '../lib/supabase';
import { dataURLtoBlob } from '../utils/image';
import { useFilters, DEFAULT_FILTERS } from '../contexts/FilterContext';
import { PreviewCard, PreviewCardSkeleton } from '../components/PreviewCard';
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
  const { filters, setFilters, hasActiveFilters, resetFilters } = useFilters();
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
  const { totalCount } = useAvailableItemCount(filters);
  const { items: recentListings, loading: recentLoading } = useRecentListings(3);

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

  const itemFeed = (
    <>
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
        ) : (
          <div className="py-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-1">
                No active finds right now
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {user
                  ? 'Be the first to post a new find in your area!'
                  : 'Check back soon or sign up to start posting finds.'}
              </p>
            </div>

            {user && (
              <button
                onClick={() => navigate('/post')}
                className="w-full mb-6 bg-emerald-500 text-white py-4 rounded-2xl font-semibold hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <MapPin size={20} />
                Post a find
              </button>
            )}

            {recentLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <PreviewCardSkeleton key={i} />
                ))}
              </div>
            ) : recentListings.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4 text-sm text-stone-500 dark:text-stone-400">
                  <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                  <span>Recently listed</span>
                  <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                </div>
                <div className="grid gap-4">
                  {recentListings.map((item) => (
                    <PreviewCard
                      key={item.id}
                      item={item}
                      onClick={user ? () => navigate(`/item/${item.id}`) : () => setShowAuthModal(true)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {!user && (
              <div className="mt-6">
                <GuestBottomCTA />
              </div>
            )}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {items.map((item) => (
              user ? (
                <ItemCard
                  key={item.id}
                  item={item}
                  userLocation={userCoords}
                  currentUserId={user.id}
                  onClick={() => navigate(`/item/${item.id}`)}
                  onEdit={() => setEditingItem(item)}
                />
              ) : (
                <PreviewCard
                  key={item.id}
                  item={item}
                  onClick={() => setShowAuthModal(true)}
                />
              )
            ))}
          </div>
          {items.length > 0 && totalCount > items.length && (
            <div className="text-center py-3 text-sm text-stone-500 dark:text-stone-400">
              <span className="font-medium text-stone-600 dark:text-stone-300">{totalCount - items.length}</span> more {totalCount - items.length === 1 ? 'item' : 'items'} available
            </div>
          )}
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

      <footer className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-center gap-4 text-sm text-stone-500 dark:text-stone-400">
          <Link
            to="/privacy"
            className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-stone-300 dark:text-stone-600">|</span>
          <Link
            to="/tos"
            className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            Terms of Service
          </Link>
        </div>
        <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-3">
          Foundit.Family
        </p>
      </footer>
    </>
  );

  return (
    <Layout>
      <div className="absolute top-0 left-0 right-0 z-40 safe-area-top">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-4">
          <Link to="/" state={{ fromLogo: true }} className="flex-shrink-0 bg-white dark:bg-stone-900 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/20 flex items-center gap-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
            <img
              src="/foundit.family_logo_small_light_grey_bg.png"
              alt="Foundit.Family"
              className="h-7 sm:h-8 w-auto rounded-lg"
            />
            <span className="hidden sm:inline font-semibold text-stone-900 dark:text-white text-sm" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>foundit.family</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end lg:hidden">
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
        <div className="max-w-lg mx-auto px-4 py-4 lg:hidden">
          {itemFeed}
        </div>

        <div className="hidden lg:block max-w-6xl mx-auto px-6 py-4">
          <div className="flex gap-6">
            <div className="w-72 flex-shrink-0">
              <div className="sticky top-4">
                <FilterSidebar
                  filters={filters}
                  onSortChange={(value) => setFilters({ ...filters, sort: value })}
                  onDistanceChange={(value) => setFilters({ ...filters, distance: value })}
                  onTimeChange={(value) => setFilters({ ...filters, time: value })}
                  onCategoryChange={(value) => setFilters({ ...filters, category: value })}
                  onReset={resetFilters}
                  hasActiveFilters={hasActiveFilters}
                  locationEnabled={isLocationEnabled}
                  onEnableLocation={handleEnableLocation}
                  categories={categories}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 max-w-2xl">
              {itemFeed}
            </div>
          </div>
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
