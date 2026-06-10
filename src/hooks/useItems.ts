import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';
import type { FilterState, DistanceFilter, SortOption } from '../components/FilterBar';
import { calculateDistance } from '../utils/distance';
import { ITEMS_WITH_PROFILES_SELECT, visibleItemsOrFilter, getTimeFilterDate, filterActiveItems } from './itemQueries';

const ITEMS_PER_PAGE = 15;
const GUEST_ITEMS_LIMIT = 6;
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

function getDistanceLimit(filter: DistanceFilter): number | null {
  return filter === 'any' ? null : Number(filter);
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

  const applyClientFilters = useCallback(
    (data: ItemWithProfile[]): ItemWithProfile[] => {
      let filtered = filterActiveItems(data);

      const distanceLimit = getDistanceLimit(filters.distance);
      if (distanceLimit && userLocation) {
        filtered = filtered.filter((item) => {
          const dist = calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
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
              const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
              const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
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

  const presentItems = useCallback((sorted: ItemWithProfile[], isAuth: boolean) => {
    allItemsRef.current = sorted;
    const limit = isAuth ? ITEMS_PER_PAGE : GUEST_ITEMS_LIMIT;
    setItems(sorted.slice(0, limit));
    if (!isAuth && sorted.length > GUEST_ITEMS_LIMIT) {
      setHasMore(false);
      setGuestLimitReached(true);
    } else {
      setHasMore(sorted.length > limit);
      setGuestLimitReached(false);
    }
  }, []);

  const fetchItems = useCallback(
    async (useCache = true, forceAuth?: boolean) => {
      const effectiveAuth = forceAuth !== undefined ? forceAuth : isAuthenticated;
      setLoading(true);
      setError(null);

      if (useCache) {
        const cached = getCachedItems(filters, effectiveAuth);
        if (cached) {
          const sorted = sortItems(applyClientFilters(cached), filters.sort);
          presentItems(sorted, effectiveAuth);
          hasFetchedRef.current = true;
          setLoading(false);
          return;
        }
      }

      try {
        let query = supabase
          .from('items')
          .select(ITEMS_WITH_PROFILES_SELECT)
          .or(visibleItemsOrFilter())
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

        const sorted = sortItems(applyClientFilters(allData), filters.sort);
        presentItems(sorted, effectiveAuth);
        hasFetchedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    },
    [filters, applyClientFilters, sortItems, presentItems, isAuthenticated]
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
      const sorted = sortItems(applyClientFilters(cached), filters.sort);
      presentItems(sorted, isAuthenticated);
    } else {
      fetchItems(false);
    }
  }, [filters.time, filters.category, filters.sort, filters.distance]);

  return { items, loading, loadingMore, error, hasMore, loadMore, refresh, guestLimitReached };
}

export function useAvailableItemCount(filters: FilterState) {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        let query = supabase
          .from('items')
          .select('id', { count: 'exact', head: true })
          .or(visibleItemsOrFilter());

        const timeFilterDate = getTimeFilterDate(filters.time);
        if (timeFilterDate) {
          query = query.gte('created_at', timeFilterDate.toISOString());
        }

        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        const { count } = await query;
        setTotalCount(count || 0);
      } catch {
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, [filters.time, filters.category]);

  return { totalCount, loading };
}
