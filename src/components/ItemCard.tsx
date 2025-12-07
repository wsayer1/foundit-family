import { MapPin, Clock, Check, ThumbsUp } from 'lucide-react';
import type { ItemWithProfile } from '../types/database';
import { formatTimeAgo } from '../utils/time';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { getThumbnailUrl } from '../utils/image';

interface ItemCardProps {
  item: ItemWithProfile;
  userLocation?: { lat: number; lng: number } | null;
  onClick?: () => void;
}

export function ItemCard({ item, userLocation, onClick }: ItemCardProps) {
  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude)
    : null;

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
        {item.still_there_count > 0 && item.status === 'available' && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <ThumbsUp size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{item.still_there_count}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-stone-800 dark:text-stone-200 font-medium line-clamp-2 leading-snug">
          {item.description}
        </p>

        <div className="mt-3 flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
          {distance !== null && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {formatDistance(distance)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatTimeAgo(item.created_at)}
          </span>
        </div>
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
