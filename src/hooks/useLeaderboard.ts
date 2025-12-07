import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

export interface LeaderboardEntry extends Profile {
  rank: number;
}

interface UseLeaderboardResult {
  leaderboard: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLeaderboard(currentUserId: string | undefined): UseLeaderboardResult {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: topProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const rankedProfiles: LeaderboardEntry[] = (topProfiles || []).map((profile, index) => ({
        ...profile,
        rank: index + 1,
      }));

      setLeaderboard(rankedProfiles);

      if (currentUserId) {
        const userInTop50 = rankedProfiles.find((p) => p.id === currentUserId);

        if (userInTop50) {
          setCurrentUserRank(userInTop50);
        } else {
          const { data: userProfile, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUserId)
            .maybeSingle();

          if (userError) throw userError;

          if (userProfile) {
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .gt('points', userProfile.points);

            if (countError) throw countError;

            const userRank = (count || 0) + 1;
            setCurrentUserRank({
              ...userProfile,
              rank: userRank,
            });
          }
        }
      } else {
        setCurrentUserRank(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const refresh = useCallback(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, currentUserRank, loading, error, refresh };
}
