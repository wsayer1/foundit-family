import { ArrowLeft, Loader2, Sparkles, Send, Tag } from 'lucide-react';

interface DescriptionEditorProps {
  imageData: string;
  description: string;
  tag: string;
  loading: boolean;
  posting: boolean;
  error: string | null;
  onDescriptionChange: (value: string) => void;
  onPost: () => void;
  onBack: () => void;
}

function formatTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
}

export function DescriptionEditor({
  imageData,
  description,
  tag,
  loading,
  posting,
  error,
  onDescriptionChange,
  onPost,
  onBack
}: DescriptionEditorProps) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50 px-4 h-14 flex items-center gap-4">
        <button
          onClick={onBack}
          disabled={posting}
          className="p-2 -ml-2 text-stone-600 dark:text-stone-400 disabled:opacity-50"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-stone-900 dark:text-stone-100">Add description</h1>
      </div>

      <div className="flex-1 p-4 pb-32">
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
            <img
              src={imageData}
              alt="Item"
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 size={18} className="text-emerald-500 animate-spin" />
                    <span className="text-sm text-stone-500 dark:text-stone-400">AI is describing your find...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-amber-500" />
                    <span className="text-sm text-stone-500 dark:text-stone-400">AI-generated description</span>
                  </>
                )}
              </div>
              {!loading && tag && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                  <Tag size={14} />
                  <span>{formatTag(tag)}</span>
                </div>
              )}
            </div>

            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={loading || posting}
              placeholder="Describe this item..."
              className="w-full h-32 resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
            />

            <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
              Edit the description if needed, or post it as is.
            </p>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onPost}
            disabled={loading || posting || !description.trim()}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {posting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send size={20} />
                Post your find
              </>
            )}
          </button>
          <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-3">
            You'll earn 10 points for sharing this find!
          </p>
        </div>
      </div>
    </div>
  );
}
