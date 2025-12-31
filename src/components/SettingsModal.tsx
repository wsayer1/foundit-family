import { useState, useRef, useEffect } from 'react';
import { X, User, Camera, Loader2, Sun, Moon, Monitor, Trash2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { compressAvatar, getAvatarUrl } from '../utils/image';
import type { AppearancePreference } from '../types/database';

interface SettingsModalProps {
  onClose: () => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MIN_USERNAME_LENGTH = 2;
const MAX_USERNAME_LENGTH = 30;

const themeOptions: { value: AppearancePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { preference, setPreference } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.username || '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.username) {
      setDisplayName(profile.username);
    }
  }, [profile?.username]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const validateName = (name: string): string | null => {
    const trimmed = name.trim();
    if (trimmed.length < MIN_USERNAME_LENGTH) {
      return `Name must be at least ${MIN_USERNAME_LENGTH} characters`;
    }
    if (trimmed.length > MAX_USERNAME_LENGTH) {
      return `Name must be less than ${MAX_USERNAME_LENGTH} characters`;
    }
    if (!/^[a-zA-Z0-9_\s-]+$/.test(trimmed)) {
      return 'Name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    return null;
  };

  const handleNameSave = async () => {
    if (!user) return;

    const trimmedName = displayName.trim();
    const error = validateName(trimmedName);
    if (error) {
      setNameError(error);
      return;
    }

    if (trimmedName === profile?.username) {
      return;
    }

    setNameError(null);
    setNameSaving(true);
    setNameSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: trimmedName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2000);
    } catch {
      setNameError('Failed to update name');
    } finally {
      setNameSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_FILE_SIZE) {
      setAvatarError('Image must be less than 2 MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    setAvatarError(null);
    setUploadingAvatar(true);

    try {
      const compressedBlob = await compressAvatar(file);
      const fileName = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
    } catch {
      setAvatarError('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    setRemovingAvatar(true);
    setAvatarError(null);

    try {
      const fileName = `${user.id}/avatar.jpg`;
      await supabase.storage.from('avatars').remove([fileName]);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
    } catch {
      setAvatarError('Failed to remove avatar');
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!user || !profile) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-white dark:bg-stone-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <h2 id="settings-title" className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Close settings"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <section className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload profile picture"
              />
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar || removingAvatar}
                className="relative w-16 h-16 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 group flex-shrink-0 ring-3 ring-white dark:ring-stone-900 shadow-lg"
                aria-label="Change profile picture"
              >
                {profile.avatar_url ? (
                  <img
                    src={getAvatarUrl(profile.avatar_url, 160)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={28} className="text-stone-400 dark:text-stone-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {profile.username || 'Your Name'}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar || removingAvatar}
                className="flex-1 py-2.5 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {uploadingAvatar ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
                {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </button>
              {profile.avatar_url && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar || removingAvatar}
                  className="py-2.5 px-4 bg-white dark:bg-stone-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {removingAvatar ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </div>
            {avatarError && (
              <p className="text-sm text-red-500 mt-3" role="alert">
                {avatarError}
              </p>
            )}
          </section>

          <section>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Display Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setNameError(null);
                  setNameSuccess(false);
                }}
                placeholder="Enter your name"
                maxLength={MAX_USERNAME_LENGTH}
                className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-16"
                aria-describedby={nameError ? 'name-error' : undefined}
                aria-invalid={!!nameError}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 dark:text-stone-500 tabular-nums">
                {displayName.length}/{MAX_USERNAME_LENGTH}
              </span>
            </div>
            {nameError && (
              <p id="name-error" className="text-sm text-red-500 mt-2" role="alert">
                {nameError}
              </p>
            )}
            <button
              onClick={handleNameSave}
              disabled={nameSaving || displayName.trim() === profile.username}
              className="mt-3 w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-200 dark:disabled:bg-stone-700 disabled:text-stone-400 dark:disabled:text-stone-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:shadow-none"
            >
              {nameSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : nameSuccess ? (
                <>
                  <Check size={18} />
                  Saved!
                </>
              ) : (
                'Save Name'
              )}
            </button>
          </section>

          <section>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = preference === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setPreference(option.value)}
                    className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                    }`}
                    aria-pressed={isActive}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                    <Icon size={24} strokeWidth={1.5} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 text-center">
              {preference === 'system'
                ? 'Automatically matches your device'
                : `Always use ${preference} mode`}
            </p>
          </section>
        </div>

        <div className="flex-shrink-0 px-5 py-4 border-t border-stone-100 dark:border-stone-800 safe-area-bottom">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
