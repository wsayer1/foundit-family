import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, ThumbsUp, Check, Navigation, Share2, Loader2, X, Camera, Pencil, Car, Footprints, MapPinOff } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { EditItemModal } from '../components/EditItemModal';
import type { ItemWithProfile } from '../types/database';
import { formatTimeAgo } from '../utils/time';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { getAvatarUrl, dataURLtoBlob } from '../utils/image';

interface TravelTimes {
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

export function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { location, permissionStatus, requestLocation, loading: locationLoading } = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const mapInitialized = useRef(false);

  const [item, setItem] = useState<ItemWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [travelTimes, setTravelTimes] = useState<TravelTimes>({ driving: null, walking: null });
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      const { data } = await supabase
        .from('items')
        .select(`*, profiles!items_user_id_fkey (username, avatar_url)`)
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setItem(data as ItemWithProfile);

        if (user) {
          const { data: confirmationData } = await supabase
            .from('confirmations')
            .select('id')
            .eq('item_id', id)
            .eq('user_id', user.id)
            .maybeSingle();

          setHasConfirmed(!!confirmationData);
        }
      }
      setLoading(false);
    };

    fetchItem();
  }, [id, user]);

  const fetchTravelTimes = useCallback(async (
    userLat: number,
    userLng: number,
    itemLat: number,
    itemLng: number
  ) => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) return;

    const coordinates = `${userLng},${userLat};${itemLng},${itemLat}`;

    try {
      const [drivingRes, walkingRes] = await Promise.all([
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${mapboxToken}`),
        fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?access_token=${mapboxToken}`)
      ]);

      const [drivingData, walkingData] = await Promise.all([
        drivingRes.json(),
        walkingRes.json()
      ]);

      setTravelTimes({
        driving: drivingData.routes?.[0]?.duration ? formatDuration(drivingData.routes[0].duration) : null,
        walking: walkingData.routes?.[0]?.duration ? formatDuration(walkingData.routes[0].duration) : null
      });
    } catch {
      setTravelTimes({ driving: null, walking: null });
    }
  }, []);

  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapContainer.current || !item || !mapboxToken || mapInitialized.current) return;

    mapInitialized.current = true;
    mapboxgl.accessToken = mapboxToken;

    const hasUserLocation = location !== null;
    const itemCoords: [number, number] = [item.longitude, item.latitude];
    const userCoords: [number, number] | null = hasUserLocation
      ? [location.longitude, location.latitude]
      : null;

    let initialCenter: [number, number];
    let initialZoom: number;

    if (userCoords) {
      const midLng = (itemCoords[0] + userCoords[0]) / 2;
      const midLat = (itemCoords[1] + userCoords[1]) / 2;
      initialCenter = [midLng, midLat];
      initialZoom = 12;
    } else {
      initialCenter = itemCoords;
      initialZoom = 15;
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      interactive: true
    });

    map.current = mapInstance;

    mapInstance.on('load', () => {
      setMapReady(true);
      mapInstance.resize();

      if (userCoords) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(itemCoords);
        bounds.extend(userCoords);

        mapInstance.fitBounds(bounds, {
          padding: { top: 40, bottom: 40, left: 40, right: 40 },
          maxZoom: 16,
          duration: 0
        });

        fetchTravelTimes(location.latitude, location.longitude, item.latitude, item.longitude);
      }
    });

    const itemEl = document.createElement('div');
    itemEl.innerHTML = `
      <div style="width: 32px; height: 32px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `;

    new mapboxgl.Marker({ element: itemEl, anchor: 'center' })
      .setLngLat(itemCoords)
      .addTo(mapInstance);

    if (userCoords) {
      const userEl = document.createElement('div');
      userEl.innerHTML = `
        <div style="position: relative; width: 20px; height: 20px;">
          <div style="position: absolute; inset: 0; background: #3b82f6; border-radius: 50%; opacity: 0.3; animation: pulse-ring 2s ease-out infinite;"></div>
          <div style="position: absolute; inset: 2px; background: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
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
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapInitialized.current = false;
        setMapReady(false);
      }
      if (userMarkerRef.current) {
        userMarkerRef.current = null;
      }
    };
  }, [item, location, fetchTravelTimes]);

  const handleClaim = async () => {
    if (!user || !item) {
      navigate('/auth');
      return;
    }

    setClaiming(true);

    const { error } = await supabase
      .from('items')
      .update({
        status: 'claimed',
        claimed_by: user.id,
        claimed_at: new Date().toISOString()
      })
      .eq('id', item.id)
      .eq('status', 'available');

    if (!error) {
      setItem({ ...item, status: 'claimed', claimed_by: user.id });
      refreshProfile();
    }

    setClaiming(false);
  };

  const handleConfirmStillThere = async (photoDataUrl: string) => {
    if (!user || !item) {
      navigate('/auth');
      return;
    }

    setConfirming(true);

    try {
      const blob = dataURLtoBlob(photoDataUrl);
      const fileName = `confirmations/${item.id}/${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(fileName);

      const { error } = await supabase.from('confirmations').insert({
        item_id: item.id,
        user_id: user.id,
        photo_url: publicUrl
      });

      if (!error) {
        setItem({
          ...item,
          still_there_count: item.still_there_count + 1,
          last_confirmed_at: new Date().toISOString()
        });
        setHasConfirmed(true);
        refreshProfile();
      }
    } catch (err) {
      console.error('Error confirming item:', err);
    } finally {
      setConfirming(false);
      setShowPhotoCapture(false);
    }
  };

  const handleShare = async () => {
    if (!item) return;

    try {
      await navigator.share({
        title: 'Street Find',
        text: item.description,
        url: window.location.href
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const openDirections = () => {
    if (!item) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">Item not found</h2>
        <p className="text-stone-600 dark:text-stone-400 mb-6">This item may have been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium"
        >
          Back to discover
        </button>
      </div>
    );
  }

  const distance = location
    ? calculateDistance(location.latitude, location.longitude, item.latitude, item.longitude)
    : null;

  const isOwner = user?.id === item.user_id;
  const isClaimer = user?.id === item.claimed_by;
  const isNearby = distance !== null && distance <= 0.1;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-32">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-stone-600 dark:text-stone-400">
            <ArrowLeft size={24} />
          </button>
          <button onClick={handleShare} className="p-2 -mr-2 text-stone-600 dark:text-stone-400">
            <Share2 size={22} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="relative">
          <img
            src={item.image_url}
            alt={item.description}
            className="w-full aspect-square object-cover"
          />
          {item.status === 'claimed' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-white dark:bg-stone-800 px-6 py-3 rounded-full flex items-center gap-2">
                <Check size={22} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">Claimed</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-lg font-medium text-stone-900 dark:text-stone-100 leading-relaxed">
                {item.description}
              </p>
            </div>
            {item.still_there_count > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
                <ThumbsUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {item.still_there_count}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
            {distance !== null && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {formatDistance(distance)} away
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatTimeAgo(item.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0">
              {item.profiles?.avatar_url ? (
                <img
                  src={getAvatarUrl(item.profiles.avatar_url, 80)}
                  alt={item.profiles.username || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={18} className="text-stone-500 dark:text-stone-400" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                {item.profiles?.username || 'Anonymous'}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">Posted this find</p>
            </div>
          </div>

          <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm bg-stone-200 dark:bg-stone-800">
            <div ref={mapContainer} className="w-full h-full" />

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

          <button
            onClick={openDirections}
            className="w-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <Navigation size={18} />
            Get directions
          </button>
        </div>
      </div>

      {item.status === 'available' && isOwner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
            >
              <Pencil size={20} />
              Edit Item
            </button>
          </div>
        </div>
      )}

      {item.status === 'available' && !isOwner && !isNearby && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <button
              disabled
              className="w-full bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <MapPin size={20} />
              Get closer to verify or claim
            </button>
          </div>
        </div>
      )}

      {item.status === 'available' && !isOwner && isNearby && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            {!hasConfirmed && (
              <button
                onClick={() => setShowPhotoCapture(true)}
                disabled={confirming}
                className="flex-1 bg-emerald-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {confirming ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <ThumbsUp size={20} />
                )}
                Still there
              </button>
            )}
            <button
              onClick={handleClaim}
              disabled={claiming}
              className={`${hasConfirmed ? 'w-full' : 'flex-1'} ${hasConfirmed ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700'} ${hasConfirmed ? 'text-white' : 'text-stone-700 dark:text-stone-300'} py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors`}
            >
              {claiming ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Check size={20} />
              )}
              Claim it
            </button>
          </div>
        </div>
      )}

      {item.status === 'claimed' && isClaimer && (
        <div className="fixed bottom-0 left-0 right-0 bg-emerald-50 dark:bg-emerald-900/30 border-t border-emerald-200 dark:border-emerald-800 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">You claimed this item!</p>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1">You earned 5 points</p>
          </div>
        </div>
      )}

      {item.status === 'claimed' && !isClaimer && !isOwner && (
        <div className="fixed bottom-0 left-0 right-0 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-stone-600 dark:text-stone-400 font-medium">This item has been claimed</p>
          </div>
        </div>
      )}

      {item.status === 'claimed' && isOwner && (
        <div className="fixed bottom-0 left-0 right-0 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-stone-600 dark:text-stone-400 font-medium">Your item was claimed</p>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditItemModal
          item={item}
          onClose={() => setShowEditModal(false)}
          onSaved={(updatedItem) => {
            setItem(updatedItem);
            setShowEditModal(false);
          }}
          onDeleted={() => {
            refreshProfile();
            navigate('/', { replace: true });
          }}
        />
      )}

      {showPhotoCapture && (
        <div className="fixed inset-0 z-50 bg-stone-950">
          <div className="h-full flex flex-col">
            <div className="sticky top-0 z-40 bg-stone-950 border-b border-stone-800">
              <div className="px-4 h-14 flex items-center justify-between">
                <button
                  onClick={() => setShowPhotoCapture(false)}
                  className="p-2 -ml-2 text-stone-400 hover:text-stone-100"
                >
                  <X size={24} />
                </button>
                <span className="font-semibold text-stone-100">Verify Item</span>
                <div className="w-10" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <ConfirmationPhotoCapture
                onCapture={handleConfirmStillThere}
                onCancel={() => setShowPhotoCapture(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmationPhotoCapture({ onCapture, onCancel }: { onCapture: (dataUrl: string) => void; onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Unable to access camera');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    onCapture(dataUrl);
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-stone-400 mb-4">{error}</p>
        <button
          onClick={onCancel}
          className="bg-stone-800 text-stone-200 px-6 py-3 rounded-xl font-medium"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-900 mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-stone-800 text-stone-200 py-4 rounded-xl font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={capturePhoto}
          className="flex-1 bg-emerald-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Camera size={20} />
          Take Photo
        </button>
      </div>
    </div>
  );
}
