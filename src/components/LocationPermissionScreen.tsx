import { MapPin, Shield, Navigation, X } from 'lucide-react';

interface LocationPermissionScreenProps {
  onGranted: () => void;
  onCancel: () => void;
}

export function LocationPermissionScreen({ onGranted, onCancel }: LocationPermissionScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <button
        onClick={onCancel}
        className="absolute top-safe right-6 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors z-10"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150" />
          <div className="relative bg-white p-6 rounded-full shadow-2xl">
            <Navigation size={48} className="text-emerald-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-400 p-2 rounded-full shadow-lg">
            <MapPin size={20} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4 text-center">
          Enable Location
        </h1>

        <p className="text-white/90 text-center text-lg leading-relaxed max-w-sm mb-12">
          To share your find, we need to know where it is. This helps others discover it nearby.
        </p>

        <div className="w-full max-w-sm space-y-4 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <MapPin className="text-white" size={22} />
            </div>
            <div>
              <p className="text-white font-medium">Precise location</p>
              <p className="text-white/70 text-sm">Show exactly where the item is</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Shield className="text-white" size={22} />
            </div>
            <div>
              <p className="text-white font-medium">Privacy protected</p>
              <p className="text-white/70 text-sm">You can adjust the pin up to 100m</p>
            </div>
          </div>
        </div>

        <button
          onClick={onGranted}
          className="w-full max-w-sm bg-white text-emerald-600 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Enable Location
        </button>
      </div>
    </div>
  );
}
