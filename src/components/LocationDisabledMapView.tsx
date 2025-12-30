import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from '../contexts/ThemeContext';

interface LocationDisabledMapViewProps {
  onEnableLocation: () => void;
}

const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
};

const SF_COORDINATES: [number, number] = [-122.4194, 37.7749];
const DEFAULT_ZOOM = 11;

export function LocationDisabledMapView({ onEnableLocation }: LocationDisabledMapViewProps) {
  const { resolvedTheme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapInitialized = useRef(false);
  const currentStyleRef = useRef(resolvedTheme);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken] = useState(() => import.meta.env.VITE_MAPBOX_TOKEN || '');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapInitialized.current) return;

    mapInitialized.current = true;
    mapboxgl.accessToken = mapboxToken;
    currentStyleRef.current = resolvedTheme;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[resolvedTheme],
      center: SF_COORDINATES,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      interactive: false
    });

    map.current = mapInstance;

    mapInstance.on('load', () => {
      setMapLoaded(true);
      setTimeout(() => mapInstance.resize(), 0);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance) {
        mapInstance.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapInitialized.current = false;
      }
    };
  }, [mapboxToken, resolvedTheme]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (currentStyleRef.current === resolvedTheme) return;

    currentStyleRef.current = resolvedTheme;
    map.current.setStyle(MAP_STYLES[resolvedTheme]);
  }, [resolvedTheme, mapLoaded]);

  if (!mapboxToken) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-100 dark:bg-stone-900">
        <div className="text-center p-8">
          <p className="text-stone-600 dark:text-stone-400">Map not available</p>
          <p className="text-sm text-stone-400 dark:text-stone-500">Mapbox token not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-stone-200 dark:bg-stone-800 relative">
      <div ref={mapContainer} className="absolute inset-0" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-900">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-stone-500 dark:text-stone-400">Loading map...</p>
          </div>
        </div>
      )}

      {mapLoaded && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
            <button
              onClick={onEnableLocation}
              className="w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-900 dark:text-stone-100 py-4 px-6 rounded-2xl font-semibold text-base shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 border border-stone-200/50 dark:border-stone-700/50 min-h-[56px]"
              aria-label="Enable location services to see nearby items"
            >
              <div className="bg-emerald-500 p-2 rounded-lg">
                <MapPin size={20} className="text-white" />
              </div>
              <span>Enable Location</span>
            </button>

            <div className="mt-3 text-center">
              <p className="text-sm text-white dark:text-stone-200 font-medium drop-shadow-lg px-4 py-2 bg-black/30 dark:bg-black/40 backdrop-blur-sm rounded-full inline-block">
                See items near you
              </p>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 text-center">
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Showing San Francisco area
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
