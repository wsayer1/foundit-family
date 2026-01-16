import { useNavigate } from 'react-router-dom';
import { Trophy, Award, Package, ShoppingBag, MapPin, Sparkles, User } from 'lucide-react';
import { Layout } from '../components/Layout';
import { PullToRefresh } from '../components/PullToRefresh';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard, LeaderboardEntry } from '../hooks/useLeaderboard';

function getRankStyle(rank: number): { bg: string; text: string; border: string } {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-700',
      };
    case 2:
      return {
        bg: 'bg-stone-200 dark:bg-stone-700/50',
        text: 'text-stone-600 dark:text-stone-300',
        border: 'border-stone-300 dark:border-stone-600',
      };
    case 3:
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-700',
      };
    default:
      return {
        bg: 'bg-stone-100 dark:bg-stone-800',
        text: 'text-stone-600 dark:text-stone-400',
        border: 'border-transparent',
      };
  }
}

function LeaderboardEntrySkeleton() {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full" />
        <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-24 mb-2" />
          <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-16" />
        </div>
        <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-16" />
      </div>
    </div>
  );
}

function ProfileAvatar({ avatarUrl, username, size = 'md' }: { avatarUrl: string | null; username: string | null; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username || 'User'}
        className={`${sizeClasses} rounded-full object-cover bg-stone-200 dark:bg-stone-700`}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center`}>
      <User size={size === 'sm' ? 14 : 18} className="text-stone-400 dark:text-stone-500" />
    </div>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
  showAvatar,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  showAvatar: boolean;
}) {
  const rankStyle = getRankStyle(entry.rank);

  return (
    <div
      className={`bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm transition-all ${
        isCurrentUser
          ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-2 ring-offset-stone-50 dark:ring-offset-stone-950'
          : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 flex-shrink-0 ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}`}
        >
          {entry.rank}
        </div>

        {showAvatar && (
          <ProfileAvatar avatarUrl={entry.avatar_url} username={entry.username} />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
            {entry.username || 'Anonymous'}
            {isCurrentUser && (
              <span className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                (You)
              </span>
            )}
          </p>
          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <Package size={12} />
              {entry.items_posted}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag size={12} />
              {entry.items_claimed}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full flex-shrink-0">
          <Award size={16} className="text-amber-500 dark:text-amber-400" />
          <span className="font-bold text-emerald-700 dark:text-emerald-400">
            {entry.points.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaderboard, currentUserRank, loading, refresh } = useLeaderboard(user?.id);

  const handleRefresh = async () => {
    refresh();
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const isUserInTop50 = currentUserRank && currentUserRank.rank <= 50;

  return (
    <Layout>
      <div className="absolute top-0 left-0 right-0 z-40 safe-area-top">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-4">
          <div className="flex-shrink-0 bg-white dark:bg-stone-900 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/20 flex items-center gap-2 border border-stone-200 dark:border-stone-700">
            <img
              src="/foundit.family_logo_small_light_grey_bg.png"
              alt="Foundit.Family"
              className="h-7 sm:h-8 w-auto rounded-lg"
            />
            <span className="font-semibold text-stone-900 dark:text-white text-sm" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>foundit.family</span>
          </div>
        </div>
      </div>
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 pt-16">
        <div className="max-w-lg mx-auto px-4 py-6">
          {currentUserRank ? (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm">Your Rank</p>
                  <p className="text-2xl font-bold">#{currentUserRank.rank}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                  <Award size={18} className="text-amber-300 mx-auto mb-1" />
                  <p className="text-xl font-bold">{currentUserRank.points.toLocaleString()}</p>
                  <p className="text-xs text-emerald-100">Points</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                  <Package size={18} className="mx-auto mb-1 opacity-90" />
                  <p className="text-xl font-bold">{currentUserRank.items_posted}</p>
                  <p className="text-xs text-emerald-100">Posted</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                  <ShoppingBag size={18} className="mx-auto mb-1 opacity-90" />
                  <p className="text-xl font-bold">{currentUserRank.items_claimed}</p>
                  <p className="text-xs text-emerald-100">Claimed</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-emerald-100 text-sm">
                <Sparkles size={16} className="text-amber-300" />
                <span>Keep sharing to climb the ranks!</span>
              </div>
            </div>
          ) : !user ? (
            <div className="bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 rounded-3xl p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-stone-200 dark:bg-stone-700 p-3 rounded-xl">
                  <Trophy size={24} className="text-stone-400 dark:text-stone-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    Track your ranking
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Sign in to see where you stand
                  </p>
                </div>
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-600 transition-colors text-sm"
                >
                  Sign in
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-amber-500" />
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">Top 50</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <LeaderboardEntrySkeleton key={i} />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-stone-100 dark:bg-stone-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-stone-400 dark:text-stone-500" size={32} />
              </div>
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-lg mb-2">
                No community members yet
              </h3>
              <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-xs mx-auto">
                Be the first to post an item and start earning points!
              </p>
              <button
                onClick={() => navigate(user ? '/post' : '/auth')}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
              >
                {user ? 'Post an item' : 'Get started'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  isCurrentUser={entry.id === user?.id}
                  showAvatar={entry.rank <= 5}
                />
              ))}

              {currentUserRank && !isUserInTop50 && (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 border-t border-dashed border-stone-300 dark:border-stone-700" />
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      Your position
                    </span>
                    <div className="flex-1 border-t border-dashed border-stone-300 dark:border-stone-700" />
                  </div>
                  <LeaderboardRow entry={currentUserRank} isCurrentUser showAvatar={false} />
                </>
              )}
            </div>
          )}
        </div>
      </PullToRefresh>
    </Layout>
  );
}
