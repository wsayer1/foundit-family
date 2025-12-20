import { useState } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';

interface EditItemModalProps {
  item: ItemWithProfile;
  onClose: () => void;
  onSaved: (updatedItem: ItemWithProfile) => void;
  onDeleted: () => void;
}

export function EditItemModal({ item, onClose, onSaved, onDeleted }: EditItemModalProps) {
  const [description, setDescription] = useState(item.description);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!description.trim() || description === item.description) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('items')
      .update({ description: description.trim() })
      .eq('id', item.id);

    if (updateError) {
      setError('Failed to save changes');
      setSaving(false);
      return;
    }

    onSaved({ ...item, description: description.trim() });
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', item.id);

    if (deleteError) {
      setError('Failed to delete item');
      setDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }

    onDeleted();
  };

  const isLoading = saving || deleting;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col safe-area-bottom">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Edit Post</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 -mr-2 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl overflow-hidden mb-4 bg-stone-100 dark:bg-stone-800">
            <img
              src={item.image_url}
              alt={item.description}
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="w-full h-32 resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="Describe this item..."
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
          {showDeleteConfirm ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                Are you sure you want to delete this post? This cannot be undone. You will lose the 10 points you earned for posting.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 py-2.5 rounded-xl font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading || !description.trim()}
                className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={18} />
                Delete Post
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
