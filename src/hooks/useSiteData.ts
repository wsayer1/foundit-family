import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';
import { ITEMS_WITH_PROFILES_SELECT } from './itemQueries';

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

export interface FeaturedItem {
  id: string;
  image_url: string;
  description: string;
  category: string | null;
  status: 'available' | 'claimed' | 'expired';
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const FEATURED_SELECT = `
  id, image_url, description, category, status, created_at,
  profiles!items_user_id_fkey (username, avatar_url)
`;

export function useFeaturedItems(count = 4) {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedItems() {
      try {
        const { data: availableItems } = await supabase
          .from('items')
          .select(FEATURED_SELECT)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(count);

        if (availableItems && availableItems.length >= count) {
          setItems(availableItems as FeaturedItem[]);
          return;
        }

        const existingIds = (availableItems || []).map(i => i.id);
        const remaining = count - (availableItems?.length || 0);

        if (remaining > 0) {
          let query = supabase
            .from('items')
            .select(FEATURED_SELECT)
            .neq('status', 'available')
            .order('created_at', { ascending: false })
            .limit(remaining);

          if (existingIds.length > 0) {
            query = query.not('id', 'in', `(${existingIds.join(',')})`);
          }

          const { data: olderItems } = await query;

          setItems([...(availableItems || []), ...(olderItems || [])] as FeaturedItem[]);
        } else {
          setItems((availableItems || []) as FeaturedItem[]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedItems();
  }, [count]);

  return { items, loading };
}

export function useRecentListings(count = 3) {
  const [items, setItems] = useState<ItemWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const { data } = await supabase
          .from('items')
          .select(ITEMS_WITH_PROFILES_SELECT)
          .order('created_at', { ascending: false })
          .limit(count);

        setItems((data as ItemWithProfile[]) || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecent();
  }, [count]);

  return { items, loading };
}
