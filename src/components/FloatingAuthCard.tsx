import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Eye, EyeOff, Loader2, Mail, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FloatingAuthCardProps {
  onSuccess: () => void;
  onClose?: () => void;
}

function AuthTabs({
  isSignUp,
  onTabChange
}: {
  isSignUp: boolean;
  onTabChange: (signUp: boolean) => void;
}) {
  return (
    <div
      className="relative flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-6"
      role="tablist"
      aria-label="Authentication options"
    >
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-stone-700 rounded-lg shadow-sm transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${isSignUp ? 'calc(100% + 4px)' : '0'})`
        }}
      />
      <button
        role="tab"
        aria-selected={!isSignUp}
        aria-controls="auth-panel"
        onClick={() => onTabChange(false)}
        className={`relative z-10 flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-colors duration-200 ${
          !isSignUp
            ? 'text-stone-900 dark:text-stone-100'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
        }`}
      >
        Sign In
      </button>
      <button
        role="tab"
        aria-selected={isSignUp}
        aria-controls="auth-panel"
        onClick={() => onTabChange(true)}
        className={`relative z-10 flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-colors duration-200 ${
          isSignUp
            ? 'text-stone-900 dark:text-stone-100'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}

export function FloatingAuthCard({ onSuccess, onClose }: FloatingAuthCardProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const prefersReducedMotion = useRef(false);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const animate = useCallback(() => {
    if (isInteracting || prefersReducedMotion.current || isTouchDevice.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    setPosition(prev => {
      const dx = targetPosition.current.x - prev.x;
      const dy = targetPosition.current.y - prev.y;

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        return prev;
      }

      return {
        x: prev.x + dx * 0.08,
        y: prev.y + dy * 0.08
      };
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [isInteracting]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion.current || isTouchDevice.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cardWidth = cardRef.current?.offsetWidth || 420;
      const cardHeight = cardRef.current?.offsetHeight || 500;

      const maxX = (viewportWidth - cardWidth) / 2 - 40;
      const maxY = (viewportHeight - cardHeight) / 2 - 40;

      const normalizedX = (e.clientX / viewportWidth - 0.5) * 2;
      const normalizedY = (e.clientY / viewportHeight - 0.5) * 2;

      targetPosition.current = {
        x: normalizedX * maxX * 0.3,
        y: normalizedY * maxY * 0.3
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

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

  const handleTabChange = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError('');
  };

  const handleInteractionStart = () => setIsInteracting(true);
  const handleInteractionEnd = () => setIsInteracting(false);

  return (
    <div
      ref={cardRef}
      className="w-[420px] max-w-[calc(100vw-32px)]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${isInteracting ? 1.02 : 1})`,
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onFocus={handleInteractionStart}
      onBlur={handleInteractionEnd}
    >
      <div className="relative bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 p-8 border border-white/20 dark:border-stone-700/50">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-200"
            aria-label="Close"
          >
            <X size={18} className="text-stone-600 dark:text-stone-400" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="bg-emerald-500 p-4 rounded-2xl inline-block mb-4 shadow-lg shadow-emerald-500/30">
            <MapPin size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Street Finds
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            {isSignUp ? 'Create your account to start discovering' : 'Welcome back to the community'}
          </p>
        </div>

        <div id="auth-panel" role="tabpanel">
          <AuthTabs isSignUp={isSignUp} onTabChange={handleTabChange} />

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 py-4 rounded-xl font-semibold hover:bg-stone-50 dark:hover:bg-stone-750 hover:border-stone-300 dark:hover:border-stone-600 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {googleLoading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/95 dark:bg-stone-900/95 text-stone-500 dark:text-stone-400">
                or
              </span>
            </div>
          </div>

          {!showEmailForm && (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full flex items-center justify-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              <Mail size={18} />
              <span>Continue with Email</span>
              <ChevronDown size={16} />
            </button>
          )}

          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              showEmailForm ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                    placeholder="Choose a username"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
