import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';
import type { FilterState, DistanceFilter, TimeFilter, SortOption } from '../components/FilterBar';

const ITEMS_PER_PAGE = 15;
const GUEST_ITEMS_LIMIT = 3;
const CACHE_KEY = 'streetfinds_items_cache';
const CACHE_TTL = 5 * 60 * 1000;
const INITIAL_FETCH_LIMIT = 30;

interface CacheData {
  items: ItemWithProfile[];
  timestamp: number;
  cacheKey: string;
}

function getCacheKey(filters: FilterState, isAuthenticated: boolean): string {
  return `${filters.time}:${filters.category}:${isAuthenticated ? 'auth' : 'guest'}`;
}

function getCachedItems(filters: FilterState, isAuthenticated: boolean): ItemWithProfile[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    if (data.cacheKey !== getCacheKey(filters, isAuthenticated)) {
      return null;
    }

    return data.items;
  } catch {
    return null;
  }
}

function setCachedItems(items: ItemWithProfile[], filters: FilterState, isAuthenticated: boolean): void {
  try {
    const data: CacheData = { items, timestamp: Date.now(), cacheKey: getCacheKey(filters, isAuthenticated) };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
  }
}

function getTimeFilterDate(filter: TimeFilter): Date | null {
  const now = new Date();
  switch (filter) {
    case '2h':
      return new Date(now.getTime() - 2 * 60 * 60 * 1000);
    case '8h':
      return new Date(now.getTime() - 8 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '48h':
      return new Date(now.getTime() - 48 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

function getDistanceLimit(filter: DistanceFilter): number | null {
  switch (filter) {
    case '100':
      return 100;
    case '250':
      return 250;
    case '500':
      return 500;
    case '1000':
      return 1000;
    case '2000':
      return 2000;
    case '5000':
      return 5000;
    case '10000':
      return 10000;
    case '25000':
      return 25000;
    case '50000':
      return 50000;
    default:
      return null;
  }
}

export function useItems(
  userLocation: { lat: number; lng: number } | null,
  filters: FilterState,
  isAuthenticated: boolean,
  authLoading: boolean
) {
  const [items, setItems] = useState<ItemWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const allItemsRef = useRef<ItemWithProfile[]>([]);
  const hasFetchedRef = useRef(false);

  const itemsLimit = isAuthenticated ? ITEMS_PER_PAGE : GUEST_ITEMS_LIMIT;

  const applyClientFilters = useCallback(
    (data: ItemWithProfile[]): ItemWithProfile[] => {
      let filtered = [...data];

      const distanceLimit = getDistanceLimit(filters.distance);
      if (distanceLimit && userLocation) {
        filtered = filtered.filter((item) => {
          const dist = getDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
          return dist <= distanceLimit;
        });
      }

      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((item) => item.category === filters.category);
      }

      return filtered;
    },
    [filters.distance, filters.category, userLocation]
  );

  const sortItems = useCallback(
    (data: ItemWithProfile[], sortOption: SortOption): ItemWithProfile[] => {
      const sorted = [...data];

      switch (sortOption) {
        case 'nearest':
          if (userLocation) {
            sorted.sort((a, b) => {
              const distA = getDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
              const distB = getDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
              return distA - distB;
            });
          }
          break;
        case 'recent':
          sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'verified':
          sorted.sort((a, b) => b.still_there_count - a.still_there_count);
          break;
      }

      return sorted;
    },
    [userLocation]
  );

  const fetchItems = useCallback(
    async (useCache = true, forceAuth?: boolean) => {
      const effectiveAuth = forceAuth !== undefined ? forceAuth : isAuthenticated;
      setLoading(true);
      setError(null);

      if (useCache) {
        const cached = getCachedItems(filters, effectiveAuth);
        if (cached) {
          const filtered = applyClientFilters(cached);
          const sorted = sortItems(filtered, filters.sort);
          allItemsRef.current = sorted;
          const limit = effectiveAuth ? ITEMS_PER_PAGE : GUEST_ITEMS_LIMIT;
          setItems(sorted.slice(0, limit));
          if (!effectiveAuth && sorted.length > GUEST_ITEMS_LIMIT) {
            setHasMore(false);
            setGuestLimitReached(true);
          } else {
            setHasMore(sorted.length > limit);
            setGuestLimitReached(false);
          }
          setLoading(false);
          return;
        }
      }

      try {
        let query = supabase
          .from('items')
          .select(`
          *,
          profiles!items_user_id_fkey (username, avatar_url)
        `)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(INITIAL_FETCH_LIMIT);

        const timeFilterDate = getTimeFilterDate(filters.time);
        if (timeFilterDate) {
          query = query.gte('created_at', timeFilterDate.toISOString());
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const allData = data as ItemWithProfile[];
        setCachedItems(allData, filters, effectiveAuth);

        const filtered = applyClientFilters(allData);
        const sorted = sortItems(filtered, filters.sort);
        allItemsRef.current = sorted;
        const limit = effectiveAuth ? ITEMS_PER_PAGE : GUEST_ITEMS_LIMIT;
        setItems(sorted.slice(0, limit));
        if (!effectiveAuth && sorted.length > GUEST_ITEMS_LIMIT) {
          setHasMore(false);
          setGuestLimitReached(true);
        } else {
          setHasMore(sorted.length > limit);
          setGuestLimitReached(false);
        }
        hasFetchedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    },
    [filters, applyClientFilters, sortItems, isAuthenticated]
  );

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const currentLength = items.length;
    const nextItems = allItemsRef.current.slice(0, currentLength + ITEMS_PER_PAGE);
    setItems(nextItems);
    setHasMore(nextItems.length < allItemsRef.current.length);
    setLoadingMore(false);
  }, [items.length, loadingMore, hasMore]);

  const refresh = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
    fetchItems(false);
  }, [fetchItems]);

  useEffect(() => {
    if (authLoading) return;
    if (!hasFetchedRef.current) {
      fetchItems(true, isAuthenticated);
    }
  }, [authLoading, isAuthenticated, fetchItems]);

  useEffect(() => {
    if (authLoading || !hasFetchedRef.current) return;
    const cached = getCachedItems(filters, isAuthenticated);
    if (cached) {
      const filtered = applyClientFilters(cached);
      const sorted = sortItems(filtered, filters.sort);
      allItemsRef.current = sorted;
      setItems(sorted.slice(0, itemsLimit));
      if (!isAuthenticated && sorted.length > GUEST_ITEMS_LIMIT) {
        setHasMore(false);
        setGuestLimitReached(true);
      } else {
        setHasMore(sorted.length > itemsLimit);
        setGuestLimitReached(false);
      }
    } else {
      fetchItems(false);
    }
  }, [filters.time, filters.category, filters.sort, filters.distance]);

  return { items, loading, loadingMore, error, hasMore, loadMore, refresh, guestLimitReached };
}

export function useUserItems(userId: string | undefined) {
  const [items, setItems] = useState<ItemWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserItems = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('items')
      .select(`*, profiles!items_user_id_fkey (username, avatar_url)`)
      .or(`user_id.eq.${userId},claimed_by.eq.${userId}`)
      .order('created_at', { ascending: false });

    setItems((data as ItemWithProfile[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchUserItems();
  }, [fetchUserItems]);

  return { items, loading, refresh: fetchUserItems };
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return getDistance(lat1, lon1, lat2, lon2);
}

const PRIORITY_CATEGORIES = ['couch', 'chair', 'table', 'bookshelf', 'lamp', 'tv'];
const MAX_CATEGORIES = 10;

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('items')
        .select('category')
        .eq('status', 'available')
        .not('category', 'is', null);

      if (data) {
        const uniqueCategories = [...new Set(data.map((item) => item.category as string))];
        const sortedCategories = uniqueCategories.sort((a, b) => {
          const aIndex = PRIORITY_CATEGORIES.indexOf(a.toLowerCase());
          const bIndex = PRIORITY_CATEGORIES.indexOf(b.toLowerCase());
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.localeCompare(b);
        });
        setCategories(sortedCategories.slice(0, MAX_CATEGORIES));
      }
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refresh: fetchCategories };
}

export interface SiteStats {
  totalItems: number;
  totalUsers: number;
  itemsThisWeek: number;
}

export function useSiteStats(skip = false) {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(!skip);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const [itemsResult, usersResult, weekResult] = await Promise.all([
          supabase.from('items').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase
            .from('items')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', oneWeekAgo.toISOString()),
        ]);

        setStats({
          totalItems: itemsResult.count || 0,
          totalUsers: usersResult.count || 0,
          itemsThisWeek: weekResult.count || 0,
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [skip]);

  return { stats, loading };
}
