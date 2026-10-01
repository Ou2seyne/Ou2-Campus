'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  CheckCircle2,
  WifiOff,
  Zap,
  Sparkles,
} from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface PwaInstallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isIos: boolean;
  isInstallable: boolean;
  isStandalone: boolean;
  onInstall: () => Promise<boolean>;
}

export function PwaInstallSheet({
  isOpen,
  onClose,
  isIos,
  isInstallable,
  isStandalone,
  onInstall,
}: PwaInstallSheetProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    haptic.tap();
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const accepted = await onInstall();
        if (accepted) {
          haptic.success();
          setInstalledSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } finally {
        setIsInstalling(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Installer l'application Aura Campus"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          haptic.light();
          onClose();
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Sheet Content */}
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative w-full sm:max-w-md max-h-[92vh] flex flex-col overflow-hidden z-10 border-t sm:border shadow-tactile-dark rounded-t-2xl sm:rounded-sm pb-[env(safe-area-inset-bottom)]"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border-2)',
          color: 'var(--text)',
        }}
      >
        {/* Poignée tactile mobile */}
        <div className="sm:hidden w-full pt-2.5 pb-1 flex justify-center bg-[var(--surface-2)]">
          <div className="sheet-grabber" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-sm flex items-center justify-center border shadow-tactile-xs"
              style={{
                background: 'var(--accent)',
                borderColor: 'var(--accent)',
                color: '#fff',
              }}
            >
              <Smartphone className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-800 uppercase px-1.5 py-0.2 rounded-xs border border-[var(--border-2)] bg-[var(--surface)] text-[var(--accent)]">
                  PWA OFFICIELLE
                </span>
                <span className="text-[10px] font-mono font-700 text-emerald-600 dark:text-emerald-400">
                  · 100% HORS-LIGNE
                </span>
              </div>
              <h3 className="text-sm font-800 tracking-tight leading-tight mt-0.5">
                Installer Aura Campus
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="p-1.5 rounded-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Status if already standalone */}
          {isStandalone ? (
            <div className="p-4 rounded-xs border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-800 font-mono">APPLICATION DÉJÀ INSTALLÉE</p>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  Vous utilisez actuellement Aura Campus en mode autonome plein écran avec persistance hors-ligne.
                </p>
              </div>
            </div>
          ) : installedSuccess ? (
            <div className="p-4 rounded-xs border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="text-xs font-800 font-mono">INSTALLATION RÉUSSIE !</p>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  L&apos;icône Aura Campus est maintenant disponible sur votre écran d&apos;accueil.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Value propositions */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)]">
                  <WifiOff className="w-4 h-4 mx-auto mb-1 text-[var(--accent)]" />
                  <p className="text-[11px] font-800 leading-tight">Hors-ligne</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Amphis &amp; sous-sols</p>
                </div>
                <div className="p-2.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)]">
                  <Zap className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                  <p className="text-[11px] font-800 leading-tight">Zéro latence</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Ouverture instantanée</p>
                </div>
                <div className="p-2.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)]">
                  <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                  <p className="text-[11px] font-800 leading-tight">Plein écran</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Sans barre d&apos;adresse</p>
                </div>
              </div>

              {/* iOS Safari Tutorial */}
              {isIos ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-800 font-mono uppercase tracking-wide text-[var(--text)]">
                      Comment l&apos;ajouter sur iPhone / iPad :
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs border border-[var(--border-2)] bg-[var(--surface-2)] text-[var(--muted)]">
                      Safari
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Step 1 */}
                    <div className="flex items-center gap-3 p-3 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] shadow-tactile-xs">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-mono font-800 text-xs shrink-0">
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-700 text-[var(--text)]">
                          Touchez l&apos;icône <strong>Partager</strong>
                        </p>
                        <p className="text-[11px] text-[var(--muted)]">
                          Située dans la barre en bas de votre écran Safari.
                        </p>
                      </div>
                      <div className="p-1.5 rounded-xs border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                        <Share className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center gap-3 p-3 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] shadow-tactile-xs">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-mono font-800 text-xs shrink-0">
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-700 text-[var(--text)]">
                          Sélectionnez <strong>« Sur l&apos;écran d&apos;accueil »</strong>
                        </p>
                        <p className="text-[11px] text-[var(--muted)]">
                          Faites défiler le menu d&apos;actions vers le bas.
                        </p>
                      </div>
                      <div className="p-1.5 rounded-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <PlusSquare className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center gap-3 p-3 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] shadow-tactile-xs">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-mono font-800 text-xs shrink-0">
                        3
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-700 text-[var(--text)]">
                          Touchez <strong>« Ajouter »</strong> en haut à droite
                        </p>
                        <p className="text-[11px] text-[var(--muted)]">
                          L&apos;application s&apos;ouvre ensuite comme une vraie app native !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isInstallable ? (
                /* Android / Chromium 1-Tap Button */
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour ajouter directement Aura Campus à vos applications avec icône dédiée et support hors-ligne immédiat.
                  </p>
                  <button
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="btn-tactile w-full py-3 px-4 rounded-xs text-xs font-800 flex items-center justify-center gap-2 cursor-pointer border shadow-tactile-sm"
                    style={{
                      background: 'var(--text)',
                      color: 'var(--bg)',
                      borderColor: 'var(--text)',
                    }}
                  >
                    <Download className={`w-4 h-4 ${isInstalling ? 'spinner' : ''}`} />
                    <span>{isInstalling ? 'Installation en cours…' : 'Installer sur cet appareil'}</span>
                  </button>
                </div>
              ) : (
                /* Fallback info */
                <div className="p-3.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)] leading-relaxed">
                  Pour installer l&apos;application, ouvrez le menu de votre navigateur (les trois points verticaux en haut à droite) et choisissez <strong>« Installer l&apos;application »</strong> ou <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.
                </div>
              )}
            </>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => {
                haptic.tap();
                onClose();
              }}
              className="btn-tactile w-full py-2.5 px-3 rounded-xs text-xs font-700 text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] bg-[var(--surface-2)] cursor-pointer text-center"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
