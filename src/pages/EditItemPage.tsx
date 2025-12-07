import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, MapPin, Check, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Item } from '../types/database';

type EditStep = 'loading' | 'edit' | 'location' | 'saving';

export function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<EditStep>('loading');
  const [item, setItem] = useState<Item | null>(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'available' | 'claimed' | 'expired'>('available');
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchItem = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError || !data) {
        setError('Item not found');
        return;
      }

      if (data.user_id !== user.id) {
        navigate(`/item/${id}`);
        return;
      }

      setItem(data);
      setDescription(data.description);
      setStatus(data.status);
      setPinLocation({ lat: data.latitude, lng: data.longitude });
      setStep('edit');
    };

    fetchItem();
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!item || !pinLocation || !description.trim()) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('items')
      .update({
        description: description.trim(),
        latitude: pinLocation.lat,
        longitude: pinLocation.lng,
        status,
        ...(status === 'claimed' && item.status !== 'claimed' ? {
          claimed_at: new Date().toISOString(),
          claimed_by: user?.id
        } : {})
      })
      .eq('id', item.id)
      .eq('user_id', user?.id);

    if (updateError) {
      setError('Failed to save changes');
      setSaving(false);
      return;
    }

    navigate(`/item/${item.id}`, { replace: true });
  };

  const handleLocationChange = (newLocation: { lat: number; lng: number }) => {
    setPinLocation(newLocation);
    setStep('edit');
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">{error}</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium"
        >
          Back to discover
        </button>
      </div>
    );
  }

  if (step === 'location' && item && pinLocation) {
    return (
      <EditLocationPicker
        currentLocation={pinLocation}
        onConfirm={handleLocationChange}
        onBack={() => setStep('edit')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            disabled={saving}
            className="p-2 -ml-2 text-stone-600 dark:text-stone-400 disabled:opacity-50"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold text-stone-900 dark:text-stone-100">Edit post</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 p-4 pb-32">
        <div className="max-w-lg mx-auto space-y-6">
          {item && (
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={item.image_url}
                alt={item.description}
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              placeholder="Describe this item..."
              className="w-full h-32 resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
            />
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
              Location
            </label>
            <button
              onClick={() => setStep('location')}
              disabled={saving}
              className="w-full flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg">
                <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm text-stone-800 dark:text-stone-200 font-medium">Adjust location</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {pinLocation ? `${pinLocation.lat.toFixed(5)}, ${pinLocation.lng.toFixed(5)}` : 'Not set'}
                </p>
              </div>
            </button>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <StatusButton
                label="Available"
                icon={<Check size={16} />}
                selected={status === 'available'}
                onClick={() => setStatus('available')}
                disabled={saving}
                color="emerald"
              />
              <StatusButton
                label="Claimed"
                icon={<Check size={16} />}
                selected={status === 'claimed'}
                onClick={() => setStatus('claimed')}
                disabled={saving}
                color="blue"
              />
              <StatusButton
                label="Gone"
                icon={<X size={16} />}
                selected={status === 'expired'}
                onClick={() => setStatus('expired')}
                disabled={saving}
                color="stone"
              />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-3">
              {status === 'available' && 'Item is still available for pickup'}
              {status === 'claimed' && 'Mark as claimed when you or someone else takes it'}
              {status === 'expired' && 'Item is no longer there'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            disabled={saving || !description.trim()}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatusButtonProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  color: 'emerald' | 'blue' | 'stone';
}

function StatusButton({ label, icon, selected, onClick, disabled, color }: StatusButtonProps) {
  const getColors = () => {
    if (!selected) {
      return 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400';
    }
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300';
      case 'stone':
        return 'bg-stone-100 dark:bg-stone-700 border-stone-400 text-stone-700 dark:text-stone-300';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-medium text-sm transition-colors disabled:opacity-50 ${getColors()}`}
    >
      {icon}
      {label}
    </button>
  );
}

interface EditLocationPickerProps {
  currentLocation: { lat: number; lng: number };
  onConfirm: (location: { lat: number; lng: number }) => void;
  onBack: () => void;
}

function EditLocationPicker({ currentLocation, onConfirm, onBack }: EditLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pinLocation, setPinLocation] = useState(currentLocation);
  const [mapboxToken] = useState(() => import.meta.env.VITE_MAPBOX_TOKEN || '');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 17,
      attributionControl: false
    });

    map.current = mapInstance;

    mapInstance.on('moveend', () => {
      const center = mapInstance.getCenter();
      setPinLocation({ lat: center.lat, lng: center.lng });
    });

    return () => {
      mapInstance.remove();
    };
  }, [mapboxToken, currentLocation.lat, currentLocation.lng]);

  if (!mapboxToken) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
        <div className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 h-14 flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-stone-600 dark:text-stone-400">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold text-stone-900 dark:text-stone-100">Adjust location</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-stone-600 dark:text-stone-400 mb-6">Map not available</p>
          <button
            onClick={() => onConfirm(currentLocation)}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Keep current location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-950 flex flex-col">
      <div
        className="absolute top-0 left-0 right-0 z-40 px-4 flex items-center gap-3"
        style={{
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          paddingBottom: '16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)'
        }}
      >
        <button
          onClick={onBack}
          className="p-2.5 -ml-1 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-semibold text-white text-lg">Adjust location</h1>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <MapPin size={18} className="text-white" />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-50 px-4"
        style={{
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
          paddingTop: '2.5rem'
        }}
      >
        <p className="text-white/60 text-sm text-center mb-3">
          Drag map to adjust pin location
        </p>
        <button
          onClick={() => onConfirm(pinLocation)}
          className="w-full max-w-sm mx-auto block bg-emerald-500 text-white py-4 rounded-2xl font-semibold hover:bg-emerald-600 transition-all shadow-lg"
        >
          <span className="flex items-center justify-center gap-2">
            <Check size={20} strokeWidth={2.5} />
            Confirm location
          </span>
        </button>
      </div>
    </div>
  );
}

