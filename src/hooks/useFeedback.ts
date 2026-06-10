import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useFeedback() {
  const { user } = useAuth();

  const submitFeedback = useCallback(async (type: 'feedback' | 'bug', message: string) => {
    if (!user) throw new Error('Not signed in');

    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      type,
      message,
    });

    if (error) throw error;
  }, [user]);

  return { submitFeedback };
}
