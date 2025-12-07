import { useEffect, useRef, useState, useCallback } from 'react';
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
const ANIMATION_DURATION = 1200;

type AnimationPhase = 'full' | 'shrinking' | 'complete';

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
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('full');
  const [mapReady, setMapReady] = useState(false);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const constrainToRadius = useCallback((lat: number, lng: number): { lat: number; lng: number } => {
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
  }, [userLocation.lat, userLocation.lng]);

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

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLocation.lng, initialLocation.lat],
      zoom: 17,
      attributionControl: false,
      interactive: false
    });

    map.current = mapInstance;

    mapInstance.on('load', () => {
      mapInstance.addSource('radius', {
        type: 'geojson',
        data: createCircleGeoJSON(userLocation.lat, userLocation.lng, MAX_DISTANCE_METERS)
      });

      mapInstance.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.1
        }
      });

      mapInstance.addLayer({
        id: 'radius-line',
        type: 'line',
        source: 'radius',
        paint: {
          'line-color': '#10b981',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });

      setMapReady(true);
    });

    mapInstance.on('moveend', () => {
      const center = mapInstance.getCenter();
      const constrained = constrainToRadius(center.lat, center.lng);

      if (constrained.lat !== center.lat || constrained.lng !== center.lng) {
        mapInstance.setCenter([constrained.lng, constrained.lat]);
      }
      setPinLocation(constrained);
    });

    return () => {
      mapInstance.remove();
    };
  }, [mapboxToken, initialLocation.lat, initialLocation.lng, userLocation.lat, userLocation.lng, constrainToRadius]);

  useEffect(() => {
    if (!mapReady) return;

    const timer = setTimeout(() => {
      setAnimationPhase('shrinking');
    }, 100);

    return () => clearTimeout(timer);
  }, [mapReady]);

  useEffect(() => {
    if (animationPhase !== 'shrinking') return;

    const timer = setTimeout(() => {
      setAnimationPhase('complete');
      if (map.current) {
        map.current.boxZoom.enable();
        map.current.scrollZoom.enable();
        map.current.dragPan.enable();
        map.current.dragRotate.enable();
        map.current.keyboard.enable();
        map.current.doubleClickZoom.enable();
        map.current.touchZoomRotate.enable();
      }
    }, ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [animationPhase]);

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

  const getPhotoStyles = (): React.CSSProperties => {
    const baseTransition = `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    switch (animationPhase) {
      case 'full':
        return {
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          borderRadius: '0',
          zIndex: 50,
          transition: baseTransition,
        };
      case 'shrinking':
      case 'complete':
        return {
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          transition: baseTransition,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        };
    }
  };

  const getMapContainerStyles = (): React.CSSProperties => {
    const baseTransition = `opacity ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    return {
      opacity: animationPhase === 'full' ? 0 : 1,
      transition: baseTransition,
    };
  };

  const getHeaderStyles = (): React.CSSProperties => {
    return {
      opacity: animationPhase === 'complete' ? 1 : 0,
      transition: `opacity 400ms ease-out`,
    };
  };

  const getFooterStyles = (): React.CSSProperties => {
    return {
      opacity: animationPhase === 'complete' ? 1 : 0,
      transform: animationPhase === 'complete' ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 400ms ease-out, transform 400ms ease-out`,
    };
  };

  return (
    <div className="fixed inset-0 bg-stone-900 flex flex-col overflow-hidden">
      <div
        className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-lg px-4 h-14 flex items-center gap-4"
        style={getHeaderStyles()}
      >
        <button onClick={onBack} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-white">Adjust location</h1>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div
          className="relative"
          style={getMapContainerStyles()}
        >
          <div
            ref={mapContainer}
            className="w-72 h-72 rounded-full overflow-hidden shadow-2xl"
            style={{ clipPath: 'circle(50% at 50% 50%)' }}
          />
          <div className="absolute inset-0 rounded-full border-4 border-white/30 pointer-events-none" />

          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: animationPhase === 'complete' ? 1 : 0, transition: 'opacity 300ms ease-out' }}
          >
            <div className="absolute w-20 h-20 rounded-full border-4 border-emerald-500 shadow-lg" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
        </div>

        <div
          className="overflow-hidden"
          style={getPhotoStyles()}
        >
          <img
            src={imageData}
            alt="Captured item"
            className="w-full h-full object-cover"
          />
        </div>

        {animationPhase === 'complete' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-white/90 text-sm whitespace-nowrap">
              Move the map to adjust location
            </p>
          </div>
        )}
      </div>

      <div
        className="p-4 pb-8"
        style={getFooterStyles()}
      >
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
