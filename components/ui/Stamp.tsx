'use client';

import React from 'react';

export type StampVariant = 'exam' | 'live' | 'neutral' | 'accent';

export interface StampProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StampVariant;
  children: React.ReactNode;
}

const variantStyles: Record<StampVariant, React.CSSProperties> = {
  exam: {
    background: 'var(--exam-bg)',
    borderColor: 'var(--exam-bar)',
    color: 'var(--exam-text)',
    boxShadow: '1px 1px 0px 0px var(--exam-bar)',
    borderWidth: '2px',
    borderStyle: 'double',
  },
  live: {
    background: 'var(--live-bg)',
    borderColor: 'var(--live-bar)',
    color: 'var(--live-text)',
    boxShadow: '1px 1px 0px 0px var(--live-bar)',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  neutral: {
    background: 'var(--surface-2)',
    borderColor: 'var(--border-2)',
    color: 'var(--muted)',
    boxShadow: '1px 1px 0px 0px var(--border-2)',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  accent: {
    background: 'var(--accent-dim)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
    boxShadow: '1px 1px 0px 0px var(--accent)',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
};

export function Stamp({ variant = 'neutral', children, className = '', style, ...props }: StampProps) {
  const vStyle = variantStyles[variant];

  return (
    <span
      className={`stamp-badge select-none ${className}`}
      style={{
        ...vStyle,
        ...style,
      }}
      {...props}
    >
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-indicator-pulse inline-block" />
      )}
      {children}
    </span>
  );
}
