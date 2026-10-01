'use client';

import React, { useId } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isSearch?: boolean;
  onClear?: () => void;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      isSearch = false,
      onClear,
      leftIcon,
      className = '',
      style,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {/* Left icon or Search icon */}
          {isSearch ? (
            <Search
              size={14}
              className="absolute left-3 text-[var(--muted)] pointer-events-none"
              aria-hidden="true"
            />
          ) : leftIcon ? (
            <div className="absolute left-3 text-[var(--muted)] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            value={value}
            className={`w-full font-sans text-xs sm:text-sm border rounded-xs transition-colors outline-none min-h-[44px] ${
              isSearch || leftIcon ? 'pl-9' : 'pl-3'
            } ${onClear && value ? 'pr-9' : 'pr-3'} ${
              error
                ? 'border-[var(--exam-bar)] text-[var(--exam-text)] bg-[var(--exam-bg)]/30'
                : 'border-[var(--border-2)] text-[var(--text)] bg-[var(--surface)] hover:border-[var(--muted)] focus:border-[var(--accent)]'
            } ${disabled ? 'opacity-40 cursor-not-allowed bg-[var(--surface-2)]' : ''} ${className}`}
            style={{
              boxShadow: error
                ? '1.5px 1.5px 0px 0px var(--exam-bar)'
                : '1.5px 1.5px 0px 0px var(--border)',
              borderRadius: '2px',
              ...style,
            }}
            {...props}
          />

          {/* Clear button */}
          {onClear && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Effacer le champ"
              className="absolute right-2.5 p-1 rounded-xs hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="flex items-center gap-1 font-mono text-[11px] font-bold text-[var(--exam-text)] pt-0.5"
            role="alert"
          >
            <AlertCircle size={12} className="shrink-0 text-[var(--exam-bar)]" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
