import { useNavigate } from 'react-router-dom';
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <FloatingAuthCard onSuccess={handleSuccess} onClose={handleClose} />
      </div>
    </div>
  );
}
