'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Anomalie de Synchronisation ADE',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`w-full p-6 border rounded-xs shadow-tactile text-left flex flex-col gap-4 ${className}`}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--exam-bar)',
        borderTopWidth: '3px',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xs border flex items-center justify-center shrink-0"
          style={{
            background: 'var(--exam-bg)',
            borderColor: 'var(--exam-bar)',
            color: 'var(--exam-text)',
          }}
        >
          <AlertTriangle size={20} />
        </div>

        <div className="space-y-1">
          <h3 className="font-sans font-800 text-sm text-[var(--text)] uppercase tracking-tight">
            {title}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <div className="pt-1 flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw size={13} />}
          >
            Réessayer la synchronisation
          </Button>
        </div>
      )}
    </div>
  );
}
