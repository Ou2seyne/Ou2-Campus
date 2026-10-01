'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeSwitcherProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function ThemeSwitcher({ isDark, onToggleDark }: ThemeSwitcherProps) {
  return (
    <button
      onClick={onToggleDark}
      suppressHydrationWarning
      className="btn-tactile p-2 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] shadow-tactile-xs transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-2)]"
      title="Basculer le thème"
      aria-label="Basculer le thème (clair / sombre)"
      aria-pressed={isDark}
    >
      <Sun className="w-4 h-4 text-amber-500 hidden dark:block" strokeWidth={2} aria-hidden="true" />
      <Moon className="w-4 h-4 text-slate-700 block dark:hidden" strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
