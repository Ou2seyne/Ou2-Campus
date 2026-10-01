'use client';

import React from 'react';

interface BadgeProps {
  variant?: 'cm' | 'td' | 'tp' | 'exam' | 'projet' | 'autre' | 'live' | 'neutral' | 'accent';
  children: React.ReactNode;
  className?: string;
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

/** Stamp Badge — Geist Mono, all-caps, 10px, industrial stamp style. */
export function Badge({ variant = 'neutral', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`stamp-badge ${className}`}
      style={variantMap[variant]}
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

/** Kbd — keyboard shortcut display */
interface KbdProps {
  children: React.ReactNode;
  className?: string;
}
export function Kbd({ children, className = '' }: KbdProps) {
  return (
    <kbd
      className={`font-mono text-[11px] px-1.5 py-0.5 rounded-xs border inline-flex items-center ${className}`}
      style={{
        fontFamily: 'var(--font-mono)',
        background: 'var(--surface-2)',
        borderColor: 'var(--border-2)',
        color: 'var(--muted)',
        boxShadow: '1px 1px 0px 0px var(--border-2)',
        fontWeight: 600,
        fontSize: '11px',
        borderRadius: '2px',
        lineHeight: 1.4,
      }}
    >
      {children}
    </kbd>
  );
}

/** Skeleton — loading placeholder with animated pulse */
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded-xs ${className}`}
      style={{
        background: 'var(--surface-3)',
        animation: 'pulse 1.8s ease-in-out infinite',
        borderRadius: '2px',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/** Spinner — loading indicator */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <span
      className={`inline-block rounded-full border-2 spinner ${sizeMap[size]} ${className}`}
      style={{
        borderColor: 'var(--border-2)',
        borderTopColor: 'var(--accent)',
      }}
      role="status"
      aria-label="Chargement…"
    />
  );
}

/** EmptyState — structured empty state with icon, title, action */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="text-3xl opacity-40" aria-hidden="true">
          {icon}
        </div>
      )}
      <p
        className="font-sans font-700 text-sm"
        style={{ color: 'var(--text-2)', fontWeight: 700 }}
      >
        {title}
      </p>
      {description && (
        <p className="font-sans text-xs leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
