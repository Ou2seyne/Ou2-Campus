'use client';

import React from 'react';
import { Kbd } from './Kbd';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import { Stamp } from './Stamp';

export { Kbd, Skeleton, Spinner, EmptyState, Stamp };

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cm' | 'td' | 'tp' | 'exam' | 'projet' | 'autre' | 'live' | 'neutral' | 'accent';
  children: React.ReactNode;
  dot?: boolean;
}

const variantMap: Record<string, React.CSSProperties> = {
  cm:     { background: 'var(--cm-bar)',    color: '#fff' },
  td:     { background: 'var(--td-bar)',    color: '#fff' },
  tp:     { background: 'var(--tp-bar)',    color: '#fff' },
  exam:   { background: 'var(--exam-bar)',  color: '#fff' },
  projet: { background: 'var(--projet-bar)', color: '#fff' },
  autre:  { background: 'var(--autre-bar)', color: '#fff' },
  live: {
    background: 'var(--live-bg)',
    color: 'var(--live-text)',
    border: '1px solid var(--live-bar)',
    boxShadow: '1px 1px 0px 0px var(--live-bar)',
  },
  neutral: {
    background: 'var(--surface-2)',
    color: 'var(--muted)',
    border: '1px solid var(--border-2)',
    boxShadow: '1px 1px 0px 0px var(--border-2)',
  },
  accent: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
  },
};

/**
 * Badge — category, status or tag indicator with tabular-nums and tactile style.
 */
export function Badge({ variant = 'neutral', children, className = '', dot = false, style, ...props }: BadgeProps) {
  const vStyle = variantMap[variant] || variantMap.neutral;

  return (
    <span
      className={`stamp-badge select-none ${className}`}
      style={{
        ...vStyle,
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: 'currentColor' }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
