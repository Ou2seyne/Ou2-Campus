'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'J', section: 'Navigation', action: 'Afficher la vue Jour' },
  { key: 'S', section: 'Navigation', action: 'Afficher la vue Semaine' },
  { key: 'L', section: 'Navigation', action: 'Afficher la vue Liste' },
  { key: '←', section: 'Navigation', action: 'Jour ou semaine précédent(e)' },
  { key: '→', section: 'Navigation', action: 'Jour ou semaine suivant(e)' },
  { key: 'T', section: 'Navigation', action: "Revenir à aujourd'hui" },
  { key: 'G', section: 'Navigation', action: 'Aller à une date précise' },
  { key: 'R', section: 'Actions', action: 'Rafraîchir le flux ADE Campus' },
  { key: 'F', section: 'Actions', action: 'Activer / quitter le Focus Mode' },
  { key: '⌘K', section: 'Actions', action: 'Ouvrir la palette de commandes' },
  { key: '/', section: 'Actions', action: 'Recherche rapide de cours / salle' },
  { key: '?', section: 'Interface', action: 'Afficher ce tableau de raccourcis' },
  { key: 'Esc', section: 'Interface', action: 'Fermer les modales ouvertes' },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-label="Raccourcis clavier"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-xl border shadow-tactile-dark overflow-hidden rounded-xs"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border-2)',
            borderTop: '4px solid var(--accent)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border-2)', background: 'var(--surface-2)' }}
          >
            <div className="flex items-center gap-2.5">
              <Command className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
              <h2 className="text-base sm:text-lg font-black" style={{ color: 'var(--text)' }}>
                Raccourcis Clavier
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xs transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Table des raccourcis */}
          <div className="divide-y divide-[var(--border)] max-h-[70vh] overflow-y-auto">
            {SHORTCUTS.map(sc => (
              <div
                key={sc.key}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-[var(--surface-2)] transition-colors"
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {sc.action}
                </span>
                <kbd
                  className="px-2.5 py-1 text-xs sm:text-sm font-mono font-bold rounded-xs border shadow-tactile-xs"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-2)',
                    color: 'var(--text)',
                  }}
                >
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 border-t text-xs font-mono flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            <span>Navigation rapide sans souris</span>
            <span>Appuyez sur Esc pour quitter</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
