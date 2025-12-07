import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationPickerProps {
  imageData: string;
  initialLocation: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
  onConfirm: (location: { lat: number; lng: number }) => void;
  onBack: () => void;
}

const MAX_DISTANCE_METERS = 100;

export function LocationPicker({
  imageData,
  initialLocation,
  userLocation,
  onConfirm,
  onBack
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pinLocation, setPinLocation] = useState(initialLocation);
  const [mapboxToken] = useState(() => import.meta.env.VITE_MAPBOX_TOKEN || '');

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const constrainToRadius = (lat: number, lng: number): { lat: number; lng: number } => {
    const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
    if (distance <= MAX_DISTANCE_METERS) {
      return { lat, lng };
    }

    const bearing = Math.atan2(
      lng - userLocation.lng,
      lat - userLocation.lat
    );
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * Math.cos((userLocation.lat * Math.PI) / 180);

    return {
      lat: userLocation.lat + (MAX_DISTANCE_METERS * Math.cos(bearing)) / metersPerDegreeLat,
      lng: userLocation.lng + (MAX_DISTANCE_METERS * Math.sin(bearing)) / metersPerDegreeLng
    };
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLocation.lng, initialLocation.lat],
      zoom: 17,
      attributionControl: false
    });

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('radius', {
        type: 'geojson',
        data: createCircleGeoJSON(userLocation.lat, userLocation.lng, MAX_DISTANCE_METERS)
      });

      map.current.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.1
        }
      });

      map.current.addLayer({
        id: 'radius-line',
        type: 'line',
        source: 'radius',
        paint: {
          'line-color': '#10b981',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    });

    map.current.on('moveend', () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      const constrained = constrainToRadius(center.lat, center.lng);

      if (constrained.lat !== center.lat || constrained.lng !== center.lng) {
        map.current.setCenter([constrained.lng, constrained.lat]);
      }
      setPinLocation(constrained);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const createCircleGeoJSON = (lat: number, lng: number, radiusMeters: number) => {
    const points = 64;
    const coords: [number, number][] = [];
    const distanceX = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
    const distanceY = radiusMeters / 111320;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = lng + distanceX * Math.cos(theta);
      const y = lat + distanceY * Math.sin(theta);
      coords.push([x, y]);
    }
    coords.push(coords[0]);

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords]
      }
    };
  };

  if (!mapboxToken) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
        <div className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 h-14 flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-stone-600 dark:text-stone-400">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold text-stone-900 dark:text-stone-100">Confirm location</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-full mb-4">
            <MapPin className="text-amber-600 dark:text-amber-400" size={32} />
          </div>
          <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Map not available</h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6">Mapbox token not configured. Using your current location.</p>
          <button
            onClick={() => onConfirm(initialLocation)}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Continue with current location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      <div className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-lg px-4 h-14 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-white">Adjust location</h1>
      </div>

      <div className="p-4">
        <div className="rounded-2xl overflow-hidden shadow-xl">
          <img
            src={imageData}
            alt="Captured item"
            className="w-full aspect-video object-cover"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          <div
            ref={mapContainer}
            className="w-72 h-72 rounded-full overflow-hidden shadow-2xl"
            style={{
              clipPath: 'circle(50% at 50% 50%)'
            }}
          />
          <div className="absolute inset-0 rounded-full border-4 border-white/30 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg -translate-y-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pb-8 text-center">
        <p className="text-white/70 text-sm mb-4">
          Move the map to adjust the location (up to 100m)
        </p>
        <button
          onClick={() => onConfirm(pinLocation)}
          className="w-full max-w-sm mx-auto bg-emerald-500 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <Check size={20} />
          Confirm location
        </button>
      </div>
    </div>
  );
}
