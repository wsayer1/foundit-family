import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, TrendingUp, Award, Clock, Flame } from 'lucide-react';
import { useCommunityStats, useRecentActivity } from '../hooks/useCommunityStats';
import { formatTimeAgo } from '../utils/time';
import { getPreviewUrl } from '../utils/image';

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${accent ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-stone-50 dark:bg-stone-800/50'}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-stone-500 dark:text-stone-400">{label}</span>
      </div>
      <p className={`text-xl font-bold ${accent ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function CommunityStatsModule() {
  const { stats, loading } = useCommunityStats();

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-4 shadow-sm">
        <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-32 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-stone-100 dark:bg-stone-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-emerald-500" />
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Community Stats</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Package size={14} className="text-emerald-500" />}
          label="Items Posted"
          value={stats.totalItemsPosted}
          accent
        />
        <StatCard
          icon={<ShoppingBag size={14} className="text-teal-500" />}
          label="Items Claimed"
          value={stats.totalItemsClaimed}
        />
        <StatCard
          icon={<Users size={14} className="text-sky-500" />}
          label="Community Members"
          value={stats.totalUsers}
        />
        <StatCard
          icon={<Flame size={14} className="text-amber-500" />}
          label="Posted This Week"
          value={stats.itemsPostedThisWeek}
          accent
        />
      </div>
      {(stats.itemsPostedToday > 0 || stats.itemsClaimedToday > 0) && (
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mb-2">Today</p>
          <div className="flex items-center gap-4 text-sm">
            {stats.itemsPostedToday > 0 && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Package size={13} />
                {stats.itemsPostedToday} posted
              </span>
            )}
            {stats.itemsClaimedToday > 0 && (
              <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium">
                <ShoppingBag size={13} />
                {stats.itemsClaimedToday} claimed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RecentActivityModule() {
  const navigate = useNavigate();
  const { activities, loading } = useRecentActivity(5);

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-4 shadow-sm">
        <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-full mb-2 animate-pulse" />
                <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded w-20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) return null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-sky-500" />
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/item/${item.id}`)}
            className="w-full flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-lg p-1.5 -m-1.5 transition-colors text-left"
          >
            <img
              src={getPreviewUrl(item.image_url)}
              alt={item.description}
              className="w-10 h-10 rounded-lg object-cover bg-stone-100 dark:bg-stone-800 flex-shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-stone-800 dark:text-stone-200 truncate leading-snug">
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                <span>{formatTimeAgo(item.created_at)}</span>
                {item.username && (
                  <>
                    <span>by {item.username}</span>
                  </>
                )}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.status === 'available' ? 'bg-emerald-500' : item.status === 'claimed' ? 'bg-stone-400' : 'bg-stone-300'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function PointsBreakdownModule() {
  const points = [
    { action: 'Post an item', points: 10, icon: <Package size={14} className="text-emerald-500" /> },
    { action: 'Claim an item', points: 5, icon: <ShoppingBag size={14} className="text-teal-500" /> },
    { action: 'Your item gets claimed', points: 5, icon: <Award size={14} className="text-amber-500" /> },
    { action: 'Confirm "still there"', points: 2, icon: <TrendingUp size={14} className="text-sky-500" /> },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-amber-500" />
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">How Points Work</h3>
      </div>
      <div className="space-y-2.5">
        {points.map((p) => (
          <div key={p.action} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {p.icon}
              <span className="text-sm text-stone-600 dark:text-stone-400">{p.action}</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{p.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSidebar() {
  return (
    <div className="space-y-4">
      <CommunityStatsModule />
      <RecentActivityModule />
      <PointsBreakdownModule />
    </div>
  );
}
