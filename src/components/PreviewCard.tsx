import { Clock, User } from 'lucide-react';
import type { ItemWithProfile } from '../types/database';
import { formatTimeAgo, calculateRingDecay, getFreshnessColor } from '../utils/time';
import { getThumbnailUrl, getAvatarUrl } from '../utils/image';

interface PreviewCardProps {
  item: ItemWithProfile;
  onClick?: () => void;
}

export function PreviewCard({ item, onClick }: PreviewCardProps) {
  const freshness = calculateRingDecay(item.created_at, item.last_confirmed_at);
  const isExpired = freshness <= 0;
  const freshnessColor = getFreshnessColor(freshness);

  return (
    <div
      onClick={onClick}
      className={`w-full bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm text-left ${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200 group' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={getThumbnailUrl(item.image_url)}
          alt={item.description}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 ${onClick ? 'group-hover:scale-105' : ''} ${isExpired ? 'opacity-70 grayscale-[30%]' : ''}`}
        />
        {isExpired && (
          <div className="absolute top-3 left-3 bg-stone-700/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Clock size={12} className="text-stone-300" />
            <span className="text-xs font-medium text-stone-200">Past listing</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-stone-800 dark:text-stone-200 font-medium line-clamp-2 leading-snug text-[15px]">
          {item.description}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0">
            {item.profiles?.avatar_url ? (
              <img
                src={getAvatarUrl(item.profiles.avatar_url, 40)}
                alt={item.profiles.username || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={10} className="text-stone-400 dark:text-stone-500" />
              </div>
            )}
          </div>
          <span className="text-stone-600 dark:text-stone-400 truncate max-w-[80px]">
            {item.profiles?.username || 'Anonymous'}
          </span>
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <Clock size={12} className="flex-shrink-0" />
          <span className="flex-shrink-0">{formatTimeAgo(item.created_at)}</span>
        </div>

        {!isExpired && item.status === 'available' && (
          <div className="mt-2">
            <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${freshnessColor} rounded-full transition-all duration-300`}
                style={{ width: `${freshness * 100}%` }}
              />
            </div>
          </div>
        )}

        {isExpired && (
          <div className="mt-2">
            <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div className="h-full bg-stone-300 dark:bg-stone-600 rounded-full w-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PreviewCardSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-stone-200 dark:bg-stone-800" />
      <div className="p-3">
        <div className="space-y-1.5">
          <div className="h-[18px] bg-stone-200 dark:bg-stone-700 rounded w-full" />
          <div className="h-[18px] bg-stone-200 dark:bg-stone-700 rounded w-2/3" />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 flex-shrink-0" />
          <div className="h-3.5 bg-stone-200 dark:bg-stone-700 rounded w-16" />
          <div className="w-1 h-1 rounded-full bg-stone-200 dark:bg-stone-700" />
          <div className="h-3.5 bg-stone-200 dark:bg-stone-700 rounded w-12" />
        </div>
        <div className="mt-2">
          <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}
