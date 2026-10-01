'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CheckCircle2 } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  showReconnectedBadge: boolean;
}

export function OfflineBanner({ isOnline, showReconnectedBadge }: OfflineBannerProps) {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.aside
          role="status"
          aria-live="polite"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full border-b overflow-hidden"
          style={{
            background: 'var(--amber-bg, #fef3c7)',
            borderColor: 'var(--amber-bar, #d97706)',
            color: 'var(--amber-text, #92400e)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="shrink-0 flex items-center justify-center p-1 rounded-xs bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <WifiOff className="w-3.5 h-3.5" />
              </span>
              <span className="font-800 uppercase tracking-wide px-1 py-0.5 border border-amber-600/30 rounded-xs text-[10px]">
                HORS-LIGNE
              </span>
              <span className="font-sans font-600">
                Consultation depuis le cache local. Vos devoirs et notes restent modifiables.
              </span>
            </div>
            <span className="shrink-0 hidden sm:inline text-[11px] font-mono opacity-80">
              Campus Artois
            </span>
          </div>
        </motion.aside>
      )}

      {showReconnectedBadge && isOnline && (
        <motion.aside
          role="status"
          aria-live="polite"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full border-b overflow-hidden"
          style={{
            background: 'var(--tp-bg, #ecfdf5)',
            borderColor: 'var(--tp-bar, #059669)',
            color: 'var(--tp-text, #065f46)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="shrink-0 flex items-center justify-center p-1 rounded-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span className="font-800 uppercase tracking-wide px-1 py-0.5 border border-emerald-600/30 rounded-xs text-[10px]">
                EN LIGNE
              </span>
              <span className="font-sans font-600">
                Connexion rétablie. Vos données ADE sont synchronisées en direct.
              </span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
