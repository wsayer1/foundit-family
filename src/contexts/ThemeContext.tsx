import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { AppearancePreference } from '../types/database';

type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  preference: AppearancePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (pref: AppearancePreference) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [preference, setPreferenceState] = useState<AppearancePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [isLoading, setIsLoading] = useState(true);

  const resolveTheme = useCallback((pref: AppearancePreference): ResolvedTheme => {
    if (pref === 'system') {
      return getSystemTheme();
    }
    return pref;
  }, []);

  useEffect(() => {
    const savedPref = localStorage.getItem('theme-preference') as AppearancePreference | null;
    if (savedPref && ['light', 'dark', 'system'].includes(savedPref)) {
      setPreferenceState(savedPref);
      const resolved = resolveTheme(savedPref);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }
    setIsLoading(false);
  }, [resolveTheme]);

  useEffect(() => {
    if (profile?.appearance_preference) {
      setPreferenceState(profile.appearance_preference);
      localStorage.setItem('theme-preference', profile.appearance_preference);
      const resolved = resolveTheme(profile.appearance_preference);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }
  }, [profile?.appearance_preference, resolveTheme]);

  useEffect(() => {
    if (preference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  useEffect(() => {
    const resolved = resolveTheme(preference);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [preference, resolveTheme]);

  const setPreference = async (newPref: AppearancePreference) => {
    setPreferenceState(newPref);
    localStorage.setItem('theme-preference', newPref);

    const resolved = resolveTheme(newPref);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    if (user) {
      await supabase
        .from('profiles')
        .update({ appearance_preference: newPref })
        .eq('id', user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
