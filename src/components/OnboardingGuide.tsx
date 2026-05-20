import { useState } from 'react';
import { X, Camera, MapPin, ThumbsUp, Trophy } from 'lucide-react';

const ONBOARDING_SEEN_KEY = 'foundit_onboarding_seen';

export function useOnboardingVisible(userId: string | undefined): [boolean, () => void] {
  const [visible, setVisible] = useState(() => {
    if (!userId) return false;
    try {
      return !localStorage.getItem(ONBOARDING_SEEN_KEY);
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    } catch {}
  };

  return [visible, dismiss];
}

interface OnboardingGuideProps {
  onDismiss: () => void;
}

const steps = [
  {
    icon: Camera,
    title: 'Post a find',
    description: 'Spot free stuff on the curb? Snap a photo and share it with neighbors.',
  },
  {
    icon: MapPin,
    title: 'Discover nearby',
    description: 'Browse items near you. Filter by distance, time, or category.',
  },
  {
    icon: ThumbsUp,
    title: 'Verify & claim',
    description: 'Walk to an item, confirm it\'s still there, or claim it for yourself.',
  },
  {
    icon: Trophy,
    title: 'Earn points',
    description: 'Get points for posting, verifying, and claiming. Climb the leaderboard!',
  },
];

export function OnboardingGuide({ onDismiss }: OnboardingGuideProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-6 pb-8 text-white">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close guide"
          >
            <X size={16} />
          </button>
          <h2 className="text-xl font-bold">Here's how it works</h2>
          <p className="text-emerald-100 text-sm mt-1">Get started in seconds</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-xl flex-shrink-0">
                <step.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{step.title}</h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onDismiss}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Got it, let's go!
          </button>
        </div>
      </div>
    </div>
  );
}
