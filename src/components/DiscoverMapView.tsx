import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Navigation, Plus, Minus, Compass, Hand } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ItemWithProfile } from '../types/database';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { formatTimeAgo, calculateFreshness, getFreshnessOpacity } from '../utils/time';
import { getPreviewUrl } from '../utils/image';
import { useTheme } from '../contexts/ThemeContext';
import { FloatingAuthCard } from './FloatingAuthCard';

interface DiscoverMapViewProps {
  items: ItemWithProfile[];
  userLocation: { lat: number; lng: number } | null;
  isGuest?: boolean;
}

const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
};

function getClaimerFirstName(item: ItemWithProfile): string {
  const username = item.claimer_profile?.username;
  if (!username) return 'Someone';
  const firstName = username.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

function createMarkerContent(item: ItemWithProfile, isSelected: boolean): string {
  const isClaimed = item.status === 'claimed';
  const freshness = calculateFreshness(item.created_at, item.last_confirmed_at);
  const pinColor = isClaimed ? '#78716c' : freshness > 0.7 ? '#10b981' : freshness > 0.4 ? '#f59e0b' : '#78716c';

  if (isClaimed) {
    if (isSelected) {
      return `
        <div class="relative">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: #78716c; display: flex; align-items: center; justify-content: center; border: 3px solid #57534e; box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 0 4px rgba(120, 113, 108, 0.2);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/>
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/>
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/>
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </div>
          <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #57534e;"></div>
        </div>
      `;
    }
    return `
      <div style="width: 36px; height: 36px; border-radius: 50%; background: #78716c; display: flex; align-items: center; justify-content: center; border: 2px solid #57534e; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; transform-origin: center bottom;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/>
          <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/>
          <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/>
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>
      </div>
    `;
  }

  if (isSelected) {
    return `
      <div class="relative">
        <div style="width: 52px; height: 52px; border-radius: 50%; overflow: hidden; border: 3px solid ${pinColor}; box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 0 4px rgba(16, 185, 129, 0.2);">
          <img src="${getPreviewUrl(item.image_url)}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid ${pinColor};"></div>
      </div>
    `;
  }

  return `
    <div style="width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; transform-origin: center bottom;">
      <img src="${getPreviewUrl(item.image_url)}" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
  `;
}

function setupHoverEffects(el: HTMLElement, isSelected: boolean) {
  if (isSelected) return;
  const innerEl = el.firstElementChild as HTMLElement;
  if (!innerEl) return;

  const handleEnter = () => {
    innerEl.style.transform = 'scale(1.1)';
    innerEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
  };
  const handleLeave = () => {
    innerEl.style.transform = 'scale(1)';
    innerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  };
  el.addEventListener('mouseenter', handleEnter);
  el.addEventListener('mouseleave', handleLeave);
}

export function DiscoverMapView({ items, userLocation, isGuest = false }: DiscoverMapViewProps) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersMapRef = useRef<Map<string, { marker: mapboxgl.Marker; element: HTMLElement; item: ItemWithProfile }>>(new Map());
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const initialFlyDoneRef = useRef(false);
  const currentStyleRef = useRef(resolvedTheme);
  const [selectedItem, setSelectedItem] = useState<ItemWithProfile | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken] = useState(() => import.meta.env.VITE_MAPBOX_TOKEN || '');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleItemClick = () => {
    if (isGuest) {
      setShowAuthModal(true);
    } else if (selectedItem) {
      navigate(`/item/${selectedItem.id}`);
    }
  };

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
      zoom: userLocation ? 11 : 11,
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
          zoom: 11
        });
      }
    }
  }, [userLocation, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const currentItemIds = new Set(items.map(item => item.id));
    const existingIds = new Set(markersMapRef.current.keys());

    existingIds.forEach(id => {
      if (!currentItemIds.has(id)) {
        const entry = markersMapRef.current.get(id);
        if (entry) {
          entry.marker.remove();
          markersMapRef.current.delete(id);
        }
      }
    });

    items.forEach((item) => {
      if (markersMapRef.current.has(item.id)) return;

      const isClaimed = item.status === 'claimed';
      const freshness = calculateFreshness(item.created_at, item.last_confirmed_at);
      const opacity = isClaimed ? 0.7 : getFreshnessOpacity(freshness);

      const el = document.createElement('div');
      el.className = 'item-marker';
      el.style.opacity = String(opacity);
      el.style.zIndex = '1';
      el.innerHTML = createMarkerContent(item, false);
      setupHoverEffects(el, false);

      el.addEventListener('click', () => {
        setSelectedItem(item);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([item.longitude, item.latitude])
        .addTo(map.current!);

      markersMapRef.current.set(item.id, { marker, element: el, item });
    });
  }, [items, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded) return;

    markersMapRef.current.forEach(({ element, item }) => {
      const isSelected = selectedItem?.id === item.id;
      element.style.zIndex = isSelected ? '1000' : '1';
      element.innerHTML = createMarkerContent(item, isSelected);
      setupHoverEffects(element, isSelected);
    });
  }, [selectedItem, mapLoaded]);

  const handleFlyToUser = () => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14
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
                onClick={handleItemClick}
                className="w-full text-left"
              >
                <div className="relative">
                  <img
                    src={getPreviewUrl(selectedItem.image_url)}
                    alt={selectedItem.description}
                    loading="lazy"
                    className={`w-full aspect-square object-cover bg-stone-100 dark:bg-stone-800 ${selectedItem.status === 'claimed' ? 'opacity-60' : ''}`}
                  />
                  {selectedItem.status === 'claimed' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-stone-700/90 backdrop-blur-sm py-1.5 px-3 rounded-full flex items-center gap-1.5">
                        <Hand size={14} className="text-white" />
                        <span className="font-medium text-white text-xs">
                          Claimed by {getClaimerFirstName(selectedItem)}
                        </span>
                      </div>
                    </div>
                  )}
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
                    <span>{isGuest ? 'Sign up to view' : 'View details'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="md:hidden absolute bottom-[140px] left-0 right-0 z-20 px-3">
            <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden border border-stone-200/50 dark:border-stone-700/50">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm text-white w-9 h-9 min-w-[44px] min-h-[44px] rounded-full hover:bg-black/70 transition-colors flex items-center justify-center"
              >
                <X size={18} />
              </button>
              <button
                onClick={handleItemClick}
                className="w-full text-left flex"
              >
                <div className="relative w-36 flex-shrink-0 self-stretch min-h-[120px]">
                  <img
                    src={getPreviewUrl(selectedItem.image_url)}
                    alt={selectedItem.description}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover bg-stone-100 dark:bg-stone-800 ${selectedItem.status === 'claimed' ? 'opacity-60' : ''}`}
                  />
                  {selectedItem.status === 'claimed' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-stone-700/90 backdrop-blur-sm py-1 px-2 rounded-full flex items-center gap-1">
                        <Hand size={12} className="text-white" />
                        <span className="font-medium text-white text-[10px]">
                          Claimed
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    {selectedItem.status === 'claimed' ? (
                      <p className="text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                        Claimed by {getClaimerFirstName(selectedItem)}
                      </p>
                    ) : (
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
                    )}
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
                    <span>{isGuest ? 'Sign up to view' : 'View details'}</span>
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

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <FloatingAuthCard
            onSuccess={() => setShowAuthModal(false)}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      )}
    </div>
  );
}
