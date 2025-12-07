import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Navigation, WifiOff } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ItemWithProfile } from '../types/database';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { formatTimeAgo, getFreshness } from '../utils/time';
import { getPreviewUrl, getMapMarkerUrl } from '../utils/image';
import { useTheme } from '../contexts/ThemeContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { imageCache } from '../lib/imageCache';

interface DiscoverMapViewProps {
  items: ItemWithProfile[];
  userLocation: { lat: number; lng: number } | null;
}

interface Cluster {
  items: ItemWithProfile[];
  lat: number;
  lng: number;
}

const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
};

const MARKER_SIZE = 56;
const CLUSTER_DISTANCE = 0.0003;

function clusterItems(items: ItemWithProfile[]): Cluster[] {
  const clusters: Cluster[] = [];
  const used = new Set<string>();

  for (const item of items) {
    if (used.has(item.id)) continue;

    const nearby = items.filter(
      (other) =>
        !used.has(other.id) &&
        Math.abs(other.latitude - item.latitude) < CLUSTER_DISTANCE &&
        Math.abs(other.longitude - item.longitude) < CLUSTER_DISTANCE
    );

    nearby.forEach((n) => used.add(n.id));

    const avgLat = nearby.reduce((sum, n) => sum + n.latitude, 0) / nearby.length;
    const avgLng = nearby.reduce((sum, n) => sum + n.longitude, 0) / nearby.length;

    clusters.push({
      items: nearby,
      lat: avgLat,
      lng: avgLng,
    });
  }

  return clusters;
}

function createImageMarkerElement(
  item: ItemWithProfile,
  onClick: () => void
): HTMLDivElement {
  const freshness = getFreshness(item.created_at);
  const el = document.createElement('div');
  el.className = 'image-marker';
  el.style.cssText = `
    width: ${MARKER_SIZE}px;
    height: ${MARKER_SIZE}px;
    cursor: pointer;
    transition: transform 0.2s ease;
    opacity: ${freshness};
    position: relative;
    transform-origin: center center;
    will-change: transform;
  `;

  el.innerHTML = `
    <div class="marker-circle" style="
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.9);
      outline: 1px solid rgba(0,0,0,0.1);
      box-shadow:
        0 4px 12px rgba(0,0,0,0.25),
        0 2px 4px rgba(0,0,0,0.1),
        inset 0 -2px 6px rgba(0,0,0,0.15),
        inset 0 2px 6px rgba(255,255,255,0.2);
      background: #10b981;
      position: relative;
    ">
      <div class="marker-loader" style="
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
      <img
        src="${getMapMarkerUrl(item.image_url)}"
        alt=""
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0;
          transition: opacity 0.3s ease;
        "
        onload="this.style.opacity='1'; this.previousElementSibling.style.display='none';"
        onerror="this.style.display='none';"
      />
      <div class="marker-gloss" style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          rgba(255,255,255,0.3) 0%,
          rgba(255,255,255,0.1) 30%,
          transparent 50%,
          rgba(0,0,0,0.05) 100%
        );
        pointer-events: none;
      "></div>
    </div>
  `;

  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.15)';
    el.style.zIndex = '100';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
    el.style.zIndex = '1';
  });
  el.addEventListener('click', onClick);

  loadAndCacheImage(item);

  return el;
}

async function loadAndCacheImage(item: ItemWithProfile): Promise<void> {
  const cacheKey = `marker-${item.id}`;
  const cached = await imageCache.get(cacheKey);
  if (cached) return;

  try {
    const response = await fetch(getMapMarkerUrl(item.image_url));
    if (response.ok) {
      const blob = await response.blob();
      await imageCache.set(cacheKey, blob);
    }
  } catch {
  }
}

