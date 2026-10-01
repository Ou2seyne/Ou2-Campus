'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  message: string;
  variant?: 'hud' | 'info' | 'success' | 'warning' | 'error';
  onDismiss?: () => void;
  className?: string;
}

export function Toast({
  message,
  variant = 'hud',
  onDismiss,
  className = '',
}: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDismiss}
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 border rounded-xs font-mono text-xs select-none shadow-tactile-dark ${className}`}
      style={{
        background: 'var(--text)',
        color: 'var(--bg)',
        borderColor: 'var(--border-2)',
        borderRadius: '2px',
        maxWidth: '380px',
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background:
            variant === 'error'
              ? '#EF4444'
              : variant === 'warning'
              ? '#F59E0B'
              : '#22C55E',
          boxShadow: '0 0 6px currentColor',
        }}
        aria-hidden="true"
      />
      <span className="font-700 tracking-wide truncate">{message}</span>
    </div>
  );
}

export interface ToastContainerProps {
  message: string | null;
  position?: 'bottom-right' | 'top-center' | 'bottom-center';
}

export function ToastHUD({ message, position = 'bottom-right' }: ToastContainerProps) {
  const positionClasses = {
    'bottom-right': 'fixed bottom-20 sm:bottom-6 right-4 sm:right-6',
    'top-center': 'fixed top-16 left-1/2 -translate-x-1/2',
    'bottom-center': 'fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2',
  }[position];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className={`${positionClasses} z-50 pointer-events-none no-print`}
        >
          <Toast message={message} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
