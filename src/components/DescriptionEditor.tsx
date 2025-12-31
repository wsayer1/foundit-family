import { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Send, Tag, X, ChevronDown, Check } from 'lucide-react';
import { StepIndicator } from './LocationPermissionScreen';

interface DescriptionEditorProps {
  imageData: string;
  description: string;
  tag: string;
  loading: boolean;
  posting: boolean;
  error: string | null;
  onDescriptionChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onPost: () => void;
  onBack: () => void;
}

const PRESET_CATEGORIES = [
  'furniture',
  'electronics',
  'clothing',
  'books',
  'decor',
  'toys',
  'kitchen',
  'outdoor',
  'sports',
  'tools',
  'appliances',
  'other',
];

function formatTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
}

interface TagSelectorProps {
  tag: string;
  onTagChange: (value: string) => void;
  disabled?: boolean;
}

function TagSelector({ tag, onTagChange, disabled }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setCustomInput('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustomInput]);

  const handleSelectCategory = (category: string) => {
    if (category === 'other') {
      setShowCustomInput(true);
    } else {
      onTagChange(category);
      setIsOpen(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onTagChange(customInput.trim().toLowerCase());
      setCustomInput('');
      setShowCustomInput(false);
      setIsOpen(false);
    }
  };

  const handleRemoveTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTagChange('');
  };

  if (!tag) {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-full text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Tag size={14} />
          <span>Add tag</span>
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 py-2 z-50 max-h-64 overflow-y-auto">
            {showCustomInput ? (
              <div className="px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder="Enter custom tag..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-200"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomInput('');
                    }}
                    className="flex-1 px-3 py-1.5 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    disabled={!customInput.trim()}
                    className="flex-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <>
                {PRESET_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className="w-full px-4 py-2 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-between"
                  >
                    <span>{formatTag(category)}</span>
                    {category === 'other' && (
                      <span className="text-xs text-stone-400">Custom</span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="group flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Tag size={14} />
        <span>{formatTag(tag)}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span
          onClick={handleRemoveTag}
          className="ml-0.5 p-1 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
        >
          <X size={12} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 py-2 z-50 max-h-64 overflow-y-auto">
          {showCustomInput ? (
            <div className="px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                placeholder="Enter custom tag..."
                className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-200"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomInput('');
                  }}
                  className="flex-1 px-3 py-1.5 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  disabled={!customInput.trim()}
                  className="flex-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <>
              {PRESET_CATEGORIES.map((category) => {
                const isSelected = tag.toLowerCase() === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{formatTag(category)}</span>
                    {isSelected && <Check size={14} />}
                    {category === 'other' && !isSelected && (
                      <span className="text-xs text-stone-400">Custom</span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function DescriptionEditor({
  imageData,
  description,
  tag,
  loading,
  posting,
  error,
  onDescriptionChange,
  onTagChange,
  onPost,
  onBack
}: DescriptionEditorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex flex-col">
      <div
        className="relative z-40 flex items-center justify-center px-4"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: '16px' }}
      >
        <StepIndicator currentStep={3} />
      </div>

      <div className="flex-1 px-4 pb-40 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl mb-4">
            <img
              src={imageData}
              alt="Item"
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 size={18} className="text-emerald-500 animate-spin" />
                    <span className="text-sm text-stone-500">AI is describing your find...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-amber-500" />
                    <span className="text-sm text-stone-500">AI-generated</span>
                  </>
                )}
              </div>
              {!loading && (
                <TagSelector
                  tag={tag}
                  onTagChange={onTagChange}
                  disabled={posting}
                />
              )}
            </div>

            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={loading || posting}
              placeholder="Describe this item..."
              className="w-full h-32 resize-none bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
            />

            <p className="text-xs text-stone-400 mt-2">
              Edit the description if needed, or post it as is.
            </p>
          </div>

          {error && (
            <div className="mt-4 bg-red-100/90 backdrop-blur-sm text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 px-4"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={onPost}
            disabled={loading || posting || !description.trim()}
            className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
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
          <p className="text-center text-xs text-white/70 mt-3">
            You'll earn 10 points for sharing this find!
          </p>
        </div>
      </div>
    </div>
  );
}
