import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
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

      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-stone-700 transition-colors"
        aria-label="Close"
      >
        <X size={24} className="text-stone-700 dark:text-stone-300" />
      </button>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <FloatingAuthCard onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
