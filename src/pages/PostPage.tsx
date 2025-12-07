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

type PostStep = 'location' | 'camera' | 'map' | 'description' | 'posting';

export function PostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, permissionStatus, requestLocation, checkPermission } = useLocation();

  const [step, setStep] = useState<PostStep>('location');
  const [imageData, setImageData] = useState<string | null>(null);
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState('');
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
        requestLocation().then((coords) => {
          if (coords) {
            setPinLocation({ lat: coords.latitude, lng: coords.longitude });
            setStep('camera');
          }
        });
      }
    });
  }, [user, checkPermission, requestLocation, navigate]);

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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/describe-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDescription(data.description || 'Curbside find');
      } else {
        setDescription('Curbside find - tap to edit description');
      }
    } catch {
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
      });

      if (insertError) throw insertError;

      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post item');
      setPosting(false);
    }
  };

  if (step === 'location' && permissionStatus !== 'granted') {
    return <LocationPermissionScreen onGranted={handleLocationGranted} onCancel={() => navigate(-1)} />;
  }

  if (step === 'camera') {
    return <CameraCapture onCapture={handlePhotoCapture} onCancel={() => navigate(-1)} />;
  }

  if (step === 'map' && imageData && pinLocation && location) {
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
