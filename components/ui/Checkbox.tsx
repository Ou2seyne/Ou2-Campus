'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic(checked ? 'tap' : 'success');
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <button
        id={checkboxId}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={typeof label === 'string' ? label : 'Case à cocher'}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`btn-tactile inline-flex items-center justify-center shrink-0 border transition-colors outline-none cursor-pointer select-none ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '2px',
          background: checked ? 'var(--accent)' : 'var(--surface)',
          borderColor: checked ? 'var(--accent)' : 'var(--border-2)',
          boxShadow: checked ? 'var(--el-accent)' : 'var(--el-1)',
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2.5 6.5L4.5 8.5L9.5 3.5"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      {label && (
        <label
          htmlFor={checkboxId}
          onClick={handleToggle}
          className={`font-sans text-xs sm:text-sm font-600 cursor-pointer select-none leading-snug ${
            checked ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'
          } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
