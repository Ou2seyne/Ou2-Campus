'use client';

import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor, ArrowLeft, Check, Copy } from 'lucide-react';
import Link from 'next/link';

export default function UiDemoPage() {
  const { mode, isDark, setThemeMode } = useTheme();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const categories = [
    { code: 'CM', name: 'Cours Magistral (Amphi)', bar: 'var(--cm-bar)', bg: 'var(--cm-bg)', text: 'var(--cm-text)', cls: 'cat-cm', badgeCls: 'badge-cm' },
    { code: 'TD', name: 'Travaux Dirigés (Salle)', bar: 'var(--td-bar)', bg: 'var(--td-bg)', text: 'var(--td-text)', cls: 'cat-td', badgeCls: 'badge-td' },
    { code: 'TP', name: 'Travaux Pratiques (Labo / Machines)', bar: 'var(--tp-bar)', bg: 'var(--tp-bg)', text: 'var(--tp-text)', cls: 'cat-tp pattern-tp', badgeCls: 'badge-tp' },
    { code: 'EXAM', name: 'Contrôle Continu / DS / Partiel', bar: 'var(--exam-bar)', bg: 'var(--exam-bg)', text: 'var(--exam-text)', cls: 'cat-exam', badgeCls: 'badge-exam' },
    { code: 'PROJET', name: 'Soutenance / Workshop', bar: 'var(--projet-bar)', bg: 'var(--projet-bg)', text: 'var(--projet-text)', cls: 'cat-projet', badgeCls: 'badge-projet' },
    { code: 'AUTRE', name: 'Tutorat / Conférence', bar: 'var(--autre-bar)', bg: 'var(--autre-bg)', text: 'var(--autre-text)', cls: 'cat-autre', badgeCls: 'badge-autre' },
  ];

  const elevations = [
    { name: '--el-1', cls: 'shadow-tactile-xs', desc: '1.5px 1.5px (Micro-éléments, kbd, chips)' },
    { name: '--el-2', cls: 'shadow-tactile-sm', desc: '2px 2px (Boutons tactiles standards, cartes)' },
    { name: '--el-3', cls: 'shadow-tactile', desc: '3px 3px (Modales, briefing hero, fenêtres)' },
    { name: '--el-dark', cls: 'shadow-tactile-dark', desc: '2.5px 2.5px --text (HUD Toasts, badges noirs)' },
    { name: '--el-accent', cls: 'shadow-tactile-accent', desc: '2.5px 2.5px --accent (Sélections fortes)' },
  ];

  return (
    <div className="min-h-screen pb-20 font-sans" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Masthead Header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-700 border rounded-xs"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border-2)', color: 'var(--text)' }}
            >
              <ArrowLeft size={13} />
              <span>COCKPIT</span>
            </Link>
            <div className="h-4 w-px bg-[var(--border-2)]" />
            <h1 className="text-sm font-800 uppercase tracking-tight flex items-center gap-2">
              <span>AURA CAMPUS V3</span>
              <span className="font-mono text-xs px-1.5 py-0.5 rounded-xs border border-[var(--border-2)] bg-[var(--surface-2)] text-[var(--muted)]">
                DESIGN SYSTEM & TOKENS
              </span>
            </h1>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center p-0.5 border rounded-xs shadow-tactile-xs" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-2)' }}>
            <button
              onClick={() => setThemeMode('light')}
              className={`btn-tactile px-2 py-1 text-xs font-mono font-700 flex items-center gap-1 rounded-xs ${mode === 'light' ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border-2)]' : 'text-[var(--muted)]'}`}
              title="Thème Clair"
            >
              <Sun size={12} />
              <span>Clair</span>
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`btn-tactile px-2 py-1 text-xs font-mono font-700 flex items-center gap-1 rounded-xs ${mode === 'dark' ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border-2)]' : 'text-[var(--muted)]'}`}
              title="Thème Sombre"
            >
              <Moon size={12} />
              <span>Sombre</span>
            </button>
            <button
              onClick={() => setThemeMode('auto')}
              className={`btn-tactile px-2 py-1 text-xs font-mono font-700 flex items-center gap-1 rounded-xs ${mode === 'auto' ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border-2)]' : 'text-[var(--muted)]'}`}
              title="Thème Automatique (OS)"
            >
              <Monitor size={12} />
              <span>Auto</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-10">

        {/* Section 1 : Édition & Double Filet Signature */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="edition-tag">
              ÉDITION SPÉCIALE · GAZETTE STRUCTURÉE V3.0 · RÉFÉRENTIEL INTERNE
            </span>
            <span className="font-mono text-xs text-[var(--muted)]">
              MODE : <strong className="text-[var(--text)] uppercase">{mode} ({isDark ? 'Dark' : 'Light'})</strong>
            </span>
          </div>

          <div className="filet-double" />

          <p className="text-sm text-[var(--text-2)] max-w-3xl leading-relaxed">
            La V3 d’Aura Campus conserve l’identité <strong>« Gazette Structurée / Anti-Lisse Industriel »</strong> :
            bordures franches 1px, ombres dures sans flou à 90°, rayons strictement bornés à ≤ 4px,
            encodage CM/TD/TP/EXAM par barre + fond + motif hachuré, et combinaison exclusive
            <strong> Bricolage Grotesque</strong> (titres et labels) + <strong>Geist Mono</strong> (données techniques, horaires et kbd).
          </p>
        </section>

        {/* Section 2 : Surfaces & Contraste Typographique */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">1. Hiérarchie des Surfaces & Textes (WCAG AAA)</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Ratio ≥ 7:1 (AAA) sur textes principaux</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-xs shadow-tactile-sm space-y-2" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-700">--surface</span>
                <span className="text-[10px] font-mono px-1 py-0.5 border rounded-xs" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>Base</span>
              </div>
              <p className="text-sm font-800" style={{ color: 'var(--text)' }}>Texte Primaire (--text)</p>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>Texte Secondaire (--text-2)</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Métadonnées (--muted)</p>
            </div>

            <div className="p-4 border rounded-xs shadow-tactile-sm space-y-2" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-2)' }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-700">--surface-2</span>
                <span className="text-[10px] font-mono px-1 py-0.5 border rounded-xs" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>En-têtes</span>
              </div>
              <p className="text-sm font-800" style={{ color: 'var(--text)' }}>En-tête de tableau</p>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>Zones de contrôle</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Indices kbd et stats</p>
            </div>

            <div className="p-4 border rounded-xs shadow-tactile-sm space-y-2" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-2)' }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-700">--surface-3</span>
                <span className="text-[10px] font-mono px-1 py-0.5 border rounded-xs" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>Survol</span>
              </div>
              <p className="text-sm font-800" style={{ color: 'var(--text)' }}>États survolés</p>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>Séparateurs de blocs</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Arrière-plan inactif</p>
            </div>

            <div className="p-4 border rounded-xs shadow-tactile-sm space-y-2" style={{ background: 'var(--bg)', borderColor: 'var(--border-2)' }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-700">--bg</span>
                <span className="text-[10px] font-mono px-1 py-0.5 border rounded-xs" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>Trame</span>
              </div>
              <p className="text-sm font-800" style={{ color: 'var(--text)' }}>Fond Gazette papier</p>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>Trame de points 24px</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Sans reflet ni flou</p>
            </div>
          </div>
        </section>

        {/* Section 3 : Matrice Catégorielle d'Enseignement */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">2. Matrice Catégorielle d’Enseignement</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Bordure 4px + Fond + Texte contrasté + Motif TP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div
                key={c.code}
                className={`p-4 rounded-xs border border-[var(--border-2)] shadow-tactile-xs space-y-2 ${c.cls}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-xs text-[11px] font-mono font-800 tracking-wider ${c.badgeCls}`}>
                    {c.code}
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--muted)' }}>
                    08:30 – 10:00
                  </span>
                </div>
                <h3 className="font-800 text-sm">{c.name}</h3>
                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span>Salle D004</span>
                  <span>M. Professeur</span>
                </div>
              </div>
            ))}
          </div>

          {/* Focus sur le cours en direct */}
          <div className="p-4 border rounded-xs shadow-tactile-sm relative overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
            <div className="scanline-live" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="stamp-badge stamp-live">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator-pulse inline-block" />
                  <span>EN COURS · LIVE</span>
                </span>
                <span className="text-sm font-800">Séance active avec scanline radar</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Temps restant : 42 min
              </span>
            </div>
          </div>
        </section>

        {/* Section 4 : Tampons & Badges Éditoriaux */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">3. Tampons Éditoriaux (Rotation −1° & Bordure Double)</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Style sceau d’archive officiel</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 p-4 border rounded-xs shadow-tactile-xs" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
            <span className="stamp-badge stamp-exam">
              CONTROLE CONTINU (DS)
            </span>
            <span className="stamp-badge stamp-live">
              SÉANCE EN DIRECT
            </span>
            <span className="stamp-badge stamp-accent">
              SEMAINE 40
            </span>
            <span className="stamp-badge stamp-neutral">
              GROUPE 2-2
            </span>
            <span className="stamp-badge">
              FACULTÉ DE LENS
            </span>
          </div>
        </section>

        {/* Section 5 : Système d'Élévation Tactile & Ombres Dures */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">4. Système d’Élévations & Ombres Dures (Anti-Lisse)</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Zéro flou (blur: 0px), angle 90° physique</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {elevations.map((el) => (
              <div
                key={el.name}
                onClick={() => copyToClipboard(el.name)}
                className={`btn-tactile p-4 border rounded-xs cursor-pointer ${el.cls}`}
                style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}
              >
                <div className="flex items-center justify-between font-mono text-xs font-700 pb-1">
                  <span>{el.name}</span>
                  {copiedToken === el.name ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Check size={12} /> Copié
                    </span>
                  ) : (
                    <Copy size={12} className="text-[var(--muted)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--muted)] font-mono">{el.desc}</p>
                <div className="mt-3 pt-2 border-t border-[var(--border)] text-[11px] font-sans font-bold flex items-center justify-between">
                  <span>Test d’enfoncement</span>
                  <span className="text-[var(--accent)]">Cliquez pour tester →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6 : Échelle Typographique Responsive */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">5. Échelle Typographique & Polices Officielles</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Bricolage Grotesque + Geist Mono (Tabular-nums)</span>
          </div>

          <div className="border rounded-xs divide-y divide-[var(--border)] shadow-tactile-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
            <div className="p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-[var(--muted)] w-36 shrink-0">Display (36px / 800)</span>
              <span className="font-mono font-black text-3xl sm:text-4xl tracking-tight">01:45:20</span>
              <span className="font-mono text-xs text-[var(--muted)]">Compteurs et temps restant</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-[var(--muted)] w-36 shrink-0">H1 (20px / 800)</span>
              <h1 className="text-xl font-800 tracking-tight">Emploi du temps — Licence 1 Maths-Info</h1>
              <span className="font-mono text-xs text-[var(--muted)]">Titre de page & Cockpit</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-[var(--muted)] w-36 shrink-0">H2 (18px / 700)</span>
              <h2 className="text-lg font-700 tracking-tight">Radar des Examens & Évaluations</h2>
              <span className="font-mono text-xs text-[var(--muted)]">En-tête de fenêtres modales</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-[var(--muted)] w-36 shrink-0">Body (14px / 500)</span>
              <p className="text-sm font-500 text-[var(--text-2)]">Séance de Travaux Pratiques dédiée à la programmation fonctionnelle avancée.</p>
              <span className="font-mono text-xs text-[var(--muted)]">Contenu & explications</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-[var(--muted)] w-36 shrink-0">Caption (12px / 700)</span>
              <span className="font-mono text-xs font-700">Bâtiment D · Salle D004 · 1er étage</span>
              <span className="font-mono text-xs text-[var(--muted)]">Salles & enseignants</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
