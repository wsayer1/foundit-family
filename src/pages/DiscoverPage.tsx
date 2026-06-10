import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation as useRouterLocation, Link } from 'react-router-dom';
import { MapPin, Loader2, SlidersHorizontal, Clock, Tag, ArrowUpDown, Check, X } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ItemCard, ItemCardSkeleton } from '../components/ItemCard';
import { EditItemModal } from '../components/EditItemModal';
import { PullToRefresh } from '../components/PullToRefresh';
import { GuestHero, GuestBottomCTA } from '../components/GuestHero';
import { FloatingAuthCard } from '../components/FloatingAuthCard';
import { FloatingFilterDropdown } from '../components/FloatingFilterDropdown';
import { FilterSidebar } from '../components/FilterSidebar';
import { LogoBadge } from '../components/LogoBadge';
import { PendingPostCard } from '../components/PendingPostCard';
import type { PostingStatus } from '../components/PendingPostCard';
import { useItems, useAvailableItemCount } from '../hooks/useItems';
import { useCategories } from '../hooks/useCategories';
import { useSiteStats, useRecentListings } from '../hooks/useSiteData';
import { useItemMutations } from '../hooks/useItemMutations';
import type { PendingPost } from '../hooks/useItemMutations';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { capitalize } from '../utils/format';
import { useFilters, DEFAULT_FILTERS } from '../contexts/FilterContext';
import { PreviewCard, PreviewCardSkeleton } from '../components/PreviewCard';
import { OnboardingGuide, useOnboardingVisible } from '../components/OnboardingGuide';
import type { ItemWithProfile } from '../types/database';
import type { DistanceFilter, TimeFilter, CategoryFilter, SortOption } from '../components/FilterBar';
import { distanceOptions, timeOptions, sortOptions } from '../components/FilterBar';

export function DiscoverPage() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { requestLocation, permissionStatus, checkPermission, locationEnabled, setLocationEnabled } = useLocation();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { filters, setFilters, hasActiveFilters, resetFilters } = useFilters();
  const [editingItem, setEditingItem] = useState<ItemWithProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, dismissOnboarding] = useOnboardingVisible(user?.id);

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
  const { createItem } = useItemMutations();

  const handleRefresh = async () => {
    refresh();
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  const uploadPost = useCallback(async (post: PendingPost) => {
    if (isPostingRef.current) return;
    isPostingRef.current = true;

    try {
      await createItem(post);

      setPostingStatus('success');
      refreshProfile();

      setTimeout(() => {
        setPendingPost(null);
        isPostingRef.current = false;
        refresh();
      }, 1500);
    } catch (err) {
      setPostingStatus('error');
      setPostingError(err instanceof Error ? err.message : 'Failed to post');
      isPostingRef.current = false;
    }
  }, [createItem, refresh, refreshProfile]);

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
    if (user && sessionStorage.getItem('foundit_just_signed_up') === 'true') {
      sessionStorage.removeItem('foundit_just_signed_up');
      if (!showOnboarding) {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 5000);
      }
    }
  }, [user, showOnboarding]);

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
    ...categories.map((cat) => ({ value: cat, label: capitalize(cat) })),
  ];

  const isLocationEnabled = permissionStatus === 'granted';

  const itemFeed = (
    <>
      {showWelcome && (
        <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl flex-shrink-0">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">Welcome to Foundit.Family!</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-0.5">Your account is ready. Browse nearby finds or post your own curbside treasure.</p>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1 -mr-1 -mt-1 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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
          <LogoBadge hideWordmarkOnMobile />
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

      {showOnboarding && <OnboardingGuide onDismiss={dismissOnboarding} />}
    </Layout>
  );
}
