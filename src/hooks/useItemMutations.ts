import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { dataURLtoBlob } from '../utils/image';

export interface PendingPost {
  imageData: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string | null;
  userId: string;
}

export function useItemMutations() {
  const createItem = useCallback(async (post: PendingPost) => {
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
  }, []);

  const updateItemDescription = useCallback(async (itemId: string, description: string) => {
    const { error } = await supabase
      .from('items')
      .update({ description })
      .eq('id', itemId);

    if (error) throw error;
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }, []);

  return { createItem, updateItemDescription, deleteItem };
}
