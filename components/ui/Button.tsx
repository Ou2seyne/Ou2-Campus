'use client';

import React from 'react';

export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  default: {
    background: 'var(--surface)',
    color: 'var(--text)',
    borderColor: 'var(--border-2)',
  },
  primary: {
    background: 'var(--accent)',
    color: '#ffffff',
    borderColor: 'var(--accent)',
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
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[11px] gap-1',
  sm: 'px-3 py-1.5 text-[12px] gap-1.5',
  md: 'px-4 py-2 text-[13px] gap-2',
  lg: 'px-5 py-2.5 text-[14px] gap-2',
};

const shadowByVariant: Record<ButtonVariant, string> = {
  default: '2px 2px 0px 0px var(--border-2)',
  primary: '2px 2px 0px 0px var(--accent-strong)',
  ghost:   'none',
  danger:  '2px 2px 0px 0px var(--exam-bar)',
};

/**
 * Button — tactile mechanical button for Aura Campus.
 * Hard 2px offset shadow, 2px radius, active enfoncement.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const variantStyle = variantStyles[variant];
    const shadow = shadowByVariant[variant];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={`btn-tactile inline-flex items-center font-sans font-700 border rounded-xs ${sizeStyles[size]} ${className}`}
        style={{
          ...variantStyle,
          boxShadow: isDisabled ? 'none' : shadow,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '2px',
          fontWeight: 700,
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <span
            className="w-3.5 h-3.5 rounded-full border-2 spinner"
            style={{
              borderColor: 'currentColor',
              borderTopColor: 'transparent',
              display: 'inline-block',
            }}
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: ButtonVariant;
}

/**
 * IconButton — square tactile icon-only button. Always has an aria-label.
 * Minimum 44×44px on mobile for touch target compliance.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = 'md', variant = 'default', className = '', style, children, ...props }, ref) => {
    const sizeMap: Record<string, string> = {
      sm: 'w-8 h-8 text-[14px]',
      md: 'w-10 h-10 text-[16px]',
      lg: 'w-12 h-12 text-[18px]',
    };
    const variantStyle = variantStyles[variant];
    const shadow = shadowByVariant[variant];

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={`btn-tactile inline-flex items-center justify-center border rounded-xs shrink-0 ${sizeMap[size]} ${className}`}
        style={{
          ...variantStyle,
          boxShadow: shadow,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '2px',
          minWidth: '44px',
          minHeight: '44px',
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';
