import { MapPin, Navigation, Camera, Check } from 'lucide-react';

interface LocationPermissionScreenProps {
  onGranted: () => void;
  onCancel: () => void;
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: 'Take a photo' },
    { number: 2, label: 'Set location' },
    { number: 3, label: 'Add description' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 w-full">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step.number < currentStep
                  ? 'bg-emerald-500 text-white'
                  : step.number === currentStep
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-transparent'
                  : 'bg-white/20 text-white/70'
              }`}
            >
              {step.number < currentStep ? <Check size={16} /> : step.number}
            </div>
            <span className={`text-xs mt-1.5 whitespace-nowrap ${
              step.number === currentStep ? 'text-white font-medium' : 'text-white/60'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 mb-5 ${
              step.number < currentStep ? 'bg-emerald-500' : 'bg-white/20'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export { StepIndicator };

export function LocationPermissionScreen({ onGranted, onCancel }: LocationPermissionScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div
        className="relative z-50 flex items-center justify-center px-4"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
        <StepIndicator currentStep={1} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150" />
          <div className="relative bg-white p-5 rounded-full shadow-2xl">
            <Navigation size={40} className="text-emerald-500" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 p-1.5 rounded-full shadow-lg">
            <MapPin size={16} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3 text-center">
          Permissions Needed
        </h1>

        <p className="text-white/90 text-center text-base leading-relaxed max-w-sm mb-6">
          To share your find, we need access to your location and camera
        </p>

        <div className="w-full max-w-sm space-y-2.5 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <MapPin className="text-white" size={20} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Location access</p>
              <p className="text-white/70 text-xs">Show where items are found</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Camera className="text-white" size={20} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Camera access</p>
              <p className="text-white/70 text-xs">Take photos of your finds</p>
            </div>
          </div>
        </div>

        <p className="text-white/70 text-xs text-center max-w-sm mb-4">
          You'll see browser prompts to grant these permissions
        </p>
      </div>

      <div
        className="relative z-50 px-6"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={onGranted}
          className="w-full max-w-sm mx-auto block bg-white text-emerald-600 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
