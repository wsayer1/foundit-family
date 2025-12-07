import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const COORDINATE_CACHE_TTL = 30000;
const SESSION_STORAGE_KEY = 'streetfinds_location_cache';

interface CachedLocation {
  coords: { latitude: number; longitude: number; accuracy: number };
  timestamp: number;
}

interface LocationContextType {
  location: GeolocationCoordinates | null;
  error: string | null;
  permissionStatus: PermissionState | 'unknown';
  loading: boolean;
  locationEnabled: boolean;
  requestLocation: (forceRefresh?: boolean) => Promise<GeolocationCoordinates | null>;
  checkPermission: () => Promise<PermissionState>;
  setLocationEnabled: (enabled: boolean) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

function getCachedLocation(): CachedLocation | null {
  try {
    const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!cached) return null;
    const parsed: CachedLocation = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > COORDINATE_CACHE_TTL) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCachedLocation(coords: GeolocationCoordinates): void {
  try {
    const cache: CachedLocation = {
      coords: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      },
      timestamp: Date.now(),
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Session storage unavailable
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const { profile, refreshProfile } = useAuth();
  const [location, setLocation] = useState<GeolocationCoordinates | null>(() => {
    const cached = getCachedLocation();
    if (cached) {
      return {
        latitude: cached.coords.latitude,
        longitude: cached.coords.longitude,
        accuracy: cached.coords.accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      } as GeolocationCoordinates;
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');
  const [loading, setLoading] = useState(false);
  const [locationEnabled, setLocationEnabledState] = useState(true);
  const pendingRequestRef = useRef<Promise<GeolocationCoordinates | null> | null>(null);

  useEffect(() => {
    if (profile) {
      setLocationEnabledState(profile.location_enabled);
    }
  }, [profile]);

  useEffect(() => {
    const initPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      } catch {
        setPermissionStatus('prompt');
      }
    };
    initPermission();
  }, []);

  const setLocationEnabled = useCallback(async (enabled: boolean) => {
    setLocationEnabledState(enabled);
    if (profile) {
      await supabase
        .from('profiles')
        .update({ location_enabled: enabled })
        .eq('id', profile.id);
      refreshProfile();
    }
  }, [profile, refreshProfile]);

  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(result.state);
      result.onchange = () => setPermissionStatus(result.state);
      return result.state;
    } catch {
      return 'prompt';
    }
  }, []);

  const requestLocation = useCallback(async (forceRefresh = false): Promise<GeolocationCoordinates | null> => {
    if (!forceRefresh && location) {
      const cached = getCachedLocation();
      if (cached) {
        return location;
      }
    }

    if (pendingRequestRef.current) {
      return pendingRequestRef.current;
    }

    setLoading(true);
    setError(null);

    const request = new Promise<GeolocationCoordinates | null>((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        pendingRequestRef.current = null;
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setCachedLocation(position.coords);
          setPermissionStatus('granted');
          setLoading(false);
          pendingRequestRef.current = null;
          resolve(position.coords);
        },
        (err) => {
          setError(err.message);
          setPermissionStatus(err.code === 1 ? 'denied' : 'prompt');
          setLoading(false);
          pendingRequestRef.current = null;
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: forceRefresh ? 0 : COORDINATE_CACHE_TTL,
        }
      );
    });

    pendingRequestRef.current = request;
    return request;
  }, [location]);

  return (
    <LocationContext.Provider value={{ location, error, permissionStatus, loading, locationEnabled, requestLocation, checkPermission, setLocationEnabled }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
