import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Car, Footprints, MapPinOff, Info, RefreshCw } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from '../contexts/LocationContext';
import { useTravelTimes } from '../hooks/useTravelTimes';
import { calculateDistance } from '../utils/distance';
import type { ItemWithProfile } from '../types/database';

export const PROXIMITY_RADIUS_METERS = 100;
const CIRCLE_SEGMENTS = 64;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

function createGeoJSONCircle(center: [number, number], radiusMeters: number): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const distanceX = radiusMeters / (111320 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusMeters / 110540;

  for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
    const theta = (i / CIRCLE_SEGMENTS) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  };
}

interface ItemDetailMapProps {
  item: ItemWithProfile;
}

export function ItemDetailMap({ item }: ItemDetailMapProps) {
  const { location, permissionStatus, requestLocation, loading: locationLoading } = useLocation();
  const { travelTimes, fetchTravelTimes } = useTravelTimes();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const itemMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const mapInitializedRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [showProximityTooltip, setShowProximityTooltip] = useState(false);
  const [isUserNearby, setIsUserNearby] = useState(false);

  const initializeMap = useCallback(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) {
      if (!MAPBOX_TOKEN) {
        console.warn('Mapbox token not configured');
      }
      return null;
    }

    if (mapInitializedRef.current && map.current) {
      return null;
    }

    mapInitializedRef.current = true;
    setMapError(false);

    const containerRef = mapContainer.current;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const defaultCenter: [number, number] = [-122.4194, 37.7749];

    try {
      const mapInstance = new mapboxgl.Map({
        container: containerRef,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: defaultCenter,
        zoom: 14,
        attributionControl: false,
        interactive: true
      });

      map.current = mapInstance;
      return mapInstance;
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setMapError(true);
      mapInitializedRef.current = false;
      return null;
    }
  }, []);

  const handleRetryMap = useCallback(() => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    mapInitializedRef.current = false;
    setMapLoaded(false);
    setMapReady(false);
    setMapError(false);
    itemMarkerRef.current = null;
    userMarkerRef.current = null;

    const mapInstance = initializeMap();
    if (mapInstance) {
      const handleLoad = () => {
        setMapLoaded(true);
        setTimeout(() => mapInstance.resize(), 0);
      };

      mapInstance.on('load', handleLoad);
      mapInstance.on('error', (e) => {
        console.error('Map error:', e.error);
        setMapError(true);
        setMapLoaded(true);
      });

      if (mapInstance.loaded()) {
        handleLoad();
      }
    }
  }, [initializeMap]);

  useEffect(() => {
    if (mapInitializedRef.current) return;
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    let isCleanedUp = false;
    let mapLoadedLocal = false;

    const mapInstance = initializeMap();
    if (!mapInstance) return;

    const handleLoad = () => {
      if (isCleanedUp) return;
      mapLoadedLocal = true;
      setMapLoaded(true);
      setTimeout(() => mapInstance.resize(), 0);
    };

    mapInstance.on('load', handleLoad);

    mapInstance.on('error', (e) => {
      console.error('Map error:', e.error);
      if (!isCleanedUp) {
        setMapError(true);
        setMapLoaded(true);
      }
    });

    if (mapInstance.loaded()) {
      handleLoad();
    }

    const containerEl = mapContainer.current;
    const resizeObserver = new ResizeObserver(() => {
      if (!isCleanedUp && mapInstance) {
        mapInstance.resize();
      }
    });
    resizeObserver.observe(containerEl);

    const timeoutId = setTimeout(() => {
      if (!isCleanedUp && !mapLoadedLocal) {
        console.warn('Map load timeout - forcing loaded state');
        setMapError(true);
        setMapLoaded(true);
      }
    }, 10000);

    return () => {
      isCleanedUp = true;
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [initializeMap]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      mapInitializedRef.current = false;
      itemMarkerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !item) return;

    const mapInstance = map.current;
    const itemCoords: [number, number] = [item.longitude, item.latitude];

    if (mapInstance.getSource('proximity-circle')) {
      const source = mapInstance.getSource('proximity-circle') as mapboxgl.GeoJSONSource;
      source.setData(createGeoJSONCircle(itemCoords, PROXIMITY_RADIUS_METERS));
    } else {
      mapInstance.addSource('proximity-circle', {
        type: 'geojson',
        data: createGeoJSONCircle(itemCoords, PROXIMITY_RADIUS_METERS)
      });

      mapInstance.addLayer({
        id: 'proximity-circle-fill',
        type: 'fill',
        source: 'proximity-circle',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.15
        }
      });

      mapInstance.addLayer({
        id: 'proximity-circle-stroke',
        type: 'line',
        source: 'proximity-circle',
        paint: {
          'line-color': '#10b981',
          'line-width': 2,
          'line-dasharray': [2, 2],
          'line-opacity': 0.7
        }
      });
    }

    if (itemMarkerRef.current) {
      itemMarkerRef.current.setLngLat(itemCoords);
    } else {
      const itemEl = document.createElement('div');
      itemEl.innerHTML = `
        <div style="width: 36px; height: 36px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); border: 3px solid white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      itemMarkerRef.current = new mapboxgl.Marker({ element: itemEl, anchor: 'center' })
        .setLngLat(itemCoords)
        .addTo(mapInstance);
    }

    mapInstance.jumpTo({ center: itemCoords, zoom: 16 });
    setMapReady(true);
  }, [mapLoaded, item.id, item.latitude, item.longitude]);

  useEffect(() => {
    if (!map.current || !mapReady || !item) return;

    const mapInstance = map.current;
    const abortController = new AbortController();
    const itemCoords: [number, number] = [item.longitude, item.latitude];

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (location) {
      const userCoords: [number, number] = [location.longitude, location.latitude];
      const distanceToItem = calculateDistance(location.latitude, location.longitude, item.latitude, item.longitude);
      const userIsNearby = distanceToItem <= PROXIMITY_RADIUS_METERS;
      setIsUserNearby(userIsNearby);

      const circleColor = userIsNearby ? '#10b981' : '#f59e0b';

      if (mapInstance.getLayer('proximity-circle-fill')) {
        mapInstance.setPaintProperty('proximity-circle-fill', 'fill-color', circleColor);
      }
      if (mapInstance.getLayer('proximity-circle-stroke')) {
        mapInstance.setPaintProperty('proximity-circle-stroke', 'line-color', circleColor);
      }

      const userEl = document.createElement('div');
      userEl.innerHTML = `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; background: #3b82f6; border-radius: 50%; opacity: 0.3; animation: pulse-ring 2s ease-out infinite;"></div>
          <div style="position: absolute; inset: 3px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
        </div>
        <style>
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.3; }
            100% { transform: scale(2); opacity: 0; }
          }
        </style>
      `;

      userMarkerRef.current = new mapboxgl.Marker({ element: userEl, anchor: 'center' })
        .setLngLat(userCoords)
        .addTo(mapInstance);

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(itemCoords);
      bounds.extend(userCoords);

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const latDiff = Math.abs(ne.lat - sw.lat);
      const lngDiff = Math.abs(ne.lng - sw.lng);
      const maxDiff = Math.max(latDiff, lngDiff);
      const maxZoom = maxDiff < 0.002 ? 17 : maxDiff < 0.01 ? 15 : maxDiff < 0.05 ? 13 : 11;

      mapInstance.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom,
        duration: 500
      });

      fetchTravelTimes(location.latitude, location.longitude, item.latitude, item.longitude, abortController.signal);
    } else {
      setIsUserNearby(false);
      if (mapInstance.getLayer('proximity-circle-fill')) {
        mapInstance.setPaintProperty('proximity-circle-fill', 'fill-color', '#f59e0b');
      }
      if (mapInstance.getLayer('proximity-circle-stroke')) {
        mapInstance.setPaintProperty('proximity-circle-stroke', 'line-color', '#f59e0b');
      }
    }

    return () => {
      abortController.abort();
    };
  }, [location, mapReady, item.id, item.latitude, item.longitude, fetchTravelTimes]);

  return (
    <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm bg-stone-200 dark:bg-stone-800">
      <div ref={mapContainer} className="absolute inset-0" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
          {MAPBOX_TOKEN ? (
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-stone-500 dark:text-stone-400">Loading map...</p>
            </div>
          ) : (
            <div className="text-center px-4">
              <MapPin size={24} className="text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-500 dark:text-stone-400">Map unavailable</p>
            </div>
          )}
        </div>
      )}

      {mapLoaded && mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
          <div className="text-center px-4">
            <MapPinOff size={24} className="text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">Failed to load map</p>
            <button
              onClick={handleRetryMap}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      )}

      {!location && permissionStatus !== 'granted' && mapReady && (
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/60 to-transparent flex flex-col items-center justify-end p-4">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <MapPinOff size={16} />
            <span className="text-sm">Location not available</span>
          </div>
          <button
            onClick={() => requestLocation(true)}
            disabled={locationLoading}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            {locationLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MapPin size={14} />
            )}
            Enable location
          </button>
        </div>
      )}

      {mapReady && (
        <button
          onClick={() => setShowProximityTooltip(!showProximityTooltip)}
          className="absolute bottom-2 right-2 bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm p-1.5 rounded-lg shadow-sm hover:bg-white dark:hover:bg-stone-700 transition-colors"
        >
          <Info size={16} className={isUserNearby ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} />
        </button>
      )}

      {showProximityTooltip && (
        <div className="absolute bottom-10 right-2 bg-white dark:bg-stone-800 rounded-xl shadow-lg p-3 max-w-[200px] border border-stone-200 dark:border-stone-700">
          <div className="flex items-start gap-2">
            <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${isUserNearby ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div>
              <p className="text-xs font-medium text-stone-900 dark:text-stone-100">
                {isUserNearby ? 'You\'re within range!' : 'Get closer to interact'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {isUserNearby
                  ? 'You can verify or claim this item.'
                  : `Move within ${PROXIMITY_RADIUS_METERS}m of the item to verify or claim it.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {(travelTimes.driving || travelTimes.walking) && (
        <div className="absolute top-2 left-2 flex gap-2">
          {travelTimes.driving && (
            <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
              <Car size={14} className="text-stone-500 dark:text-stone-400" />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{travelTimes.driving}</span>
            </div>
          )}
          {travelTimes.walking && (
            <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
              <Footprints size={14} className="text-stone-500 dark:text-stone-400" />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{travelTimes.walking}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
