import { Loader2, Check } from 'lucide-react';

export type PostingStatus = 'uploading' | 'success' | 'error';

interface PendingPostCardProps {
  imageData: string;
  description: string;
  status: PostingStatus;
  error?: string;
}

export function PendingPostCard({ imageData, description, status, error }: PendingPostCardProps) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm border border-stone-200/50 dark:border-stone-700/50 mb-4">
      <div className="flex items-center gap-3 p-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800">
          <img
            src={imageData}
            alt="Posting"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-stone-800 dark:text-stone-200 font-medium text-sm line-clamp-2 leading-snug">
            {description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {status === 'uploading' && (
              <>
                <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse w-2/3" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Posting</span>
                </div>
              </>
            )}
            {status === 'success' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Check size={12} />
                </div>
                <span>Posted successfully</span>
              </div>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-500">{error || 'Failed to post'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
