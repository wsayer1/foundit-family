import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, ImagePlus, Loader2 } from 'lucide-react';
import { compressDataURL } from '../utils/image';
import { StepIndicator } from './LocationPermissionScreen';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

interface ZoomCapabilities {
  min: number;
  max: number;
  current: number;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [zoomCapabilities, setZoomCapabilities] = useState<ZoomCapabilities | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    videoTrackRef.current = null;
    setZoomCapabilities(null);
    setCurrentZoom(1);
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

      const videoTrack = newStream.getVideoTracks()[0];
      videoTrackRef.current = videoTrack;

      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } };
        if (capabilities.zoom) {
          const settings = videoTrack.getSettings() as MediaTrackSettings & { zoom?: number };
          setZoomCapabilities({
            min: capabilities.zoom.min,
            max: capabilities.zoom.max,
            current: settings.zoom || capabilities.zoom.min
          });
          setCurrentZoom(settings.zoom || capabilities.zoom.min);
        }
      }

      setCameraError(null);
    } catch {
      setCameraError('Unable to access camera. Please use the gallery option.');
    }
  }, [stopStream]);

  const applyZoom = useCallback(async (zoom: number) => {
    if (!videoTrackRef.current || !zoomCapabilities) return;

    const clampedZoom = Math.min(Math.max(zoom, zoomCapabilities.min), zoomCapabilities.max);
    try {
      await videoTrackRef.current.applyConstraints({
        advanced: [{ zoom: clampedZoom } as MediaTrackConstraintSet]
      });
      setCurrentZoom(clampedZoom);
    } catch {
    }
  }, [zoomCapabilities]);

  const getDistance = (touches: TouchList) => {
    const [t1, t2] = [touches[0], touches[1]];
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && zoomCapabilities) {
      e.preventDefault();
      initialPinchDistanceRef.current = getDistance(e.touches);
      initialZoomRef.current = currentZoom;
    }
  }, [zoomCapabilities, currentZoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistanceRef.current && zoomCapabilities) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialPinchDistanceRef.current;
      const zoomRange = zoomCapabilities.max - zoomCapabilities.min;
      const newZoom = initialZoomRef.current + (scale - 1) * (zoomRange * 0.5);
      applyZoom(newZoom);
    }
  }, [zoomCapabilities, applyZoom]);

  const handleTouchEnd = useCallback(() => {
    initialPinchDistanceRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return stopStream;
  }, []);

  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventZoom, { passive: false });

    if (window.visualViewport && window.visualViewport.scale !== 1) {
      window.scrollTo(0, 0);
    }

    return () => {
      document.removeEventListener('touchmove', preventZoom);
    };
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
    <div className="fixed inset-0 bg-black flex flex-col" style={{ touchAction: 'none' }}>
      <canvas ref={canvasRef} className="hidden" />

      <div
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-center px-4 bg-gradient-to-b from-black/70 to-transparent"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: '16px', touchAction: 'manipulation' }}
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
          <div
            className="w-full h-full relative"
            style={{ touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ touchAction: 'none' }}
            />
            {zoomCapabilities && currentZoom > zoomCapabilities.min && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-white text-sm font-medium">
                  {currentZoom.toFixed(1)}x
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent"
        style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom))', touchAction: 'manipulation' }}
      >
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
