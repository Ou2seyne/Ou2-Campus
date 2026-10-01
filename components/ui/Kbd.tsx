'use client';

import React from 'react';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Kbd({ children, className = '', style, ...props }: KbdProps) {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono font-bold text-[10px] uppercase px-1.5 py-0.5 border rounded-xs select-none ${className}`}
      style={{
        background: 'var(--surface-2)',
        borderColor: 'var(--border-2)',
        color: 'var(--text)',
        boxShadow: '1px 1px 0px 0px var(--border-2)',
        lineHeight: 1.2,
        letterSpacing: '0.04em',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
      {...props}
    >
      {children}
    </kbd>
  );
}
