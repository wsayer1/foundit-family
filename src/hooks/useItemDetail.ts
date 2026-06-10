import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { dataURLtoBlob } from '../utils/image';
import type { ItemWithProfile } from '../types/database';

export function useItemDetail(id: string | undefined) {
  const { user, refreshProfile } = useAuth();
  const [item, setItem] = useState<ItemWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchItem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('items')
          .select(`*, profiles!items_user_id_fkey (username, avatar_url)`)
          .eq('id', id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('Error fetching item:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setItem(data as ItemWithProfile);

          if (user) {
            const { data: confirmationData } = await supabase
              .from('confirmations')
              .select('id')
              .eq('item_id', id)
              .eq('user_id', user.id)
              .maybeSingle();

            if (!cancelled) {
              setHasConfirmed(!!confirmationData);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching item:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const claimItem = async () => {
    if (!user || !item) return;

    setClaiming(true);

    const { error } = await supabase
      .from('items')
      .update({
        status: 'claimed',
        claimed_by: user.id,
        claimed_at: new Date().toISOString()
      })
      .eq('id', item.id)
      .eq('status', 'available');

    if (!error) {
      setItem({ ...item, status: 'claimed', claimed_by: user.id });
      refreshProfile();
    }

    setClaiming(false);
  };

  const confirmStillThere = async (photoDataUrl: string) => {
    if (!user || !item) return;

    setConfirming(true);

    try {
      const blob = dataURLtoBlob(photoDataUrl);
      const fileName = `confirmations/${item.id}/${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(fileName);

      const { error } = await supabase.from('confirmations').insert({
        item_id: item.id,
        user_id: user.id,
        photo_url: publicUrl
      });

      if (!error) {
        setItem({
          ...item,
          still_there_count: item.still_there_count + 1,
          last_confirmed_at: new Date().toISOString()
        });
        setHasConfirmed(true);
        refreshProfile();
      }
    } catch (err) {
      console.error('Error confirming item:', err);
    } finally {
      setConfirming(false);
    }
  };

  return { item, setItem, loading, claiming, confirming, hasConfirmed, claimItem, confirmStillThere };
}
