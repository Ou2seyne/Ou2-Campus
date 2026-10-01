'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`w-full p-8 border rounded-xs shadow-tactile-xs text-center flex flex-col items-center justify-center gap-3 ${className}`}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xs border flex items-center justify-center text-[var(--muted)] shadow-tactile-xs"
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border-2)',
        }}
      >
        {icon || <Calendar size={22} />}
      </div>

      <div className="space-y-1 max-w-md">
        <h3 className="font-sans font-800 text-sm sm:text-base text-[var(--text)] tracking-tight">
          {title}
        </h3>
        <p className="font-sans text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="default" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
