'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useSwipe } from '@/hooks/useSwipe';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  /** Border-top accent color (category color or --accent) */
  accentColor?: string;
  children: React.ReactNode;
  /** Max width for desktop (default: 'max-w-xl') */
  maxWidth?: string;
  id?: string;
}

/**
 * Dialog — accessible modal with focus trap, Escape to close,
 * scroll lock, desktop centering and mobile bottom-sheet fallback.
 *
 * WCAG 2.2: role="dialog", aria-modal="true", aria-labelledby, focus trap.
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  accentColor = 'var(--accent)',
  children,
  maxWidth = 'max-w-xl',
  id,
}: DialogProps) {
  const generatedId = React.useId();
  const baseId = id || generatedId;
  const titleId = title ? `${baseId}-title` : undefined;
  const descId  = description ? `${baseId}-desc` : undefined;

  const { containerRef, handleKeyDown } = useFocusTrap<HTMLDivElement>({
    active: isOpen,
    onClose,
    returnFocus: true,
  });

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Swipe-down to close on mobile (>70px)
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeDown: onClose,
    threshold: 70,
  });

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dialog-backdrop no-print"
          aria-hidden={!isOpen}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          style={{ zIndex: 150 }}
        >
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidth} mx-auto outline-none flex flex-col overflow-hidden sm:my-auto sm:rounded-sm border-t-3 sm:border`}
            style={{
              maxHeight: '92dvh',
              background: 'var(--surface)',
              borderTopColor: accentColor,
              borderTopWidth: '3px',
              borderTopStyle: 'solid',
              boxShadow: 'var(--el-3)',
            }}
          >
            {/* Mobile grabber — touch target for swipe */}
            <div
              className="sm:hidden shrink-0 pt-1"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="sheet-grabber" />
            </div>

            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <h2
                  id={titleId}
                  className="font-sans text-base font-800 leading-tight uppercase tracking-tight"
                  style={{ color: 'var(--text)' }}
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer la boîte de dialogue"
                  className="btn-tactile w-8 h-8 inline-flex items-center justify-center border rounded-xs text-sm"
                  style={{
                    background: 'var(--surface-2)',
                    borderColor: 'var(--border-2)',
                    color: 'var(--muted)',
                    boxShadow: 'var(--el-1)',
                    minWidth: '44px',
                    minHeight: '44px',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Accessible Description */}
            {description && (
              <p id={descId} className="sr-only">
                {description}
              </p>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
