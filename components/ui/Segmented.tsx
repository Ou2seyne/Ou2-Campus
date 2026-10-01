'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Toast } from './Toast';

export { Toast };

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
}

export interface SegmentedProps<T extends string = string> {
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
  const textSize = size === 'sm' ? 'text-[11px] px-2.5 py-1 min-h-[36px]' : 'text-[12px] px-3.5 py-1.5 min-h-[40px]';

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
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 inline-flex items-center justify-center gap-1.5 font-sans font-700 transition-colors cursor-pointer outline-none select-none ${textSize}`}
            style={{
              color: isActive ? 'var(--text)' : 'var(--muted)',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
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
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon}
              <span>{opt.label}</span>
              {opt.shortcut && (
                <span className="text-[10px] font-mono text-[var(--muted)] opacity-70">
                  [{opt.shortcut}]
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
