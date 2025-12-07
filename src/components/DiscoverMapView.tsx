import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ItemWithProfile } from '../types/database';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { formatTimeAgo, getFreshness } from '../utils/time';
import { getPreviewUrl } from '../utils/image';
import { useTheme } from '../contexts/ThemeContext';

interface DiscoverMapViewProps {
  items: ItemWithProfile[];
  userLocation: { lat: number; lng: number } | null;
}

const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
};

export function DiscoverMapView({ items, userLocation }: DiscoverMapViewProps) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const initialFlyDoneRef = useRef(false);
  const currentStyleRef = useRef(resolvedTheme);
  const [selectedItem, setSelectedItem] = useState<ItemWithProfile | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken] = useState(() => import.meta.env.VITE_MAPBOX_TOKEN || '');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    initialFlyDoneRef.current = false;
    currentStyleRef.current = resolvedTheme;

    const center: [number, number] = userLocation
      ? [userLocation.lng, userLocation.lat]
      : [-122.4194, 37.7749];

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[resolvedTheme],
      center,
      zoom: 14,
      attributionControl: false
    });

    map.current = mapInstance;

    mapInstance.on('load', () => {
      setMapLoaded(true);
      setTimeout(() => mapInstance.resize(), 0);
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance) {
        mapInstance.resize();
      }
    });

    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
      mapInstance.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (currentStyleRef.current === resolvedTheme) return;

    currentStyleRef.current = resolvedTheme;
    map.current.setStyle(MAP_STYLES[resolvedTheme]);
  }, [resolvedTheme, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userEl = document.createElement('div');
      userEl.style.cssText = 'width: 16px; height: 16px; position: relative;';

      const dot = document.createElement('div');
      dot.style.cssText = 'width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';

      const pulse = document.createElement('div');
      pulse.style.cssText = 'position: absolute; top: 0; left: 0; width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; opacity: 0.4; animation: pulse 2s infinite;';

      userEl.appendChild(pulse);
      userEl.appendChild(dot);

      userMarkerRef.current = new mapboxgl.Marker({ element: userEl, anchor: 'center' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);

      if (!initialFlyDoneRef.current) {
        initialFlyDoneRef.current = true;
        map.current.jumpTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 14
        });
      }
    }
  }, [userLocation, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    items.forEach((item) => {
      const freshness = getFreshness(item.created_at);
      const el = document.createElement('div');
      el.className = 'item-marker';
      el.style.opacity = String(freshness);
      el.innerHTML = `
        <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedItem(item);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([item.longitude, item.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [items, mapLoaded]);

  const handleFlyToUser = () => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15
      });
    }
  };

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

      {mapLoaded && userLocation && (
        <button
          onClick={handleFlyToUser}
          className="absolute bottom-24 right-4 bg-white dark:bg-stone-800 p-3 rounded-full shadow-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors z-10"
        >
          <Navigation size={20} className="text-stone-700 dark:text-stone-300" />
        </button>
      )}

      {selectedItem && (
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden max-w-lg mx-auto">
            <div className="flex">
              <img
                src={getPreviewUrl(selectedItem.image_url)}
                alt={selectedItem.description}
                loading="lazy"
                className="w-28 h-28 object-cover flex-shrink-0 bg-stone-100 dark:bg-stone-800"
              />
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-stone-900 dark:text-stone-100 line-clamp-2 text-sm">
                    {selectedItem.description}
                  </p>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {formatTimeAgo(selectedItem.created_at)}
                  {userLocation && (
                    <span className="ml-2">
                      {formatDistance(
                        calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          selectedItem.latitude,
                          selectedItem.longitude
                        )
                      )} away
                    </span>
                  )}
                </p>
                <button
                  onClick={() => navigate(`/item/${selectedItem.id}`)}
                  className="mt-2 bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  View details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
