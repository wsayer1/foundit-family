import { useEffect, useRef, useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StepIndicator } from './LocationPermissionScreen';

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
  const overlayRef = useRef<HTMLDivElement>(null);
  const interactiveAreaRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pinLocation, setPinLocation] = useState(initialLocation);
  const [pinOffset, setPinOffset] = useState({ x: 0, y: 0 });
  const [mapboxToken] = useState(() => import.meta.env.VITE_MAPBOX_TOKEN || '');
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('full');
  const [mapReady, setMapReady] = useState(false);
  const [circleRadius, setCircleRadius] = useState(150);

  useEffect(() => {
    const updateCircleSize = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      setCircleRadius(Math.floor(minDimension * 0.38));
    };

    updateCircleSize();
    window.addEventListener('resize', updateCircleSize);
    return () => window.removeEventListener('resize', updateCircleSize);
  }, []);

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

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (animationPhase !== 'complete' || !map.current || !interactiveAreaRef.current) return;

    const rect = interactiveAreaRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let offsetX = clientX - centerX;
    let offsetY = clientY - centerY;

    const distanceFromCenter = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    if (distanceFromCenter > circleRadius - 40) {
      const scale = (circleRadius - 40) / distanceFromCenter;
      offsetX *= scale;
      offsetY *= scale;
    }

    setPinOffset({ x: offsetX, y: offsetY });

    const mapInstance = map.current;
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();

    const metersPerPixel = 156543.03392 * Math.cos(center.lat * Math.PI / 180) / Math.pow(2, zoom);
    const deltaLat = -(offsetY * metersPerPixel) / 111320;
    const deltaLng = (offsetX * metersPerPixel) / (111320 * Math.cos(center.lat * Math.PI / 180));

    const newLat = center.lat + deltaLat;
    const newLng = center.lng + deltaLng;

    const constrained = constrainToRadius(newLat, newLng);
    setPinLocation(constrained);
  }, [animationPhase, circleRadius, constrainToRadius]);

  const handleCircleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleInteraction]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleInteraction]);

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
      const userMarkerEl = document.createElement('div');
      userMarkerEl.innerHTML = `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; background: rgba(59, 130, 246, 0.2); border-radius: 50%; animation: pulse 2s infinite;"></div>
          <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; background: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      new mapboxgl.Marker({ element: userMarkerEl })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapInstance);

      setMapReady(true);
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
        return {
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
          transition: baseTransition,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          border: '3px solid rgba(255,255,255,0.9)',
        };
      case 'complete':
        return {
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          border: '3px solid rgba(255,255,255,0.9)',
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
    <div className="fixed inset-0 bg-stone-950 flex flex-col overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 z-40 px-4 flex items-center justify-center"
        style={{
          ...getHeaderStyles(),
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingBottom: '16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
        }}
      >
        <StepIndicator currentStep={2} />
      </div>

      <div className="flex-1 relative" style={getMapContainerStyles()}>
        <div
          ref={mapContainer}
          className="absolute inset-0 w-full h-full"
        />

        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: `radial-gradient(circle ${circleRadius}px at center, transparent 0%, transparent 95%, black 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${circleRadius}px at center, transparent 0%, transparent 95%, black 100%)`,
            zIndex: 6,
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: circleRadius * 2,
            height: circleRadius * 2,
            border: '2px solid rgba(255,255,255,0.5)',
            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            zIndex: 10,
          }}
        />

        <div
          ref={interactiveAreaRef}
          onClick={handleCircleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer touch-none"
          style={{
            width: circleRadius * 2,
            height: circleRadius * 2,
            zIndex: 20,
          }}
        />

        <div
          className="overflow-hidden"
          style={{
            ...getPhotoStyles(),
            ...(animationPhase === 'complete' && {
              left: `calc(50% + ${pinOffset.x}px)`,
              top: `calc(50% + ${pinOffset.y}px)`,
            }),
          }}
        >
          <img
            src={imageData}
            alt="Captured item"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-50"
        style={{
          ...getFooterStyles(),
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
          paddingTop: '2.5rem',
        }}
      >
        <p
          className="text-white/60 text-sm text-center mb-3 px-4"
          style={{
            opacity: animationPhase === 'complete' ? 1 : 0,
            transition: 'opacity 300ms ease-out 200ms',
          }}
        >
          Tap within the circle to position the item
        </p>
        <div
          className="px-4 flex gap-3 max-w-md mx-auto"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onBack}
            className="flex-1 bg-white/10 backdrop-blur-sm text-white py-4 rounded-2xl font-semibold hover:bg-white/20 active:scale-[0.98] transition-all border border-white/20"
          >
            <span className="flex items-center justify-center gap-2">
              <X size={20} strokeWidth={2.5} />
              Cancel
            </span>
          </button>
          <button
            onClick={() => onConfirm(pinLocation)}
            className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-semibold hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
          >
            <span className="flex items-center justify-center gap-2">
              <Check size={20} strokeWidth={2.5} />
              Confirm location
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
