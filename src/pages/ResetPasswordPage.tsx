import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthBackgroundGrid } from '../components/AuthBackgroundGrid';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success && user) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <AuthBackgroundGrid />

      <div className="absolute top-0 left-0 right-0 z-50 safe-area-top">
        <div className="flex items-center gap-1.5 px-3 pt-4">
          <div className="flex-shrink-0 bg-white dark:bg-stone-900 p-2.5 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/20 flex items-center gap-2 border border-stone-200 dark:border-stone-700">
            <MapPin size={20} className="text-emerald-500" strokeWidth={2.5} />
            <span className="font-semibold text-stone-900 dark:text-white text-sm" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>Foundit.Family</span>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 md:inset-0 z-40 md:flex md:items-center md:justify-center pointer-events-none">
        <div
          className="pointer-events-auto w-full md:w-[420px] flex flex-col bg-stone-950 rounded-t-3xl md:rounded-2xl shadow-2xl"
          style={{ fontFamily: "'Archivo', system-ui, sans-serif" }}
        >
          <div className="px-5 pt-5 pb-5">
            {success ? (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-500/20 p-3 rounded-full">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
                  Password updated
                </h2>
                <p className="text-stone-400 text-sm">
                  Taking you to the app...
                </p>
              </div>
            ) : !user ? (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-amber-500/20 p-3 rounded-full">
                    <AlertCircle size={32} className="text-amber-500" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
                  Link expired or invalid
                </h2>
                <p className="text-stone-400 text-sm mb-4">
                  This password reset link may have expired or already been used.
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
                >
                  Back to login
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
                  Set new password
                </h2>
                <p className="text-stone-400 text-sm mb-5">
                  Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 bg-stone-800 border border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 text-white text-sm placeholder:text-stone-500"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 bg-stone-800 border border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 text-white text-sm placeholder:text-stone-500"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 text-red-400 px-3 py-2.5 rounded-xl text-xs border border-red-800/30">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-400 focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    Update password
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
