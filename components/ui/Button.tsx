'use client';

import React from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  default: {
    background: 'var(--surface)',
    color: 'var(--text)',
    borderColor: 'var(--border-2)',
    boxShadow: 'var(--el-2)',
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
  accent: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
    boxShadow: 'var(--el-accent)',
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
    boxShadow: '2px 2px 0px 0px var(--exam-bar)',
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-[11px] gap-1 min-h-[32px]',
  sm: 'px-3.5 py-1.5 text-[12px] gap-1.5 min-h-[36px]',
  md: 'px-4 py-2 text-[13px] gap-2 min-h-[44px]',
  lg: 'px-5 py-2.5 text-[14px] gap-2.5 min-h-[48px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'sm',
      isLoading = false,
      isError = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      style,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const vStyle = variantStyles[isError ? 'danger' : variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={`btn-tactile inline-flex items-center justify-center font-sans font-700 border rounded-xs select-none ${sizeStyles[size]} ${className}`}
        style={{
          ...vStyle,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '2px',
          boxShadow: isDisabled ? 'none' : vStyle.boxShadow,
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === 'xs' ? 'xs' : 'sm'} color="currentColor" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
