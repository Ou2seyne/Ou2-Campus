'use client';

import React from 'react';
import { Spinner } from './Spinner';

export type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<IconButtonVariant, React.CSSProperties> = {
  default: {
    background: 'var(--surface)',
    color: 'var(--text)',
    borderColor: 'var(--border-2)',
    boxShadow: 'var(--el-1)',
  },
  primary: {
    background: 'var(--accent)',
    color: '#ffffff',
    borderColor: 'var(--accent)',
    boxShadow: 'var(--el-accent)',
  },
  secondary: {
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderColor: 'var(--border-2)',
    boxShadow: 'var(--el-1)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-2)',
    borderColor: 'transparent',
    boxShadow: 'none',
  },
  danger: {
    background: 'var(--exam-bg)',
    color: 'var(--exam-text)',
    borderColor: 'var(--exam-bar)',
    boxShadow: '1.5px 1.5px 0px 0px var(--exam-bar)',
  },
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      variant = 'default',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const vStyle = variantStyles[variant];

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={label}
        title={label}
        className={`btn-tactile inline-flex items-center justify-center border rounded-xs shrink-0 select-none ${sizeClasses[size]} ${className}`}
        style={{
          ...vStyle,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '2px',
          minWidth: '44px',
          minHeight: '44px',
          boxShadow: isDisabled ? 'none' : vStyle.boxShadow,
          ...style,
        }}
        {...props}
      >
        {isLoading ? <Spinner size="xs" /> : children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
