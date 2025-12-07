import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface LocationContextType {
  location: GeolocationCoordinates | null;
  error: string | null;
  permissionStatus: PermissionState | 'unknown';
  loading: boolean;
  locationEnabled: boolean;
  requestLocation: () => Promise<GeolocationCoordinates | null>;
  checkPermission: () => Promise<PermissionState>;
  setLocationEnabled: (enabled: boolean) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { profile, refreshProfile } = useAuth();
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');
  const [loading, setLoading] = useState(false);
  const [locationEnabled, setLocationEnabledState] = useState(true);

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

  const requestLocation = useCallback(async (): Promise<GeolocationCoordinates | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setPermissionStatus('granted');
          setLoading(false);
          resolve(position.coords);
        },
        (err) => {
          setError(err.message);
          setPermissionStatus(err.code === 1 ? 'denied' : 'prompt');
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  }, []);

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
