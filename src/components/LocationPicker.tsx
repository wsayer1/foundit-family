import { useEffect, useRef, useState, useCallback } from 'react';
import { Check, ArrowLeft, MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StepIndicator } from './LocationPermissionScreen';
import { MapZoomControls } from './MapZoomControls';
import { createUserLocationElement } from './UserLocationMarker';
import { metersToPixels, constrainToRadius, pixelOffsetToCoords, coordsToPixelOffset } from '../utils/map';

interface LocationPickerProps {
  imageData: string;
  initialLocation: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
  onConfirm: (location: { lat: number; lng: number }) => void;
  onBack: () => void;
}

const MAX_DISTANCE_METERS = 100;
const ANIMATION_DURATION = 1200;
const MIN_ZOOM = 14;
const MAX_ZOOM = 20;
const DEFAULT_ZOOM = 18;

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
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [pinLocation, setPinLocation] = useState(initialLocation);
  const [pinOffset, setPinOffset] = useState({ x: 0, y: 0 });
  const [mapboxToken] = useState(() => import.meta.env.VITE_MAPBOX_TOKEN || '');
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('full');
  const [mapReady, setMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [radiusPixels, setRadiusPixels] = useState(0);

  const pinLocationRef = useRef(pinLocation);
  pinLocationRef.current = pinLocation;

  const updateRadiusPixels = useCallback(() => {
    if (!map.current) return;
    const zoom = map.current.getZoom();
    const center = map.current.getCenter();
    const pixels = metersToPixels(MAX_DISTANCE_METERS, center.lat, zoom);
    setRadiusPixels(pixels);
    setCurrentZoom(zoom);

    setPinOffset((currentOffset) => {
      if (currentOffset.x === 0 && currentOffset.y === 0) {
        return currentOffset;
      }
      const newOffset = coordsToPixelOffset(
        pinLocationRef.current.lat,
        pinLocationRef.current.lng,
        center.lat,
        center.lng,
        zoom
      );
      return newOffset;
    });
  }, []);

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (animationPhase !== 'complete' || !map.current) return;

    const container = mapContainer.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let offsetX = clientX - centerX;
    let offsetY = clientY - centerY;

    const distanceFromCenter = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const maxOffset = radiusPixels - 20;

    if (distanceFromCenter > maxOffset) {
      const scale = maxOffset / distanceFromCenter;
      offsetX *= scale;
      offsetY *= scale;
    }

    setPinOffset({ x: offsetX, y: offsetY });

    const mapInstance = map.current;
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();

    const newCoords = pixelOffsetToCoords(offsetX, offsetY, center.lat, center.lng, zoom);
    const constrained = constrainToRadius(newCoords.lat, newCoords.lng, userLocation.lat, userLocation.lng, MAX_DISTANCE_METERS);
    setPinLocation(constrained);
  }, [animationPhase, radiusPixels, userLocation.lat, userLocation.lng]);

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

  const handleZoomIn = useCallback(() => {
    if (map.current && currentZoom < MAX_ZOOM) {
      map.current.zoomIn();
    }
  }, [currentZoom]);

  const handleZoomOut = useCallback(() => {
    if (map.current && currentZoom > MIN_ZOOM) {
      map.current.zoomOut();
    }
  }, [currentZoom]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLocation.lng, initialLocation.lat],
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
      interactive: true,
      dragPan: false,
      dragRotate: false,
      scrollZoom: false,
      touchZoomRotate: false,
      doubleClickZoom: false,
      keyboard: false,
    });

    map.current = mapInstance;

    mapInstance.on('load', () => {
      const userEl = createUserLocationElement();
      userMarkerRef.current = new mapboxgl.Marker({ element: userEl, anchor: 'center' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapInstance);

      const markerElement = userMarkerRef.current.getElement();
      markerElement.style.zIndex = '5';

      updateRadiusPixels();
      setMapReady(true);
    });

    mapInstance.on('zoom', updateRadiusPixels);
    mapInstance.on('move', updateRadiusPixels);

    const resizeObserver = new ResizeObserver(() => {
      mapInstance.resize();
      updateRadiusPixels();
    });
    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
      mapInstance.remove();
    };
  }, [mapboxToken, initialLocation.lat, initialLocation.lng, userLocation.lat, userLocation.lng, updateRadiusPixels]);

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
            <X size={24} />
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

  const getControlsStyles = (): React.CSSProperties => {
    return {
      opacity: animationPhase === 'complete' ? 1 : 0,
      transform: animationPhase === 'complete' ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 400ms ease-out 200ms, transform 400ms ease-out 200ms`,
      pointerEvents: animationPhase === 'complete' ? 'auto' : 'none',
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
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.1)',
            maskImage: `radial-gradient(circle ${radiusPixels}px at center, transparent 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${radiusPixels}px at center, transparent 0%, transparent 100%)`,
            zIndex: 5,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            maskImage: `radial-gradient(circle ${radiusPixels}px at center, transparent 0%, transparent 95%, black 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${radiusPixels}px at center, transparent 0%, transparent 95%, black 100%)`,
            zIndex: 6,
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: radiusPixels * 2,
            height: radiusPixels * 2,
            border: '2px solid rgba(255,255,255,0.5)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.1), inset 0 0 20px rgba(59, 130, 246, 0.1)',
            zIndex: 10,
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none flex items-center justify-center"
          style={{
            width: radiusPixels * 2,
            height: radiusPixels * 2,
            zIndex: 7,
          }}
        >
          <span
            className="text-white/40 text-xs font-medium px-2 py-1 bg-black/30 rounded-full backdrop-blur-sm"
            style={{
              position: 'absolute',
              bottom: '8px',
            }}
          >
            {MAX_DISTANCE_METERS}m radius
          </span>
        </div>

        <div
          onClick={handleCircleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer touch-none"
          style={{
            width: radiusPixels * 2,
            height: radiusPixels * 2,
            zIndex: 20,
          }}
        />

        <div
          className="absolute right-3 z-30"
          style={{
            ...getControlsStyles(),
            bottom: '220px',
          }}
        >
          <MapZoomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            showCompass={false}
            showUserLocation={false}
          />
        </div>
      </div>

      <div
        className="overflow-hidden pointer-events-none"
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
              <ArrowLeft size={20} strokeWidth={2.5} />
              Back
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
