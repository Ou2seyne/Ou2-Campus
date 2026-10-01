'use client';

import React from 'react';
import {
  RotateCw,
  Sun,
  Moon,
  BarChart3,
  HelpCircle,
  Smartphone,
  ChevronRight,
  Focus,
  Calendar,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { BottomSheet } from '@/components/ui/BottomSheet';

export interface MobileActionSheetProps {
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
  onToggleFocusMode?: () => void;
  isFocusMode?: boolean;
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
  onToggleFocusMode,
  isFocusMode = false,
}: MobileActionSheetProps) {
  const handleAction = (cb: () => void) => {
    triggerHaptic('tap');
    onClose();
    cb();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={scheduleName}
      accentColor="var(--accent)"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Status card */}
        <div
          className="p-3 border rounded-xs flex items-center justify-between"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border-2)',
          }}
        >
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] uppercase text-[var(--muted)] font-bold">
              État de la synchronisation
            </span>
            <p className="font-sans font-700 text-xs" style={{ color: 'var(--text)' }}>
              {isOnline ? 'Connecté · Données locales à jour' : 'Mode Hors-ligne activé'}
            </p>
          </div>
          {lastFetchedAt && (
            <span className="font-mono text-[10px] text-[var(--muted)]">
              {new Date(lastFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Primary actions list */}
        <div className="border rounded-xs divide-y divide-[var(--border)] overflow-hidden shadow-tactile-xs" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
          {/* Refresh */}
          <button
            type="button"
            onClick={() => handleAction(onRefresh)}
            disabled={isRefreshing}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <RotateCw size={16} className={`text-[var(--muted)] ${isRefreshing ? 'animate-spin text-[var(--accent)]' : ''}`} />
              <span className="font-700 text-[var(--text)]">Actualiser le planning</span>
            </div>
            <ChevronRight size={15} className="text-[var(--muted)]" />
          </button>

          {/* Sources ADE */}
          <button
            type="button"
            onClick={() => handleAction(onOpenAddModal)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-[var(--muted)]" />
              <span className="font-700 text-[var(--text)]">Emplois du temps & Groupes</span>
            </div>
            <ChevronRight size={15} className="text-[var(--muted)]" />
          </button>

          {/* Analytics */}
          <button
            type="button"
            onClick={() => handleAction(onOpenAnalytics)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BarChart3 size={16} className="text-[var(--muted)]" />
              <span className="font-700 text-[var(--text)]">Statistiques & Volumes CM/TD/TP</span>
            </div>
            <ChevronRight size={15} className="text-[var(--muted)]" />
          </button>

          {/* Focus mode */}
          {onToggleFocusMode && (
            <button
              type="button"
              onClick={() => handleAction(onToggleFocusMode)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Focus size={16} className="text-[var(--muted)]" />
                <span className="font-700 text-[var(--text)]">
                  {isFocusMode ? 'Quitter le Mode Focus' : 'Activer le Mode Focus Amphi'}
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--muted)]">
                {isFocusMode ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* Shortcuts info */}
          <button
            type="button"
            onClick={() => handleAction(onOpenShortcuts)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={16} className="text-[var(--muted)]" />
              <span className="font-700 text-[var(--text)]">Raccourcis Clavier & Aide</span>
            </div>
            <ChevronRight size={15} className="text-[var(--muted)]" />
          </button>
        </div>

        {/* Theme and Install */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onToggleDark();
            }}
            className="btn-tactile flex-1 py-2.5 px-3 border rounded-xs font-sans font-700 text-xs flex items-center justify-center gap-2"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border-2)',
              color: 'var(--text)',
              boxShadow: 'var(--el-1)',
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? 'Mode Clair' : 'Mode Sombre'}</span>
          </button>

          {!isStandalone && (
            <button
              type="button"
              onClick={() => handleAction(onOpenInstallSheet)}
              className="btn-tactile flex-1 py-2.5 px-3 border rounded-xs font-sans font-700 text-xs flex items-center justify-center gap-2 text-[var(--accent)]"
              style={{
                background: 'var(--accent-dim)',
                borderColor: 'var(--accent)',
                boxShadow: 'var(--el-accent)',
              }}
            >
              <Smartphone size={15} />
              <span>Installer PWA</span>
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
