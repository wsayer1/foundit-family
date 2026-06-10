import { calculateDistance } from './distance';

function metersPerPixelAtZoom(latitude: number, zoom: number): number {
  return 156543.03392 * Math.cos(latitude * Math.PI / 180) / Math.pow(2, zoom);
}

export function metersToPixels(meters: number, latitude: number, zoom: number): number {
  const mpp = metersPerPixelAtZoom(latitude, zoom);
  return meters / mpp;
}

export function constrainToRadius(
  targetLat: number,
  targetLng: number,
  centerLat: number,
  centerLng: number,
  maxDistanceMeters: number
): { lat: number; lng: number } {
  const distance = calculateDistance(centerLat, centerLng, targetLat, targetLng);
  if (distance <= maxDistanceMeters) {
    return { lat: targetLat, lng: targetLng };
  }

  const bearing = Math.atan2(
    targetLng - centerLng,
    targetLat - centerLat
  );
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180);

  return {
    lat: centerLat + (maxDistanceMeters * Math.cos(bearing)) / metersPerDegreeLat,
    lng: centerLng + (maxDistanceMeters * Math.sin(bearing)) / metersPerDegreeLng
  };
}

export function pixelOffsetToCoords(
  offsetX: number,
  offsetY: number,
  centerLat: number,
  centerLng: number,
  zoom: number
): { lat: number; lng: number } {
  const metersPerPixel = metersPerPixelAtZoom(centerLat, zoom);
  const deltaLat = -(offsetY * metersPerPixel) / 111320;
  const deltaLng = (offsetX * metersPerPixel) / (111320 * Math.cos(centerLat * Math.PI / 180));

  return {
    lat: centerLat + deltaLat,
    lng: centerLng + deltaLng
  };
}

export function coordsToPixelOffset(
  targetLat: number,
  targetLng: number,
  centerLat: number,
  centerLng: number,
  zoom: number
): { x: number; y: number } {
  const metersPerPixel = metersPerPixelAtZoom(centerLat, zoom);
  const deltaLat = targetLat - centerLat;
  const deltaLng = targetLng - centerLng;

  const offsetY = -(deltaLat * 111320) / metersPerPixel;
  const offsetX = (deltaLng * 111320 * Math.cos(centerLat * Math.PI / 180)) / metersPerPixel;

  return { x: offsetX, y: offsetY };
}
