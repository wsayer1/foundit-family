import { useState } from 'react';
import { X, MessageSquare, Bug, Send, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type FeedbackType = 'feedback' | 'bug';

interface FeedbackModalProps {
  type: FeedbackType;
  onClose: () => void;
}

export function FeedbackModal({ type, onClose }: FeedbackModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFeedback = type === 'feedback';
  const title = isFeedback ? 'Leave Feedback' : 'Report a Bug';
  const placeholder = isFeedback
    ? 'Tell us what you think about the app, suggest new features, or share your experience...'
    : 'Describe the bug you encountered. Include what you were doing when it happened and any error messages you saw...';
  const Icon = isFeedback ? MessageSquare : Bug;

  const handleSubmit = async () => {
    if (!user || !message.trim()) return;

    setSubmitting(true);
    setError(null);

    const { error: submitError } = await supabase.from('feedback').insert({
      user_id: user.id,
      type,
      message: message.trim(),
    });

    setSubmitting(false);

    if (submitError) {
      setError('Failed to submit. Please try again.');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-stone-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className={`px-6 pt-6 pb-4 ${isFeedback ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-white/80 text-sm">
                {isFeedback ? 'We value your input' : 'Help us improve'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                Thank you!
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                {isFeedback
                  ? 'Your feedback has been submitted.'
                  : 'Your bug report has been submitted.'}
              </p>
            </div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                disabled={submitting}
                className="w-full h-40 resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                autoFocus
              />

              {error && (
                <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !message.trim()}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all ${
                    isFeedback
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
