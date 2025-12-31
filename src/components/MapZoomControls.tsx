import { Plus, Minus, Compass, Navigation, MapPin, Loader2 } from 'lucide-react';

interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNorth?: () => void;
  onFlyToUser?: () => void;
  onEnableLocation?: () => void;
  showCompass?: boolean;
  showUserLocation?: boolean;
  locationLoading?: boolean;
  className?: string;
}

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onFlyToUser,
  onEnableLocation,
  showCompass = true,
  showUserLocation = false,
  locationLoading = false,
  className = '',
}: MapZoomControlsProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showUserLocation && onFlyToUser && (
        <button
          onClick={onFlyToUser}
          className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm w-11 h-11 rounded-xl shadow-lg flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
          aria-label="Go to my location"
        >
          <Navigation size={18} className="text-emerald-600 dark:text-emerald-400" />
        </button>
      )}
      {!showUserLocation && onEnableLocation && (
        <button
          onClick={onEnableLocation}
          disabled={locationLoading}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-colors"
          aria-label="Enable location"
        >
          {locationLoading ? (
            <Loader2 size={18} className="text-white animate-spin" />
          ) : (
            <MapPin size={18} className="text-white" />
          )}
        </button>
      )}
      <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={onZoomIn}
          className="w-11 h-11 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          aria-label="Zoom in"
        >
          <Plus size={18} className="text-stone-600 dark:text-stone-300" />
        </button>
        <div className="h-px bg-stone-200 dark:bg-stone-700" />
        <button
          onClick={onZoomOut}
          className="w-11 h-11 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          aria-label="Zoom out"
        >
          <Minus size={18} className="text-stone-600 dark:text-stone-300" />
        </button>
        {showCompass && onResetNorth && (
          <>
            <div className="h-px bg-stone-200 dark:bg-stone-700" />
            <button
              onClick={onResetNorth}
              className="w-11 h-11 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label="Reset north"
            >
              <Compass size={18} className="text-stone-600 dark:text-stone-300" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
