import { MapPin, Clock, ThumbsUp, Pencil, User, Hand } from 'lucide-react';
import type { ItemWithProfile } from '../types/database';
import { formatTimeAgo, calculateRingDecay, getFreshnessColor } from '../utils/time';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { getThumbnailUrl, getAvatarUrl } from '../utils/image';

interface ItemCardProps {
  item: ItemWithProfile;
  userLocation?: { lat: number; lng: number } | null;
  currentUserId?: string | null;
  onClick?: () => void;
  onEdit?: () => void;
}

function getClaimerFirstName(item: ItemWithProfile): string {
  const username = item.claimer_profile?.username;
  if (!username) return 'Someone';
  const firstName = username.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

export function ItemCard({ item, userLocation, currentUserId, onClick, onEdit }: ItemCardProps) {
  const isOwner = currentUserId === item.user_id;
  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude)
    : null;
  const freshness = calculateRingDecay(item.created_at, item.last_confirmed_at);
  const freshnessColor = getFreshnessColor(freshness);
  const isClaimed = item.status === 'claimed';

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
          className={`w-full h-full object-cover transition-transform duration-300 ${isClaimed ? 'opacity-60' : 'group-hover:scale-105'}`}
        />
        {isClaimed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-12">
              <div className="bg-stone-700/90 backdrop-blur-sm py-2 px-4 flex items-center justify-center gap-2 shadow-lg">
                <Hand size={16} className="text-white" />
                <span className="font-semibold text-white text-sm tracking-wide">
                  Claimed by {getClaimerFirstName(item)}
                </span>
              </div>
            </div>
          </div>
        )}
        {isOwner && !isClaimed && (
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
        {item.still_there_count > 0 && !isClaimed && (
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
          <div className="mt-2">
            <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${freshnessColor} rounded-full transition-all duration-300`}
                style={{ width: `${freshness * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm">
      <div className="aspect-[4/3] bg-stone-200 dark:bg-stone-800 animate-pulse" />
      <div className="p-3">
        <div className="space-y-1.5">
          <div className="h-[18px] bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-full" />
          <div className="h-[18px] bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-2/3" />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse flex-shrink-0" />
          <div className="h-3.5 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-16" />
          <div className="w-1 h-1 rounded-full bg-stone-200 dark:bg-stone-700" />
          <div className="h-3.5 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-12" />
          <div className="w-1 h-1 rounded-full bg-stone-200 dark:bg-stone-700" />
          <div className="h-3.5 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-10" />
        </div>
        <div className="mt-2">
          <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
