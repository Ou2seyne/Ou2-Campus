'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  RotateCw,
  Sun,
  Moon,
  BarChart3,
  Link,
  HelpCircle,
  X,
  Smartphone,
  ChevronRight,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone: boolean;
  onOpenInstallSheet: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenAnalytics: () => void;
  onOpenAddModal: () => void;
  onOpenShortcuts: () => void;
  isOnline: boolean;
  scheduleName?: string;
  lastFetchedAt?: string | null;
  onFocusSearch?: () => void;
}

export function MobileActionSheet({
  isOpen,
  onClose,
  isStandalone,
  onOpenInstallSheet,
  onRefresh,
  isRefreshing,
  isDark,
  onToggleDark,
  onOpenAnalytics,
  onOpenAddModal,
  onOpenShortcuts,
  isOnline,
  scheduleName = 'Aura Campus',
  lastFetchedAt,
  onFocusSearch,
}: MobileActionSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 overflow-hidden sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu des actions mobiles"
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
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative w-full max-h-[85vh] flex flex-col overflow-hidden z-10 border-t shadow-tactile-dark rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border-2)',
          color: 'var(--text)',
        }}
      >
        {/* Grabber */}
        <div className="w-full pt-2.5 pb-1 flex justify-center bg-[var(--surface-2)]">
          <div className="sheet-grabber" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-tight leading-tight">
                {scheduleName}
              </h3>
              {isStandalone ? (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PWA
                </span>
              ) : (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs border border-[var(--border-2)] bg-[var(--surface)] text-[var(--muted)]">
                  WEB
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted)] mt-1 font-mono">
              {isOnline ? 'En ligne · Synchronisation active' : 'Hors-ligne · Données en cache local'}
            </p>
          </div>

          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="p-2 rounded-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {/* PWA Install Banner Button */}
          {!isStandalone && (
            <button
              onClick={() => {
                haptic.tap();
                onClose();
                onOpenInstallSheet();
              }}
              className="btn-tactile w-full flex items-center justify-between p-4 rounded-xs border shadow-tactile-sm transition-all text-left group"
              style={{
                background: 'var(--accent)',
                borderColor: 'var(--accent)',
                color: '#fff',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xs bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Smartphone className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold">Installer l&apos;application</span>
                    <span className="text-[10px] font-mono font-black uppercase px-1.5 py-0.2 rounded-xs bg-white text-[var(--accent)]">
                      PWA
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5 leading-tight">
                    Accès instantané &amp; hors-ligne sur votre écran d&apos;accueil
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-white/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          )}

          {/* Actualiser */}
          <button
            onClick={() => {
              haptic.tap();
              onRefresh();
              onClose();
            }}
            disabled={isRefreshing}
            className="btn-tactile w-full flex items-center justify-between p-3.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors text-left min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xs bg-[var(--surface)] border border-[var(--border-2)] flex items-center justify-center text-[var(--text)] shrink-0">
                <RotateCw className={`w-4.5 h-4.5 ${isRefreshing ? 'spinner text-[var(--accent)]' : ''}`} />
              </div>
              <div>
                <span className="text-sm font-bold block">Actualiser le planning ADE</span>
                <span className="text-xs text-[var(--muted)] font-mono">
                  {lastFetchedAt ? `Dernier sync : ${lastFetchedAt.split('T')[1]?.substring(0, 5) || 'récent'}` : 'Télécharger les dernières modifications'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-[var(--muted)] shrink-0" />
          </button>

          {/* Recherche rapide */}
          {onFocusSearch && (
            <button
              onClick={() => {
                haptic.tap();
                onClose();
                onFocusSearch();
              }}
              className="btn-tactile w-full flex items-center justify-between p-3.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors text-left min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xs bg-[var(--surface)] border border-[var(--border-2)] flex items-center justify-center text-[var(--accent)] shrink-0">
                  <Search className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-bold block">Recherche de cours / enseignant</span>
                  <span className="text-xs text-[var(--muted)] font-mono">
                    Filtrer par matière, salle ou professeur
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-[var(--muted)] shrink-0" />
            </button>
          )}

          {/* Basculer Thème */}
          <button
            onClick={() => {
              haptic.tap();
              onToggleDark();
            }}
            className="btn-tactile w-full flex items-center justify-between p-3.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors text-left min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xs bg-[var(--surface)] border border-[var(--border-2)] flex items-center justify-center text-[var(--text)] shrink-0">
                {isDark ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-blue-600" />}
              </div>
              <div>
                <span className="text-sm font-bold block">Apparence du thème</span>
                <span className="text-xs text-[var(--muted)] font-mono">
                  Actuellement : {isDark ? 'Mode Sombre (Dark)' : 'Mode Clair (Light)'}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded-xs border border-[var(--border-2)] bg-[var(--surface)]">
              {isDark ? 'Passer en clair' : 'Passer en sombre'}
            </span>
          </button>

          {/* Statistiques */}
          <button
            onClick={() => {
              haptic.tap();
              onClose();
              onOpenAnalytics();
            }}
            className="btn-tactile w-full flex items-center justify-between p-3.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors text-left min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xs bg-[var(--surface)] border border-[var(--border-2)] flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-sm font-bold block">Statistiques &amp; Volumes</span>
                <span className="text-xs text-[var(--muted)] font-mono">
                  Volume horaire, répartition CM/TD/TP
                </span>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-[var(--muted)] shrink-0" />
          </button>

          {/* Gérer URLs ADE */}
          <button
            onClick={() => {
              haptic.tap();
              onClose();
              onOpenAddModal();
            }}
            className="btn-tactile w-full flex items-center justify-between p-3.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors text-left min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xs bg-[var(--surface)] border border-[var(--border-2)] flex items-center justify-center text-[var(--text)] shrink-0">
                <Link className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-sm font-bold block">Gérer les flux ADE</span>
                <span className="text-xs text-[var(--muted)] font-mono">
                  Changer d&apos;URL, filière ou groupe TD
                </span>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-[var(--muted)] shrink-0" />
          </button>

          {/* Raccourcis et gestes */}
          <button
            onClick={() => {
              haptic.tap();
              onClose();
              onOpenShortcuts();
            }}
            className="btn-tactile w-full flex items-center justify-between p-3.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors text-left min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xs bg-[var(--surface)] border border-[var(--border-2)] flex items-center justify-center text-[var(--text)] shrink-0">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-sm font-bold block">Gestes mobiles &amp; Astuces</span>
                <span className="text-xs text-[var(--muted)] font-mono">
                  Glisser gauche/droite pour changer de jour
                </span>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-[var(--muted)] shrink-0" />
          </button>
        </div>

        {/* Footer info */}
        <div className="px-5 pt-1 text-center">
          <p className="text-[10px] font-mono text-[var(--muted-2)]">
            Aura Campus Mobile PWA · Cache hors-ligne sécurisé
          </p>
        </div>
      </motion.div>
    </div>
  );
}
