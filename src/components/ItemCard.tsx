import { MapPin, Clock, Check, ThumbsUp, Pencil, User } from 'lucide-react';
import type { ItemWithProfile } from '../types/database';
import { formatTimeAgo, calculateFreshness, getFreshnessColor } from '../utils/time';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { getThumbnailUrl, getAvatarUrl } from '../utils/image';

interface ItemCardProps {
  item: ItemWithProfile;
  userLocation?: { lat: number; lng: number } | null;
  currentUserId?: string | null;
  onClick?: () => void;
  onEdit?: () => void;
}

export function ItemCard({ item, userLocation, currentUserId, onClick, onEdit }: ItemCardProps) {
  const isOwner = currentUserId === item.user_id;
  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude)
    : null;
  const freshness = calculateFreshness(item.created_at, item.last_confirmed_at);
  const freshnessColor = getFreshnessColor(freshness);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 text-left group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={getThumbnailUrl(item.image_url)}
          alt={item.description}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.status === 'claimed' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-stone-800/90 px-4 py-2 rounded-full flex items-center gap-2">
              <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-stone-800 dark:text-stone-200">Claimed</span>
            </div>
          </div>
        )}
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="absolute top-3 right-3 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 transition-colors"
          >
            <Pencil size={16} className="text-stone-600 dark:text-stone-300" />
          </button>
        )}
        {item.still_there_count > 0 && item.status === 'available' && (
          <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <ThumbsUp size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{item.still_there_count}</span>
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
          {distance !== null && (
            <>
              <span className="text-stone-300 dark:text-stone-600">·</span>
              <MapPin size={12} className="flex-shrink-0" />
              <span className="flex-shrink-0">{formatDistance(distance)}</span>
            </>
          )}
        </div>

        {item.status === 'available' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${freshnessColor} rounded-full transition-all duration-300`}
                style={{ width: `${freshness * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-stone-400 dark:text-stone-500 flex-shrink-0">{Math.round(freshness * 100)}%</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-stone-200 dark:bg-stone-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
        <div className="flex gap-4">
          <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-16" />
          <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
