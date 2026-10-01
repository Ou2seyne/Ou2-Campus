'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useSwipe } from '@/hooks/useSwipe';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
  accentColor?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '85dvh',
  accentColor = 'var(--accent)',
}: BottomSheetProps) {
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

  // Swipe-down threshold > 70px
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeDown: onClose,
    threshold: 70,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dialog-backdrop no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          style={{ zIndex: 160 }}
        >
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg mx-auto flex flex-col overflow-hidden outline-none"
            style={{
              maxHeight,
              background: 'var(--surface)',
              borderRadius: '4px 4px 0 0',
              borderTop: `3px solid ${accentColor}`,
              boxShadow: 'var(--el-3)',
            }}
          >
            {/* Grabber zone */}
            <div
              className="pt-2 pb-1 shrink-0 cursor-grab active:cursor-grabbing"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="sheet-grabber" />
            </div>

            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-5 py-3 border-b shrink-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <h3
                  className="font-sans text-sm font-800 uppercase tracking-tight"
                  style={{ color: 'var(--text)' }}
                >
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer"
                  className="btn-tactile w-8 h-8 inline-flex items-center justify-center border rounded-xs text-xs"
                  style={{
                    background: 'var(--surface-2)',
                    borderColor: 'var(--border-2)',
                    color: 'var(--muted)',
                    minWidth: '44px',
                    minHeight: '44px',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
