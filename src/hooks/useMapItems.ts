import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';
import type { FilterState } from '../components/FilterBar';
import { ITEMS_WITH_PROFILES_SELECT, visibleItemsOrFilter, getTimeFilterDate, filterActiveItems } from './itemQueries';

export function useMapItems(
  _userLocation: { lat: number; lng: number } | null,
  filters: FilterState,
  _isAuthenticated: boolean,
  authLoading: boolean
) {
  const [items, setItems] = useState<ItemWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('items')
        .select(ITEMS_WITH_PROFILES_SELECT)
        .or(visibleItemsOrFilter())
        .order('created_at', { ascending: false });

      const timeFilterDate = getTimeFilterDate(filters.time);
      if (timeFilterDate) {
        query = query.gte('created_at', timeFilterDate.toISOString());
      }

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setItems(filterActiveItems((data as ItemWithProfile[]) || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [filters.time, filters.category, authLoading]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const refresh = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refresh };
}
