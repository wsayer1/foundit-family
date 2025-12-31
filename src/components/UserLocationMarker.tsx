import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface UserLocationMarkerProps {
  map: mapboxgl.Map | null;
  location: { lat: number; lng: number };
}

export function createUserLocationElement(): HTMLElement {
  const userEl = document.createElement('div');
  userEl.className = 'user-location-marker';
  userEl.style.cssText = 'width: 56px; height: 56px; position: relative; z-index: 9999;';

  const pulseOuter = document.createElement('div');
  pulseOuter.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 56px;
    height: 56px;
    margin-left: -28px;
    margin-top: -28px;
    background: rgba(59, 130, 246, 0.15);
    border-radius: 50%;
    animation: pulseOuter 2s ease-out infinite;
  `;

  const pulseInner = document.createElement('div');
  pulseInner.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    margin-left: -20px;
    margin-top: -20px;
    background: rgba(59, 130, 246, 0.25);
    border-radius: 50%;
    animation: pulseInner 2s ease-out infinite;
  `;

  const dot = document.createElement('div');
  dot.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin-left: -10px;
    margin-top: -10px;
    background: #3b82f6;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5), 0 1px 4px rgba(0,0,0,0.2);
    z-index: 2;
  `;

  userEl.appendChild(pulseOuter);
  userEl.appendChild(pulseInner);
  userEl.appendChild(dot);

  return userEl;
}

export function useUserLocationMarker({ map, location }: UserLocationMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    const userEl = createUserLocationElement();

    markerRef.current = new mapboxgl.Marker({ element: userEl, anchor: 'center' })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    const markerElement = markerRef.current.getElement();
    markerElement.style.zIndex = '9999';

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, location.lat, location.lng]);

  return markerRef;
}
