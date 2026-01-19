import { useNavigate } from 'react-router-dom';
import { AuthBackgroundGrid } from '../components/AuthBackgroundGrid';
import { FloatingAuthCard } from '../components/FloatingAuthCard';

export function AuthPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/discover');
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <AuthBackgroundGrid />

      <div className="absolute top-0 left-0 right-0 z-50 safe-area-top md:hidden">
        <div className="flex items-center justify-between gap-1.5 px-3 pt-4">
          <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-2 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/20 border border-stone-200 dark:border-stone-700">
            <img
              src="/foundit.family_logo_small_light_grey_bg.png"
              alt="Foundit.Family"
              className="h-8 w-auto rounded-lg"
            />
            <span className="font-semibold text-stone-900 dark:text-white text-sm" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>foundit.family</span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-white hover:text-stone-300 transition-colors"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-3 pt-2">
          <h1 className="text-3xl font-bold text-emerald-400 leading-tight" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
            Find and Post
          </h1>
          <h2 className="text-2xl font-semibold text-white leading-tight mt-0.5" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
            Free Stuff Near You
          </h2>
        </div>
      </div>

      <FloatingAuthCard onSuccess={handleSuccess} onClose={handleClose} hideHeader />
    </div>
  );
}
