import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { compressAvatar } from '../utils/image';

export function useProfileMutations() {
  const { user, refreshProfile } = useAuth();

  const updateUsername = useCallback(async (username: string) => {
    if (!user) throw new Error('Not signed in');

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);

    if (error) throw error;
    await refreshProfile();
  }, [user, refreshProfile]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) throw new Error('Not signed in');

    const compressedBlob = await compressAvatar(file);
    const fileName = `${user.id}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    if (updateError) throw updateError;
    await refreshProfile();
  }, [user, refreshProfile]);

  const removeAvatar = useCallback(async () => {
    if (!user) throw new Error('Not signed in');

    const fileName = `${user.id}/avatar.jpg`;
    await supabase.storage.from('avatars').remove([fileName]);

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id);

    if (error) throw error;
    await refreshProfile();
  }, [user, refreshProfile]);

  return { updateUsername, uploadAvatar, removeAvatar };
}
