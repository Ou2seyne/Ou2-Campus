'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
}

interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Segmented — tab/toggle control with a Framer Motion glider (physical sliding indicator).
 * Used for view mode (Jour/Semaine/Liste) and category filters.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  layoutId = 'segmented-glider',
  className = '',
  size = 'md',
}: SegmentedProps<T>) {
  const textSize = size === 'sm' ? 'text-[11px] px-2.5 py-1' : 'text-[12px] px-3 py-1.5';

  return (
    <div
      role="radiogroup"
      className={`inline-flex border rounded-xs overflow-hidden relative ${className}`}
      style={{
        background: 'var(--surface-2)',
        borderColor: 'var(--border-2)',
        boxShadow: 'var(--el-1)',
        borderRadius: '2px',
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 inline-flex items-center gap-1 font-sans font-700 transition-colors cursor-pointer ${textSize}`}
            style={{
              color: isActive ? 'var(--text)' : 'var(--muted)',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Sliding background indicator */}
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 z-0 rounded-xs"
                style={{
                  background: 'var(--surface)',
                  boxShadow: 'var(--el-1)',
                  borderRadius: '2px',
                }}
                transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Toast / HUD — floating notification at bottom-right */
interface ToastProps {
  message: string | null;
  position?: 'bottom-right' | 'top-center';
}

export function Toast({ message, position = 'bottom-right' }: ToastProps) {
  if (!message) return null;

  const positionClass =
    position === 'top-center'
      ? 'top-4 left-1/2 -translate-x-1/2'
      : 'bottom-20 sm:bottom-6 right-4 sm:right-6';

  return (
    <div
      className={`fixed ${positionClass} z-50 pointer-events-none flex items-center gap-2 px-3 py-1.5 border font-mono text-xs font-700`}
      style={{
        background: 'var(--text)',
        color: 'var(--bg)',
        borderColor: 'var(--border-2)',
        boxShadow: 'var(--el-dark)',
        borderRadius: '2px',
        fontWeight: 700,
        animation: 'slideUp 0.12s ease-out',
      }}
      role="status"
      aria-live="polite"
    >
      <span
        className="w-1.5 h-1.5 rounded-full pulse-dot"
        style={{ background: '#22C55E' }}
        aria-hidden="true"
      />
      {message}
    </div>
  );
}
