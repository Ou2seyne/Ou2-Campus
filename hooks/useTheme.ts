'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'aura_theme';

export type ThemeMode = 'light' | 'dark' | 'auto';

function applyTheme(mode: ThemeMode) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const isDark =
    mode === 'dark' ||
    (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('light', !isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

  // Update the meta theme-color dynamically
  const lightMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"][media*="light"]');
  const darkMeta  = document.querySelector<HTMLMetaElement>('meta[name="theme-color"][media*="dark"]');
  if (isDark) {
    darkMeta?.setAttribute('content', '#0F0F0E');
    lightMeta?.setAttribute('content', '#F5F3EE');
  } else {
    lightMeta?.setAttribute('content', '#F5F3EE');
    darkMeta?.setAttribute('content', '#0F0F0E');
  }
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'auto';
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'auto';
  });

  const isDark =
    mode === 'dark' ||
    (mode === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Listen to system preference changes when in auto mode
  useEffect(() => {
    if (mode !== 'auto') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  // Apply theme on change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    applyTheme(mode);
    try {
      if (mode === 'auto') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch {
      // localStorage unavailable
    }
  }, [mode]);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const toggleDark = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { mode, isDark, setThemeMode, toggleDark };
}
