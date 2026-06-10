import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';

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
