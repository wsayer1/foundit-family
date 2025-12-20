import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, ThumbsUp, Check, Navigation, Share2, Loader2, Pencil } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { EditItemModal } from '../components/EditItemModal';
import type { ItemWithProfile } from '../types/database';
import { formatTimeAgo } from '../utils/time';
import { formatDistance, calculateDistance } from '../hooks/useItems';
import { getAvatarUrl } from '../utils/image';

export function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { location } = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [item, setItem] = useState<ItemWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapContainer.current || !item || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [item.longitude, item.latitude],
      zoom: 15,
      attributionControl: false,
      interactive: false
    });

    map.current = mapInstance;

    const el = document.createElement('div');
    el.innerHTML = `
      <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `;

    new mapboxgl.Marker({ element: el })
      .setLngLat([item.longitude, item.latitude])
      .addTo(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, [item]);

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

  const handleConfirmStillThere = async () => {
    if (!user || !item) {
      navigate('/auth');
      return;
    }

    setConfirming(true);

    const { error } = await supabase.from('confirmations').insert({
      item_id: item.id,
      user_id: user.id
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

    setConfirming(false);
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

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-32">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-stone-600 dark:text-stone-400">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-1">
            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <Pencil size={20} />
              </button>
            )}
            <button onClick={handleShare} className="p-2 -mr-2 text-stone-600 dark:text-stone-400">
              <Share2 size={22} />
            </button>
          </div>
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

          <div className="h-48 rounded-2xl overflow-hidden shadow-sm bg-stone-200 dark:bg-stone-800">
            <div ref={mapContainer} className="w-full h-full" />
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

      {item.status === 'available' && !isOwner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            {!hasConfirmed && (
              <button
                onClick={handleConfirmStillThere}
                disabled={confirming}
                className="flex-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors"
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
              className="flex-1 bg-emerald-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 transition-colors"
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
    </div>
  );
}
