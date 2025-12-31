import { useState, useRef } from 'react';
import { MapPin, Eye, EyeOff, Loader2, Mail, ArrowLeft, ChevronRight } from 'lucide-react';
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
      className="relative flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl"
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
        className={`relative z-10 flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
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
        className={`relative z-10 flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
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
  const emailInputRef = useRef<HTMLInputElement>(null);

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

  const handleShowEmailForm = () => {
    setShowEmailForm(true);
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 350);
  };

  const handleBackToOptions = () => {
    setShowEmailForm(false);
    setError('');
  };

  return (
    <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-auto md:w-[420px] z-40">
      <div className="h-full flex flex-col bg-white dark:bg-stone-900 md:border-r border-stone-200 dark:border-stone-800">
        <div className="bg-stone-800 dark:bg-stone-950 px-4 py-3 flex items-center gap-3 safe-area-top">
          <div className="p-2 rounded-xl bg-stone-700 dark:bg-stone-800 border-2 border-emerald-500">
            <MapPin size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white text-lg">foundit.family</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto p-2 rounded-full hover:bg-stone-700 transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out"
            style={{ transform: showEmailForm ? 'translateX(-100%)' : 'translateX(0)' }}
          >
            <div className="w-full flex-shrink-0 p-5 overflow-y-auto">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm">
                  {isSignUp ? 'Join the community' : 'Sign in to continue'}
                </p>
              </div>

              <AuthTabs isSignUp={isSignUp} onTabChange={handleTabChange} />

              <div className="mt-5 space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-between bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 py-3.5 px-4 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-750 hover:border-stone-300 dark:hover:border-stone-600 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    {googleLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>

                <button
                  onClick={handleShowEmailForm}
                  className="w-full flex items-center justify-between bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 py-3.5 px-4 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-750 hover:border-stone-300 dark:hover:border-stone-600 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={20} />
                    <span>Continue with Email</span>
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
              </div>

              <p className="mt-6 text-xs text-center text-stone-400 dark:text-stone-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            <div className="w-full flex-shrink-0 p-5 overflow-y-auto">
              <button
                onClick={handleBackToOptions}
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 mb-4 -ml-1 py-1 transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="mb-5">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                  {isSignUp ? 'Sign up with email' : 'Sign in with email'}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm">
                  {isSignUp ? 'Create your account' : 'Enter your credentials'}
                </p>
              </div>

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
                    ref={emailInputRef}
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
    </div>
  );
}
