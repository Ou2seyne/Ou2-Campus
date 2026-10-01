'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useSwipe } from '@/hooks/useSwipe';

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
 * Dialog — accessible modal with focus trap, Escape to close, and
 * bottom-sheet on mobile (swipe-down >70px to dismiss).
 *
 * WCAG: role="dialog", aria-modal="true", aria-labelledby, focus trap.
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
  const titleId = id ? `${id}-title` : undefined;
  const descId  = id && description ? `${id}-desc` : undefined;

  const { containerRef, handleKeyDown } = useFocusTrap<HTMLDivElement>({
    active: isOpen,
    onClose,
    returnFocus: true,
  });

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
            /* Mobile: slide up from bottom */
            className={`relative w-full ${maxWidth} mx-auto outline-none`}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              /* Mobile: full-width bottom sheet */
              borderRadius: '4px 4px 0 0',
              maxHeight: '92dvh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface)',
              borderTop: `3px solid ${accentColor}`,
              boxShadow: '3px 3px 0px 0px var(--border-2)',
              overflowY: 'auto',
            }}
            /* Desktop override via CSS breakpoint (sm+) */
            data-dialog="true"
          >
            {/* Mobile grabber — touch target for swipe */}
            <div
              className="sm:hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="sheet-grabber" />
            </div>

            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h2
                  id={titleId}
                  className="font-sans text-base font-800 leading-tight"
                  style={{ color: 'var(--text)', fontWeight: 800 }}
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Fermer"
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
                  ✕
                </button>
              </div>
            )}

            {/* Description */}
            {description && (
              <p
                id={descId}
                className="sr-only"
              >
                {description}
              </p>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Desktop styles — override bottom-sheet to centred card */
// Applied via inline style check + media query handled in globals.css
