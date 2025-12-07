import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { LocationPermissionScreen } from '../components/LocationPermissionScreen';
import { CameraCapture } from '../components/CameraCapture';
import { LocationPicker } from '../components/LocationPicker';
import { DescriptionEditor } from '../components/DescriptionEditor';
import { supabase } from '../lib/supabase';
import { dataURLtoBlob } from '../utils/image';
import { describeImageWithFallback } from '../utils/chromeAI';

type PostStep = 'checking' | 'location' | 'camera' | 'map' | 'description' | 'posting';

export function PostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, permissionStatus, requestLocation, checkPermission } = useLocation();

  const [step, setStep] = useState<PostStep>('checking');
  const [imageData, setImageData] = useState<string | null>(null);
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkPermission().then((status) => {
      if (status === 'granted') {
        setStep('camera');
        requestLocation().then((coords) => {
          if (coords) {
            setPinLocation({ lat: coords.latitude, lng: coords.longitude });
          }
        });
      } else {
        setStep('location');
      }
    });
  }, [user, checkPermission, requestLocation, navigate]);

  useEffect(() => {
    if (step === 'map' && !pinLocation && permissionStatus === 'granted') {
      requestLocation().then((coords) => {
        if (coords) {
          setPinLocation({ lat: coords.latitude, lng: coords.longitude });
        }
      });
    }
  }, [step, pinLocation, permissionStatus, requestLocation]);

  const handleLocationGranted = async () => {
    const coords = await requestLocation();
    if (coords) {
      setPinLocation({ lat: coords.latitude, lng: coords.longitude });
      setStep('camera');
    }
  };

  const handlePhotoCapture = async (dataUrl: string) => {
    setImageData(dataUrl);
    setStep('map');
  };

  const handleMapConfirm = async () => {
    if (!imageData || !pinLocation) return;

    setStep('description');
    setAiGenerating(true);

    try {
      const result = await describeImageWithFallback(
        imageData,
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      setTag(result.tag);
      setDescription(result.description);
    } catch {
      setTag('item');
      setDescription('Curbside find - tap to edit description');
    } finally {
      setAiGenerating(false);
    }
  };

  const handlePost = async () => {
    if (!user || !imageData || !pinLocation || !description.trim()) return;

    setPosting(true);
    setError(null);

    try {
      const blob = dataURLtoBlob(imageData);
      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('items').insert({
        user_id: user.id,
        image_url: publicUrl,
        description: description.trim(),
        latitude: pinLocation.lat,
        longitude: pinLocation.lng,
        category: tag || null,
      });

      if (insertError) throw insertError;

      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post item');
      setPosting(false);
    }
  };

  if (step === 'checking') {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (step === 'location') {
    return <LocationPermissionScreen onGranted={handleLocationGranted} onCancel={() => navigate(-1)} />;
  }

  if (step === 'camera') {
    return <CameraCapture onCapture={handlePhotoCapture} onCancel={() => navigate(-1)} />;
  }

  if (step === 'map' && imageData) {
    if (!pinLocation || !location) {
      return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-8">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-stone-600 dark:text-stone-400">Getting your location...</p>
        </div>
      );
    }
    return (
      <LocationPicker
        imageData={imageData}
        initialLocation={pinLocation}
        userLocation={{ lat: location.latitude, lng: location.longitude }}
        onConfirm={(loc) => {
          setPinLocation(loc);
          handleMapConfirm();
        }}
        onBack={() => setStep('camera')}
      />
    );
  }

  if (step === 'description' || step === 'posting') {
    return (
      <DescriptionEditor
        imageData={imageData!}
        description={description}
        tag={tag}
        loading={aiGenerating}
        posting={posting}
        error={error}
        onDescriptionChange={setDescription}
        onPost={handlePost}
        onBack={() => setStep('map')}
      />
    );
  }

  return null;
}
