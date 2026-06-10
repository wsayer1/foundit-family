import { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';

interface ConfirmationPhotoCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export function ConfirmationPhotoCapture({ onCapture, onCancel }: ConfirmationPhotoCaptureProps) {
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
      } catch {
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
