import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Navigation, Plus, Minus, Compass } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ItemWithProfile } from '../types/database';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { formatTimeAgo, calculateFreshness, getFreshnessOpacity } from '../utils/time';
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
      const freshness = calculateFreshness(item.created_at, item.last_confirmed_at);
      const opacity = getFreshnessOpacity(freshness);
      const pinColor = freshness > 0.7 ? '#10b981' : freshness > 0.4 ? '#f59e0b' : '#78716c';
      const isSelected = selectedItem?.id === item.id;

      const el = document.createElement('div');
      el.className = 'item-marker';
      el.style.opacity = String(opacity);
      el.style.zIndex = isSelected ? '1000' : '1';
      el.style.transition = 'all 0.2s ease-out';

      if (isSelected) {
        el.innerHTML = `
          <div class="relative">
            <div style="width: 52px; height: 52px; border-radius: 50%; overflow: hidden; border: 3px solid ${pinColor}; box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 0 4px rgba(16, 185, 129, 0.2);">
              <img src="${getPreviewUrl(item.image_url)}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid ${pinColor};"></div>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div style="width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; transform-origin: center bottom;">
            <img src="${getPreviewUrl(item.image_url)}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        `;
        const innerEl = el.firstElementChild as HTMLElement;
        if (innerEl) {
          el.addEventListener('mouseenter', () => {
            innerEl.style.transform = 'scale(1.1)';
            innerEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
          });
          el.addEventListener('mouseleave', () => {
            innerEl.style.transform = 'scale(1)';
            innerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          });
        }
      }

      el.addEventListener('click', () => {
        setSelectedItem(item);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([item.longitude, item.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [items, mapLoaded, selectedItem]);

  const handleFlyToUser = () => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15
      });
    }
  };

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleResetNorth = () => {
    if (map.current) {
      map.current.resetNorth();
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

      {mapLoaded && (
        <div className="absolute bottom-[100px] right-3 z-10 flex flex-col gap-2">
          {userLocation && (
            <button
              onClick={handleFlyToUser}
              className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm w-11 h-11 rounded-xl shadow-lg flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
              aria-label="Go to my location"
            >
              <Navigation size={18} className="text-stone-600 dark:text-stone-300" />
            </button>
          )}
          <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="w-11 h-11 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label="Zoom in"
            >
              <Plus size={18} className="text-stone-600 dark:text-stone-300" />
            </button>
            <div className="h-px bg-stone-200 dark:bg-stone-700" />
            <button
              onClick={handleZoomOut}
              className="w-11 h-11 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label="Zoom out"
            >
              <Minus size={18} className="text-stone-600 dark:text-stone-300" />
            </button>
            <div className="h-px bg-stone-200 dark:bg-stone-700" />
            <button
              onClick={handleResetNorth}
              className="w-11 h-11 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label="Reset north"
            >
              <Compass size={18} className="text-stone-600 dark:text-stone-300" />
            </button>
          </div>
        </div>
      )}

      {selectedItem && (
        <>
          <div className="hidden md:block absolute top-4 left-3 z-20 w-64">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden border border-stone-200/50 dark:border-stone-700/50">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 right-2 z-10 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/60 transition-colors"
              >
                <X size={14} />
              </button>
              <button
                onClick={() => navigate(`/item/${selectedItem.id}`)}
                className="w-full text-left"
              >
                <div className="relative">
                  <img
                    src={getPreviewUrl(selectedItem.image_url)}
                    alt={selectedItem.description}
                    loading="lazy"
                    className="w-full aspect-square object-cover bg-stone-100 dark:bg-stone-800"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-8">
                    <p className="text-xs text-white/80">
                      {formatTimeAgo(selectedItem.created_at)}
                      {userLocation && (
                        <span className="ml-1.5">
                          · {formatDistance(
                            calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              selectedItem.latitude,
                              selectedItem.longitude
                            )
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-stone-900 dark:text-stone-100 text-sm line-clamp-2 leading-snug">
                    {selectedItem.description}
                  </p>
                  {selectedItem.status === 'available' && (() => {
                    const itemFreshness = calculateFreshness(selectedItem.created_at, selectedItem.last_confirmed_at);
                    const freshnessColor = itemFreshness > 0.7 ? 'bg-emerald-500' : itemFreshness > 0.4 ? 'bg-amber-500' : 'bg-stone-400';
                    return (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${freshnessColor} rounded-full transition-all duration-300`}
                            style={{ width: `${itemFreshness * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500 flex-shrink-0">{Math.round(itemFreshness * 100)}%</span>
                      </div>
                    );
                  })()}
                  <div className="mt-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    <span>View details</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="md:hidden absolute bottom-[76px] left-0 right-0 z-20 px-3 pb-2">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden border border-stone-200/50 dark:border-stone-700/50">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm text-white w-9 h-9 min-w-[44px] min-h-[44px] rounded-full hover:bg-black/70 transition-colors flex items-center justify-center"
              >
                <X size={18} />
              </button>
              <button
                onClick={() => navigate(`/item/${selectedItem.id}`)}
                className="w-full text-left flex"
              >
                <div className="relative w-32 h-32 flex-shrink-0">
                  <img
                    src={getPreviewUrl(selectedItem.image_url)}
                    alt={selectedItem.description}
                    loading="lazy"
                    className="w-full h-full object-cover bg-stone-100 dark:bg-stone-800"
                  />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                      {formatTimeAgo(selectedItem.created_at)}
                      {userLocation && (
                        <span className="ml-1.5">
                          · {formatDistance(
                            calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              selectedItem.latitude,
                              selectedItem.longitude
                            )
                          )}
                        </span>
                      )}
                    </p>
                    <p className="font-medium text-stone-900 dark:text-stone-100 text-sm line-clamp-3 leading-snug pr-8">
                      {selectedItem.description}
                    </p>
                    {selectedItem.status === 'available' && (() => {
                      const itemFreshness = calculateFreshness(selectedItem.created_at, selectedItem.last_confirmed_at);
                      const freshnessColor = itemFreshness > 0.7 ? 'bg-emerald-500' : itemFreshness > 0.4 ? 'bg-amber-500' : 'bg-stone-400';
                      return (
                        <div className="mt-2 flex items-center gap-2 pr-8">
                          <div className="flex-1 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${freshnessColor} rounded-full transition-all duration-300`}
                              style={{ width: `${itemFreshness * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-stone-400 dark:text-stone-500 flex-shrink-0">{Math.round(itemFreshness * 100)}%</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-2">
                    <span>View details</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
