'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, HelpCircle, ChevronRight, CheckCircle2, ExternalLink } from 'lucide-react';

interface UrlModalInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, name?: string) => void;
  isLoading?: boolean;
  initialUrl?: string;
  initialName?: string;
}

const PRESET_DEMOS = [
  {
    name: 'L1 MATHS TD2 — Univ. Artois (direct)',
    url:  'https://ade-consult.univ-artois.fr/jsp/custom/modules/plannings/5YGpM4nJ.shu',
    desc: 'Calculus 1, Algorithmique, MOMI…',
    badge: '.shu direct',
  },
  {
    name: 'L1 Mathématiques (démo)',
    url:  'demo://sample-math',
    desc: 'Analyse 1, Algèbre, Arithmétique, Python, Physique',
    badge: 'Démo',
  },
  {
    name: 'Licence 3 Informatique',
    url:  'demo://sample-l3',
    desc: 'Algo, Web, IA, Systèmes, Projets',
    badge: 'Démo',
  },
  {
    name: 'Master MIAGE',
    url:  'demo://sample-miage',
    desc: 'Architecture distribuée, Microservices, Data',
    badge: 'Démo',
  },
  {
    name: 'BUT Informatique S4',
    url:  'demo://sample-but',
    desc: 'Dev avancé, BDD, Réseaux',
    badge: 'Démo',
  },
];

