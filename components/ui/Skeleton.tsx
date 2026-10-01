'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'rect' | 'card' | 'course' | 'line';
}

export function Skeleton({
  width,
  height,
  variant = 'rect',
  className = '',
  style,
  ...props
}: SkeletonProps) {
  if (variant === 'course') {
    return (
      <div
        className={`w-full p-3.5 border rounded-xs shadow-tactile-xs animate-pulse flex flex-col gap-2.5 ${className}`}
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border-2)',
          borderLeftWidth: '4px',
          borderLeftColor: 'var(--border-2)',
          ...style,
        }}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-12 bg-[var(--surface-3)] rounded-xs" />
          <div className="h-4 w-28 bg-[var(--surface-3)] rounded-xs" />
        </div>
        <div className="h-5 w-3/4 bg-[var(--surface-3)] rounded-xs" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-24 bg-[var(--surface-3)] rounded-xs" />
          <div className="h-4 w-20 bg-[var(--surface-3)] rounded-xs" />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`w-full p-4 border rounded-xs shadow-tactile-xs animate-pulse space-y-3 ${className}`}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border-2)',
          ...style,
        }}
        {...props}
      >
        <div className="h-4 w-1/3 bg-[var(--surface-2)] rounded-xs" />
        <div className="h-6 w-3/4 bg-[var(--surface-2)] rounded-xs" />
        <div className="h-4 w-1/2 bg-[var(--surface-2)] rounded-xs" />
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse rounded-xs ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        background: 'var(--surface-2)',
        borderColor: 'var(--border)',
        ...style,
      }}
      {...props}
    />
  );
}
