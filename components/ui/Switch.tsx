'use client';

import React from 'react';
import { triggerHaptic } from '@/lib/haptics';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic('tap');
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
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Interrupteur'}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`btn-tactile relative inline-flex items-center shrink-0 border transition-colors outline-none cursor-pointer select-none ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
        style={{
          width: '40px',
          height: '24px',
          borderRadius: '2px',
          background: checked ? 'var(--accent)' : 'var(--surface-2)',
          borderColor: checked ? 'var(--accent)' : 'var(--border-2)',
          boxShadow: checked ? 'var(--el-accent)' : 'var(--el-1)',
        }}
      >
        <span
          className="inline-block transition-transform duration-150 border"
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '1px',
            background: checked ? '#ffffff' : 'var(--muted)',
            borderColor: checked ? 'var(--accent)' : 'var(--border-2)',
            transform: checked ? 'translateX(18px)' : 'translateX(2px)',
          }}
        />
      </button>

      {label && (
        <label
          htmlFor={switchId}
          onClick={handleToggle}
          className={`font-sans text-xs sm:text-sm font-700 cursor-pointer select-none ${
            disabled ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          style={{ color: 'var(--text)' }}
        >
          {label}
        </label>
      )}
    </div>
  );
}
