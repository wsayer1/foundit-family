import { useState, useCallback } from 'react';

export interface TravelTimes {
  driving: string | null;
  walking: string | null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return '< 1 min';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

export function useTravelTimes() {
  const [travelTimes, setTravelTimes] = useState<TravelTimes>({ driving: null, walking: null });

  const fetchTravelTimes = useCallback(async (
    userLat: number,
    userLng: number,
    itemLat: number,
    itemLng: number,
    abortSignal?: AbortSignal
  ) => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) return;

    const coordinates = `${userLng},${userLat};${itemLng},${itemLat}`;

    try {
      const [drivingRes, walkingRes] = await Promise.all([
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${token}`, { signal: abortSignal }),
        fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?access_token=${token}`, { signal: abortSignal })
      ]);

      if (abortSignal?.aborted) return;

      const [drivingData, walkingData] = await Promise.all([
        drivingRes.json(),
        walkingRes.json()
      ]);

      if (abortSignal?.aborted) return;

      setTravelTimes({
        driving: drivingData.routes?.[0]?.duration ? formatDuration(drivingData.routes[0].duration) : null,
        walking: walkingData.routes?.[0]?.duration ? formatDuration(walkingData.routes[0].duration) : null
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setTravelTimes({ driving: null, walking: null });
    }
  }, []);

  return { travelTimes, fetchTravelTimes };
}
