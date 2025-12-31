import { useState, useRef, useEffect } from 'react';
import { MapPin, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FloatingAuthCardProps {
  onSuccess: () => void;
  onClose?: () => void;
}

export function FloatingAuthCard({ onSuccess, onClose }: FloatingAuthCardProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailFormHeight, setEmailFormHeight] = useState(0);
  const emailFormRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showEmailForm && emailFormRef.current) {
      const height = emailFormRef.current.scrollHeight;
      setEmailFormHeight(height);
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 300);
    } else {
      setEmailFormHeight(0);
    }
  }, [showEmailForm, isSignUp]);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleShowEmailForm = () => {
    if (!showEmailForm) {
      setShowEmailForm(true);
      setError('');
    }
  };

  const handleTabChange = (signup: boolean) => {
    setIsSignUp(signup);
    setError('');
    if (showEmailForm) {
      setTimeout(() => {
        if (emailFormRef.current) {
          setEmailFormHeight(emailFormRef.current.scrollHeight);
        }
      }, 50);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 md:inset-0 z-40 md:flex md:items-center md:justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-full md:w-[420px] flex flex-col bg-stone-950 rounded-t-3xl md:rounded-2xl shadow-2xl transition-all duration-300 ease-out font-heading"
        style={{
          maxHeight: showEmailForm ? '90vh' : 'auto',
          fontFamily: "'DM Sans', system-ui, sans-serif"
        }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <MapPin size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg text-white tracking-tight">foundit.family</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-full hover:bg-stone-800 transition-colors text-stone-400 hover:text-white"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        <div className="px-5 pb-3">
          <h2 className="text-2xl font-bold text-white leading-tight">
            Find and post free stuff near you
          </h2>
        </div>

        <div className="px-5 pb-5">
          <div className="bg-stone-900 rounded-2xl p-1.5 mb-4">
            <div className="relative flex">
              <div
                className="absolute top-0 bottom-0 w-1/2 rounded-xl transition-all duration-300 ease-out"
                style={{
                  transform: isSignUp ? 'translateX(100%)' : 'translateX(0)',
                  backgroundColor: isSignUp ? '#ffffff' : '#10b981'
                }}
              />
              <button
                onClick={() => handleTabChange(false)}
                className={`relative flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors duration-300 z-10 ${
                  !isSignUp ? 'text-white' : 'text-stone-400'
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => handleTabChange(true)}
                className={`relative flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors duration-300 z-10 ${
                  isSignUp ? 'text-stone-900' : 'text-stone-400'
                }`}
              >
                Sign up
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm ${
                isSignUp
                  ? 'bg-white text-stone-900 hover:bg-stone-100'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400'
              }`}
            >
              {googleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill={isSignUp ? "#4285F4" : "#fff"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill={isSignUp ? "#34A853" : "#fff"} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill={isSignUp ? "#FBBC05" : "#fff"} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill={isSignUp ? "#EA4335" : "#fff"} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {!showEmailForm && (
              <button
                onClick={handleShowEmailForm}
                className="w-full flex items-center justify-center gap-2.5 bg-transparent border border-stone-700 text-stone-300 py-3 px-4 rounded-xl font-medium hover:bg-stone-800 hover:border-stone-600 hover:text-white focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200"
              >
                <Mail size={18} />
                <span>Continue with email</span>
              </button>
            )}
          </div>

          {/* Email form with smooth vertical reveal animation */}
          <div
            className="overflow-hidden transition-all duration-300 ease-out"
            style={{
              height: emailFormHeight,
              opacity: showEmailForm ? 1 : 0
            }}
          >
            <div ref={emailFormRef} className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                {isSignUp && (
                  <div className="transition-all duration-200">
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 text-white text-sm placeholder:text-stone-500"
                      placeholder="Choose a username"
                      required={isSignUp}
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">
                    Email
                  </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 text-white text-sm placeholder:text-stone-500"
                    placeholder="you@example.com"
                    required
                    style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 bg-stone-800 border border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 text-white text-sm placeholder:text-stone-500"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
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
                  {isSignUp ? 'Create account' : 'Log in'}
                </button>

                {!isSignUp && (
                  <p className="text-center">
                    <button type="button" className="text-emerald-500 hover:text-emerald-400 text-xs font-medium transition-colors">
                      I forgot my password
                    </button>
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
