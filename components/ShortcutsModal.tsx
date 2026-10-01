'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Kbd } from '@/components/ui/Kbd';
import { Switch } from '@/components/ui/Switch';

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleKeyEnabled?: boolean;
  onToggleSingleKey?: (enabled: boolean) => void;
}

const SHORTCUTS = [
  { key: 'J', section: 'Navigation', action: 'Basculer en Vue Jour', singleKey: true },
  { key: 'S', section: 'Navigation', action: 'Basculer en Vue Semaine', singleKey: true },
  { key: 'L', section: 'Navigation', action: 'Basculer en Vue Liste', singleKey: true },
  { key: '←', section: 'Navigation', action: 'Jour ou semaine précédent(e)', singleKey: false },
  { key: '→', section: 'Navigation', action: 'Jour ou semaine suivant(e)', singleKey: false },
  { key: 'T', section: 'Navigation', action: "Revenir immédiatement à Aujourd'hui", singleKey: true },
  { key: 'G', section: 'Navigation', action: 'Aller à une date précise / Recherche', singleKey: true },
  { key: 'R', section: 'Actions', action: 'Actualiser le flux ADE Campus', singleKey: true },
  { key: 'F', section: 'Actions', action: 'Activer / quitter le Focus Mode Amphi', singleKey: true },
  { key: '⌘K', section: 'Actions', action: 'Ouvrir la palette de commandes', singleKey: false },
  { key: '/', section: 'Actions', action: 'Donner le focus à la recherche', singleKey: true },
  { key: '?', section: 'Aide', action: 'Afficher ce tableau de raccourcis', singleKey: true },
  { key: 'Esc', section: 'Aide', action: 'Fermer toute boîte de dialogue active', singleKey: false },
];

export function ShortcutsModal({
  isOpen,
  onClose,
  singleKeyEnabled = true,
  onToggleSingleKey,
}: ShortcutsModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Raccourcis Clavier & Accessibilité"
      accentColor="var(--accent)"
      maxWidth="max-w-xl"
    >
      <div className="p-5 space-y-5 font-sans text-xs sm:text-sm">
        {/* WCAG 2.1.4 Toggle option */}
        <div
          className="p-3.5 border rounded-xs shadow-tactile-xs flex items-center justify-between gap-4"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border-2)',
          }}
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 font-sans font-700 text-xs sm:text-sm" style={{ color: 'var(--text)' }}>
              <ShieldCheck size={16} className="text-[var(--accent)] shrink-0" />
              <span>Raccourcis à touche unique (WCAG 2.1.4)</span>
            </div>
            <p className="font-sans text-[11px] text-[var(--muted)] leading-relaxed">
              Désactivez les touches uniques (J, S, L, T, R, F, G, /) si vous utilisez un lecteur d&apos;écran ou une commande vocale.
            </p>
          </div>

          {onToggleSingleKey && (
            <Switch
              checked={singleKeyEnabled}
              onChange={onToggleSingleKey}
              aria-label="Activer ou désactiver les touches simples"
            />
          )}
        </div>

        {/* Shortcuts table */}
        <div className="border rounded-xs divide-y divide-[var(--border)] overflow-hidden" style={{ borderColor: 'var(--border-2)', background: 'var(--surface)' }}>
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                !singleKeyEnabled && sc.singleKey ? 'opacity-40 line-through' : 'hover:bg-[var(--surface-2)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-[var(--muted)] w-20 shrink-0">
                  {sc.section}
                </span>
                <span className="font-sans font-600 text-xs sm:text-sm" style={{ color: 'var(--text)' }}>
                  {sc.action}
                </span>
              </div>
              <Kbd>{sc.key}</Kbd>
            </div>
          ))}
        </div>

        <p className="font-mono text-[11px] text-[var(--muted)] text-right">
          Appuyez sur <Kbd>Esc</Kbd> pour fermer cette fenêtre
        </p>
      </div>
    </Dialog>
  );
}
