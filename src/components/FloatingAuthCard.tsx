import { useState, useRef, useEffect } from 'react';
import { MapPin, Eye, EyeOff, Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FloatingAuthCardProps {
  onSuccess: () => void;
  onClose?: () => void;
  hideHeader?: boolean;
}

export function FloatingAuthCard({ onSuccess, onClose, hideHeader = false }: FloatingAuthCardProps) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const emailFormRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const forgotPasswordInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (showForgotPassword) {
      setTimeout(() => {
        forgotPasswordInputRef.current?.focus();
      }, 300);
    }
  }, [showForgotPassword]);

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

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setError('');
    setResetEmailSent(false);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setError('');
    setResetEmailSent(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setResetLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }
      console.log('Password reset email sent successfully to:', email);
      setResetEmailSent(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      console.error('Password reset failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 md:inset-0 z-40 md:flex md:items-center md:justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-full md:w-[420px] flex flex-col bg-stone-950 rounded-t-3xl md:rounded-2xl shadow-2xl transition-all duration-300 ease-out"
        style={{
          maxHeight: showEmailForm ? '90vh' : 'auto',
          fontFamily: "'Archivo', system-ui, sans-serif"
        }}
      >
        <div className={hideHeader ? 'hidden md:block' : ''}>
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <MapPin size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-lg text-white tracking-tight" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>foundit.family</span>
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
            <h2 className="text-2xl font-semibold text-white leading-tight" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
              Find and post free stuff near you
            </h2>
          </div>
        </div>

        <div className={`px-5 pb-5 ${hideHeader ? 'pt-5 md:pt-0' : ''}`}>
          {showForgotPassword ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm font-medium transition-colors mb-4"
              >
                <ArrowLeft size={16} />
                Back to login
              </button>

              {resetEmailSent ? (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-4">
                    <div className="bg-emerald-500/20 p-3 rounded-full">
                      <CheckCircle size={32} className="text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
                    Check your email
                  </h3>
                  <p className="text-stone-400 text-sm mb-4">
                    We sent a password reset link to <span className="text-white font-medium">{email}</span>
                  </p>
                  <p className="text-stone-500 text-xs">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setResetEmailSent(false)}
                      className="text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      try again
                    </button>
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}>
                    Reset your password
                  </h3>
                  <p className="text-stone-400 text-sm mb-4">
                    Enter your email and we'll send you a link to reset your password.
                  </p>

                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1.5">
                        Email
                      </label>
                      <input
                        ref={forgotPasswordInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 text-white text-sm placeholder:text-stone-500"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    {error && (
                      <div className="bg-red-900/20 text-red-400 px-3 py-2.5 rounded-xl text-xs border border-red-800/30">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-400 focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {resetLoading && <Loader2 size={18} className="animate-spin" />}
                      Send reset link
                    </button>
                  </form>
                </>
              )}
            </div>
          ) : (
            <>
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
                  className="gsi-material-button"
                  type="button"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    {googleLoading ? (
                      <Loader2 size={20} className="animate-spin text-stone-600" />
                    ) : (
                      <>
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
                      </>
                    )}
                  </div>
                </button>

                {!showEmailForm && (
                  <button
                    onClick={handleShowEmailForm}
                    className="gsi-material-button gsi-material-button--outline"
                    type="button"
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <Mail size={20} />
                      </div>
                      <span className="gsi-material-button-contents">{isSignUp ? 'Sign up with email' : 'Sign in with email'}</span>
                    </div>
                  </button>
                )}
              </div>

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
                        <button type="button" onClick={handleForgotPassword} className="text-emerald-500 hover:text-emerald-400 text-xs font-medium transition-colors">
                          Forgot your password?
                        </button>
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
