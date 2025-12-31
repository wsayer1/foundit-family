import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, ImagePlus, Loader2 } from 'lucide-react';
import { compressDataURL } from '../utils/image';
import { StepIndicator } from './LocationPermissionScreen';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      stopStream();

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setCameraError(null);
    } catch {
      setCameraError('Unable to access camera. Please use the gallery option.');
    }
  }, [stopStream]);

  useEffect(() => {
    startCamera();
    return stopStream;
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);

    stopStream();
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;

    setCompressing(true);
    try {
      const compressed = await compressDataURL(capturedImage);
      onCapture(compressed);
    } catch {
      onCapture(capturedImage);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopStream();

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center px-4 bg-gradient-to-b from-black/70 to-transparent"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: '16px' }}
      >
        <StepIndicator currentStep={1} />
      </div>

      <div className="flex-1 relative">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        ) : cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-white px-8 text-center">
            <Camera size={48} className="mb-4 opacity-50" />
            <p className="mb-6">{cameraError}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-black px-6 py-3 rounded-xl font-medium"
            >
              Choose from gallery
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 pb-10 bg-gradient-to-t from-black/80 to-transparent">
        {capturedImage ? (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={retake}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <RotateCcw size={28} />
            </button>
            <button
              onClick={confirmPhoto}
              disabled={compressing}
              className="p-5 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {compressing ? <Loader2 size={32} className="animate-spin" /> : <Check size={32} />}
            </button>
            <button
              onClick={onCancel}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <X size={28} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <ImagePlus size={24} />
            </button>
            <button
              onClick={takePhoto}
              className="p-2 bg-white rounded-full hover:scale-105 transition-transform"
              disabled={!!cameraError}
            >
              <div className="w-16 h-16 border-4 border-stone-300 rounded-full" />
            </button>
            <button
              onClick={onCancel}
              className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
