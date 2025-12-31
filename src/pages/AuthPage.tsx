import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { AuthBackgroundGrid } from '../components/AuthBackgroundGrid';
import { FloatingAuthCard } from '../components/FloatingAuthCard';

export function AuthPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <AuthBackgroundGrid />

      <div className="absolute top-0 left-0 right-0 z-50 safe-area-top">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-4">
          <div className="flex-shrink-0 bg-stone-800 dark:bg-stone-900 p-2.5 sm:p-3 rounded-xl shadow-lg shadow-black/20 flex items-center gap-2 border border-stone-700">
            <MapPin size={20} className="text-emerald-500 sm:w-6 sm:h-6" strokeWidth={2.5} />
            <span className="font-semibold text-white text-sm" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>Foundit.Family</span>
          </div>
        </div>

        <div className="flex items-start justify-between px-3 sm:px-4 pt-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-emerald-400 leading-tight" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
              Find and Post
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight mt-1" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
              Free Stuff Near You
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 bg-stone-800 dark:bg-stone-900 p-2.5 sm:p-3 rounded-xl shadow-lg shadow-black/20 flex items-center justify-center border border-stone-700 text-stone-300 hover:text-white transition-colors ml-4"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <FloatingAuthCard onSuccess={handleSuccess} hideHeader />
    </div>
  );
}
