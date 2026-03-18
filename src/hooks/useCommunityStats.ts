import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CommunityStats {
  totalItemsPosted: number;
  totalItemsClaimed: number;
  totalUsers: number;
  itemsPostedToday: number;
  itemsClaimedToday: number;
  itemsPostedThisWeek: number;
}

export interface RecentActivityItem {
  id: string;
  description: string;
  image_url: string;
  status: 'available' | 'claimed' | 'expired';
  created_at: string;
  claimed_at: string | null;
  category: string | null;
  username: string | null;
}

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        totalItemsResult,
        claimedItemsResult,
        usersResult,
        todayPostedResult,
        todayClaimedResult,
        weekPostedResult,
      ] = await Promise.all([
        supabase.from('items').select('id', { count: 'exact', head: true }),
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('status', 'claimed'),
        supabase.from('public_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('items').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('items').select('id', { count: 'exact', head: true }).eq('status', 'claimed').gte('claimed_at', todayStart),
        supabase.from('items').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
      ]);

      setStats({
        totalItemsPosted: totalItemsResult.count || 0,
        totalItemsClaimed: claimedItemsResult.count || 0,
        totalUsers: usersResult.count || 0,
        itemsPostedToday: todayPostedResult.count || 0,
        itemsClaimedToday: todayClaimedResult.count || 0,
        itemsPostedThisWeek: weekPostedResult.count || 0,
      });
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}

export function useRecentActivity(limit = 5) {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('items')
        .select(`
          id, description, image_url, status, created_at, claimed_at, category,
          profiles!items_user_id_fkey (username)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (data) {
        const items = data as unknown as Array<{
          id: string;
          description: string;
          image_url: string;
          status: string;
          created_at: string;
          claimed_at: string | null;
          category: string | null;
          profiles: { username: string | null } | null;
        }>;
        setActivities(
          items.map((item) => ({
            id: item.id,
            description: item.description,
            image_url: item.image_url,
            status: item.status as 'available' | 'claimed' | 'expired',
            created_at: item.created_at,
            claimed_at: item.claimed_at,
            category: item.category,
            username: item.profiles?.username || null,
          }))
        );
      }
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activities, loading, refresh: fetchActivity };
}