function createFanClusterElement(
  cluster: Cluster,
  onItemClick: (item: ItemWithProfile) => void,
  onExpand: () => void
): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'fan-cluster';
  const maxPreview = Math.min(cluster.items.length, 5);
  const baseSize = MARKER_SIZE;

  el.style.cssText = `
    width: ${baseSize + 20}px;
    height: ${baseSize + 20}px;
    position: relative;
    cursor: pointer;
  `;

  const container = document.createElement('div');
  container.className = 'fan-container';
  container.style.cssText = `
    width: 100%;
    height: 100%;
    position: relative;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  cluster.items.slice(0, maxPreview).forEach((item, index) => {
    const freshness = getFreshness(item.created_at);
    const thumb = document.createElement('div');
    const angle = -20 + (index * 40) / (maxPreview - 1 || 1);
    const offset = index * 3;
    const size = baseSize - index * 4;

    thumb.className = 'fan-item';
    thumb.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) rotate(${angle}deg) translateY(${-offset}px);
      transform-origin: center center;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.9);
      outline: 1px solid rgba(0,0,0,0.1);
      box-shadow:
        0 3px 10px rgba(0,0,0,0.2),
        0 1px 3px rgba(0,0,0,0.1),
        inset 0 -2px 5px rgba(0,0,0,0.12),
        inset 0 2px 5px rgba(255,255,255,0.15);
      background: #10b981;
      z-index: ${maxPreview - index};
      opacity: ${freshness};
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    thumb.innerHTML = `
      <img
        src="${getMapMarkerUrl(item.image_url)}"
        alt=""
        style="width: 100%; height: 100%; object-fit: cover; display: block;"
        onerror="this.style.display='none';"
      />
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          rgba(255,255,255,0.25) 0%,
          rgba(255,255,255,0.08) 30%,
          transparent 50%,
          rgba(0,0,0,0.04) 100%
        );
        pointer-events: none;
      "></div>
    `;

    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      if (el.classList.contains('expanded')) {
        onItemClick(item);
      }
    });

    container.appendChild(thumb);
    loadAndCacheImage(item);
  });

  if (cluster.items.length > 1) {
    const badge = document.createElement('div');
    badge.className = 'cluster-badge';
    badge.style.cssText = `
      position: absolute;
      top: -4px;
      right: -4px;
      background: #10b981;
      color: white;
      font-size: 11px;
      font-weight: 600;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10;
    `;
    badge.textContent = String(cluster.items.length);
    container.appendChild(badge);
  }

  el.appendChild(container);

  el.addEventListener('click', () => {
    if (el.classList.contains('expanded')) {
      collapseCluster(el, cluster.items.length);
    } else {
      expandCluster(el, cluster.items.length);
      onExpand();
    }
  });

  el.addEventListener('mouseleave', () => {
    if (el.classList.contains('expanded')) {
      collapseCluster(el, cluster.items.length);
    }
  });

  return el;
}

function expandCluster(el: HTMLDivElement, itemCount: number): void {
  el.classList.add('expanded');
  const items = el.querySelectorAll('.fan-item') as NodeListOf<HTMLDivElement>;
  const maxPreview = Math.min(itemCount, 5);
  const spreadAngle = 180;
  const startAngle = -spreadAngle / 2;
  const angleStep = maxPreview > 1 ? spreadAngle / (maxPreview - 1) : 0;
  const radius = 45;

  items.forEach((item, index) => {
    const angle = startAngle + index * angleStep;
    const radian = (angle * Math.PI) / 180;
    const x = Math.sin(radian) * radius;
    const y = -Math.cos(radian) * radius;

    item.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(0deg) scale(0.85)`;
    item.style.zIndex = String(10 + index);
    item.style.cursor = 'pointer';
  });
}

function collapseCluster(el: HTMLDivElement, itemCount: number): void {
  el.classList.remove('expanded');
  const items = el.querySelectorAll('.fan-item') as NodeListOf<HTMLDivElement>;
  const maxPreview = Math.min(itemCount, 5);

  items.forEach((item, index) => {
    const angle = -20 + (index * 40) / (maxPreview - 1 || 1);
    const offset = index * 3;
    item.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(${-offset}px)`;
    item.style.zIndex = String(maxPreview - index);
    item.style.cursor = 'pointer';
  });
}

export function DiscoverMapView({ items, userLocation }: DiscoverMapViewProps) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const initialFlyDoneRef = useRef(false);
  const currentStyleRef = useRef(resolvedTheme);
  const [selectedItem, setSelectedItem] = useState<ItemWithProfile | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken] = useState(() => import.meta.env.VITE_MAPBOX_TOKEN || '');

  const handleItemClick = useCallback((item: ItemWithProfile) => {
    setSelectedItem(item);
  }, []);

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
      userEl.style.cssText = 'width: 18px; height: 18px; position: relative;';

      const dot = document.createElement('div');
      dot.style.cssText = 'width: 18px; height: 18px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';

      const pulse = document.createElement('div');
      pulse.style.cssText = 'position: absolute; top: 0; left: 0; width: 18px; height: 18px; background: #3b82f6; border-radius: 50%; opacity: 0.4; animation: pulse 2s infinite;';

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

    const clusters = clusterItems(items);

    clusters.forEach((cluster) => {
      let el: HTMLDivElement;

      if (cluster.items.length === 1) {
        el = createImageMarkerElement(cluster.items[0], () => handleItemClick(cluster.items[0]));
      } else {
        el = createFanClusterElement(cluster, handleItemClick, () => {});
      }

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([cluster.lng, cluster.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [items, mapLoaded, handleItemClick]);

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
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        .fan-cluster.expanded .cluster-badge {
          opacity: 0;
          transform: scale(0);
        }
        .cluster-badge {
          transition: all 0.2s ease;
        }
      `}</style>

      <div ref={mapContainer} className="absolute inset-0" />

      {!isOnline && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
            <WifiOff size={16} />
            You're offline
          </div>
        </div>
      )}

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
