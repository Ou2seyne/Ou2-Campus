'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, PlusSquare, X, Smartphone, ArrowRight } from 'lucide-react';

interface PwaInstallBannerProps {
  canInstall: boolean;
  isIos: boolean;
  isInstallable: boolean;
  onInstall: () => Promise<boolean>;
  onDismiss: () => void;
}

export function PwaInstallBanner({
  canInstall,
  isIos,
  isInstallable,
  onInstall,
  onDismiss,
}: PwaInstallBannerProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (!canInstall) return null;

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await onInstall();
      } finally {
        setIsInstalling(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40"
      >
        <div
          className="border shadow-tactile-md p-3.5 sm:p-4 rounded-xs transition-colors"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border-2)',
            color: 'var(--text)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xs flex items-center justify-center shrink-0 border"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border-2)',
                }}
              >
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.2} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-800 uppercase px-1 py-0.2 rounded-xs border border-[var(--border-2)] bg-[var(--surface-2)] text-[var(--muted)]">
                    PWA HORS-LIGNE
                  </span>
                  <span className="text-[10px] font-mono font-700 text-emerald-600 dark:text-emerald-400">
                    · GRATUIT
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-800 tracking-tight text-[var(--text)] mt-0.5">
                  Installer Aura Campus
                </h4>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 rounded-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title="Fermer pour 7 jours"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-[var(--muted)] mt-2 leading-relaxed">
            Consultez votre emploi du temps en plein écran, sans barre d&apos;adresse et disponible même sans connexion dans les amphis.
          </p>

          {/* Guide iOS Safari interactif */}
          {showIosGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-2.5 rounded-xs border border-[var(--border-2)] bg-[var(--surface-2)] text-xs space-y-2"
            >
              <div className="font-700 text-[11px] text-[var(--text)] uppercase tracking-wide font-mono">
                Installation sur iPhone / iPad :
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                <span className="w-4 h-4 rounded-full bg-[var(--surface)] border border-[var(--border-2)] flex items-center justify-center font-mono font-800 text-[10px] shrink-0">
                  1
                </span>
                <span>
                  Touchez l&apos;icône <strong>Partager</strong> en bas de Safari :
                </span>
                <Share2 className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                <span className="w-4 h-4 rounded-full bg-[var(--surface)] border border-[var(--border-2)] flex items-center justify-center font-mono font-800 text-[10px] shrink-0">
                  2
                </span>
                <span>
                  Faites défiler et choisissez <strong>« Sur l&apos;écran d&apos;accueil »</strong>
                </span>
                <PlusSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-auto" />
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2">
            {!showIosGuide ? (
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="btn-tactile flex-1 py-1.5 px-3 rounded-xs text-xs font-700 flex items-center justify-center gap-1.5 cursor-pointer border"
                style={{
                  background: 'var(--text)',
                  color: 'var(--bg)',
                  borderColor: 'var(--text)',
                }}
              >
                {isIos ? (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Guide d&apos;installation iOS</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{isInstalling ? 'Installation...' : 'Installer sur cet appareil'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="btn-tactile flex-1 py-1.5 px-3 rounded-xs text-xs font-700 flex items-center justify-center gap-1.5 cursor-pointer border"
                style={{
                  background: 'var(--text)',
                  color: 'var(--bg)',
                  borderColor: 'var(--text)',
                }}
              >
                <span>C&apos;est compris !</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onDismiss}
              className="btn-tactile py-1.5 px-2.5 rounded-xs text-xs font-600 text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] bg-[var(--surface-2)] cursor-pointer"
            >
              Plus tard
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