export function UrlModalInput({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialUrl  = '',
  initialName = '',
}: UrlModalInputProps) {
  const [url, setUrl]           = useState(initialUrl);
  const [name, setName]         = useState(initialName);
  const [showHelp, setShowHelp] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const touchStartY = React.useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (deltaY > 70) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isDirectAdeLink = url.includes('direct/index.jsp') || url.includes('data=');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setInputError('Renseignez un lien ADE ou choisissez une démo.'); return; }
    setInputError(null);
    onSubmit(trimmed, name.trim() || undefined);
    onClose();
  };

  const handleSelectPreset = (presetUrl: string, presetName: string) => {
    setUrl(presetUrl);
    setName(presetName);
    onSubmit(presetUrl, presetName);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Importer un emploi du temps"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden z-10 shadow-tactile-dark"
          style={{
            background: 'var(--surface)',
            borderTop: `4px solid var(--accent)`,
          }}
        >
          {/* Poignée tactile mobile */}
          <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-[var(--surface-2)]">
            <div className="w-12 h-1.5 rounded-full bg-[var(--border-2)]" />
          </div>

          {/* En-tête */}
          <div
            className="flex items-start justify-between px-6 sm:px-8 py-5 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Link2 className="w-4.5 h-4.5" style={{ color: 'var(--accent)' }} strokeWidth={2.2} />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--accent)' }}>
                  Connexion ADE Campus
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text)' }}>
                Importer un emploi du temps
              </h2>
              <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--muted)' }}>
                Collez votre lien iCal ou ADE direct.
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-tactile shrink-0 p-2 rounded-xs border border-[var(--border)] transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface-2)] min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Formulaire + démonstrations */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-5 space-y-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <label
                  htmlFor="ade-url"
                  className="block text-xs sm:text-sm font-bold mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  Lien ADE ou flux .ics <span style={{ color: 'var(--exam-bar)' }}>*</span>
                </label>
                <input
                  id="ade-url"
                  type="text"
                  value={url}
                  onChange={e => { setUrl(e.target.value); if (inputError) setInputError(null); }}
                  placeholder="https://ade-consult.univ-artois.fr/jsp/custom/…"
                  className="w-full px-4 py-3 text-sm sm:text-base border focus:outline-none transition-colors rounded-xs font-mono"
                  style={{
                    background: 'var(--surface-2)',
                    borderColor: inputError ? 'var(--exam-bar)' : 'var(--border)',
                    color: 'var(--text)',
                  }}
                  aria-describedby={inputError ? 'url-error' : undefined}
                />
                {inputError && (
                  <p id="url-error" className="text-xs sm:text-sm mt-1.5 font-bold" style={{ color: 'var(--exam-bar)' }}>
                    {inputError}
                  </p>
                )}
              </div>

              {/* Lien ADE direct détecté */}
              {isDirectAdeLink && (
                <div
                  className="px-4 py-3.5 border-l-4 text-xs sm:text-sm space-y-2 rounded-xs"
                  style={{
                    background: 'var(--cm-bg)',
                    borderLeftColor: 'var(--cm-bar)',
                    color: 'var(--cm-text)',
                  }}
                >
                  <p className="font-extrabold">Lien ADE direct détecté</p>
                  <p>Ce lien ouvre l&apos;interface web ADE. Pour un flux automatique :</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Ouvrez le lien dans votre navigateur.</li>
                    <li>Cliquez sur l&apos;icône <strong>Exporter l&apos;agenda</strong>.</li>
                    <li>Copiez l&apos;URL iCalendar générée (contient <code className="font-mono">anonymous_cal.jsp</code> ou <code>.ics</code>).</li>
                  </ol>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold underline cursor-pointer"
                  >
                    Ouvrir mon ADE
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div>
                <label
                  htmlFor="ade-name"
                  className="block text-xs sm:text-sm font-bold mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  Nom du planning <span style={{ color: 'var(--muted)' }}>(optionnel)</span>
                </label>
                <input
                  id="ade-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="L1 Math, Groupe A, Licence Info…"
                  className="w-full px-4 py-3 text-sm sm:text-base border focus:outline-none transition-colors rounded-xs font-sans"
                  style={{
                    background: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-tactile w-full py-3.5 px-4 text-sm sm:text-base font-extrabold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 rounded-xs min-h-[46px]"
                style={{
                  background: 'var(--text)',
                  color: 'var(--bg)',
                }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 spinner"
                      style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                    />
                    Synchronisation…
                  </>
                ) : (
                  <>
                    Charger l&apos;emploi du temps
                    <ChevronRight className="w-4.5 h-4.5" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            {/* Démonstrations */}
            <div className="px-6 sm:px-8 py-5 space-y-2">
              <p className="text-[11px] font-700 uppercase tracking-wide mb-3" style={{ fontWeight: 700, color: 'var(--muted)' }}>
                Plannings de démonstration
              </p>
              <div className="divide-y divide-[var(--border)]">
                {PRESET_DEMOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url, preset.name)}
                    className="w-full flex items-center justify-between gap-3 py-3 text-left transition-colors cursor-pointer group"
                    style={{ color: 'var(--text)' }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-600 truncate" style={{ fontWeight: 600 }}>
                          {preset.name}
                        </span>
                        <span
                          className="shrink-0 text-[10px] font-600 px-1.5 py-0.5 rounded-sm"
                          style={{
                            fontWeight: 600,
                            background: 'var(--surface-2)',
                            color: 'var(--muted)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>{preset.desc}</p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: 'var(--muted-2)' }}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Aide */}
            <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center justify-between py-3 text-xs transition-colors cursor-pointer"
                style={{ color: 'var(--muted)' }}
                aria-expanded={showHelp}
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Comment trouver mon lien iCal dans ADE ?
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{showHelp ? '−' : '+'}</span>
              </button>

              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 py-3 border-l-4 text-xs space-y-2"
                    style={{
                      background: 'var(--surface-2)',
                      borderLeftColor: 'var(--accent)',
                      color: 'var(--text-2)',
                    }}
                  >
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>Rendez-vous sur ADE Campus (via votre ENT ou lien direct).</li>
                      <li>Dans la barre d&apos;outils, cliquez sur l&apos;icône <strong>Agenda / Exporter</strong>.</li>
                      <li>Sélectionnez la période, puis cliquez sur <strong>Générer l&apos;URL</strong>.</li>
                      <li>Copiez le lien (contient <code className="font-mono">anonymous_cal.jsp</code> ou finit par <code>.ics</code>).</li>
                    </ol>
                    <div className="flex items-start gap-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--tp-bar)' }} strokeWidth={2} />
                      <p>Le lien est sauvegardé localement. Votre EDT se met à jour automatiquement.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
