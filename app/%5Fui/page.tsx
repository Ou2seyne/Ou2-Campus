'use client';

import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import {
  Sun,
  Moon,
  Monitor,
  ArrowLeft,
  Calendar,
  Search,
  Bell,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';

// UI Kit components
import {
  Button,
  IconButton,
  Badge,
  Stamp,
  Kbd,
  Segmented,
  Tabs,
  Input,
  Switch,
  Checkbox,
  Dialog,
  BottomSheet,
  Toast,
  Tooltip,
  Skeleton,
  EmptyState,
  ErrorState,
  Spinner,
} from '@/components/ui';

export default function UiDemoPage() {
  const { mode, isDark, setThemeMode } = useTheme();

  // Component state playgrounds
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'day' | 'week' | 'list'>('day');
  const [activeTab, setActiveTab] = useState<'all' | 'cm' | 'td' | 'tp'>('all');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1500);
  };

  return (
    <div className="min-h-screen pb-24 font-sans" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Toast HUD */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-slideUp">
          <Toast message={toastMessage} />
        </div>
      )}

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
                UI KIT & SYSTEM
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-12">

        {/* Section 0 : Édition & Double Filet Signature */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="edition-tag">
              ÉDITION DU CATALOGUE DES COMPOSANTS · GAZETTE STRUCTURÉE V3.0
            </span>
            <span className="font-mono text-xs text-[var(--muted)]">
              THÈME ACTIF : <strong className="text-[var(--text)] uppercase">{mode} ({isDark ? 'Dark' : 'Light'})</strong>
            </span>
          </div>

          <div className="filet-double" />

          <p className="text-sm text-[var(--text-2)] max-w-3xl leading-relaxed">
            Ce catalogue regroupe l&apos;intégralité des 17 composants de l&apos;UI Kit d&apos;Aura Campus V3,
            avec leurs états (default, hover, active, focus-visible, disabled, loading, error).
            Chaque composant respecte les critères WCAG 2.2 AA (AAA sur horaires/salles) et la cible tactile minimale de 44px.
          </p>
        </section>

        {/* Section 1 : Boutons & IconButtons */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">1. Button & IconButton (.btn-tactile)</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Ombre dure, enfoncement mécanique 1.5px</span>
          </div>

          <div className="p-5 border rounded-xs shadow-tactile-sm space-y-6" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
            {/* Variants */}
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Variantes de Boutons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default" onClick={() => triggerToast('Bouton Défaut')}>Défaut (Surface)</Button>
                <Button variant="primary" onClick={() => triggerToast('Bouton Primaire')}>Primaire (Accent)</Button>
                <Button variant="secondary" onClick={() => triggerToast('Bouton Secondaire')}>Secondaire (Surface-2)</Button>
                <Button variant="accent" onClick={() => triggerToast('Bouton Teinté')}>Accent Teinté</Button>
                <Button variant="danger" onClick={() => triggerToast('Bouton Danger')}>Danger (Exam)</Button>
                <Button variant="ghost" onClick={() => triggerToast('Bouton Fantôme')}>Fantôme</Button>
              </div>
            </div>

            {/* Sizes & States */}
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Tailles & États (Loading, Disabled, Erreur)</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Taille XS</Button>
                <Button size="sm">Taille SM (Default)</Button>
                <Button size="md">Taille MD (Tactile)</Button>
                <Button size="lg">Taille LG</Button>
                <Button isLoading size="sm">Chargement…</Button>
                <Button disabled size="sm">Désactivé</Button>
                <Button isError size="sm">État Erreur</Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">IconButton (Cible tactile ≥ 44px)</h3>
              <div className="flex flex-wrap items-center gap-3">
                <IconButton label="Calendrier" variant="default" size="md">
                  <Calendar size={16} />
                </IconButton>
                <IconButton label="Recherche" variant="primary" size="md">
                  <Search size={16} />
                </IconButton>
                <IconButton label="Notifications" variant="secondary" size="md">
                  <Bell size={16} />
                </IconButton>
                <IconButton label="Actualiser" variant="default" size="md" isLoading>
                  <RefreshCw size={16} />
                </IconButton>
                <IconButton label="Désactivé" variant="default" size="md" disabled>
                  <FolderOpen size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 : Badges & Tampons Éditoriaux */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">2. Badges & Tampons (.stamp-badge, .stamp-exam)</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Rotation fixe -1°, Geist Mono caps</span>
          </div>

          <div className="p-5 border rounded-xs shadow-tactile-sm space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="cm">CM · AMPHI</Badge>
              <Badge variant="td">TD · SALLE</Badge>
              <Badge variant="tp">TP · LABO</Badge>
              <Badge variant="exam">EXAM · DS</Badge>
              <Badge variant="projet">PROJET</Badge>
              <Badge variant="autre">AUTRE</Badge>
              <Badge variant="live" dot>EN COURS</Badge>
            </div>

            <div className="pt-2 border-t flex flex-wrap items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <Stamp variant="exam">CONTROLE CONTINU · COEF 2</Stamp>
              <Stamp variant="live">DIRECT RADIO CAMPUS</Stamp>
              <Stamp variant="accent">SEMAINE 40</Stamp>
              <Stamp variant="neutral">GROUPE TP 2-2</Stamp>
            </div>
          </div>
        </section>

        {/* Section 3 : Formulaires (Input, Switch, Checkbox) */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">3. Formulaires Tactiles (Input, Switch, Checkbox)</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Animations, haptique, focus ring 2px</span>
          </div>

          <div className="p-5 border rounded-xs shadow-tactile-sm grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
            <div className="space-y-4">
              <Input
                label="Recherche textuelle (avec effacement)"
                isSearch
                placeholder="Chercher un cours, enseignant, salle…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onClear={() => setInputValue('')}
              />

              <Input
                label="Champ avec état d'erreur validé"
                placeholder="Entrez une URL ADE…"
                value="http://invalid-url"
                error={inputError || "L'URL fournie ne pointe pas vers un serveur ADE universitaire autorisé."}
                onChange={(e) => setInputError(e.target.value ? '' : 'Champ requis')}
              />

              <Input
                label="Champ désactivé"
                placeholder="Non modifiable…"
                value="Mode lecture seule"
                disabled
              />
            </div>

            <div className="space-y-5 pt-1">
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Interrupteurs Switch (WAI-ARIA role=&quot;switch&quot;)</h4>
                <div className="space-y-2">
                  <Switch
                    checked={switchChecked}
                    onChange={setSwitchChecked}
                    label="Mode Focus automatique pendant les cours"
                  />
                  <Switch
                    checked={false}
                    onChange={() => {}}
                    label="Option désactivée"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                <h4 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Cases à cocher Checkbox (Animation SVG)</h4>
                <div className="space-y-2">
                  <Checkbox
                    checked={checkboxChecked}
                    onChange={setCheckboxChecked}
                    label="Réviser les exercices de Mathématiques Discrètes pour jeudi"
                  />
                  <Checkbox
                    checked={true}
                    onChange={() => {}}
                    label="Tâche d'archivage accomplie (Désactivée)"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 : Navigation (Segmented, Tabs, Kbd, Tooltip) */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">4. Navigation & Sélecteurs (Segmented & Tabs)</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Glider Framer Motion layoutId, clavier ↑↓←→</span>
          </div>

          <div className="p-5 border rounded-xs shadow-tactile-sm space-y-6" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Segmented avec Glider</h3>
              <Segmented<'day' | 'week' | 'list'>
                value={activeSegment}
                onChange={setActiveSegment}
                options={[
                  { value: 'day', label: 'Jour', shortcut: 'J' },
                  { value: 'week', label: 'Semaine', shortcut: 'S' },
                  { value: 'list', label: 'Liste', shortcut: 'L' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Tabs WAI-ARIA avec Roving Focus</h3>
              <Tabs<'all' | 'cm' | 'td' | 'tp'>
                activeId={activeTab}
                onChange={setActiveTab}
                tabs={[
                  { id: 'all', label: 'Tous les cours', badge: 14 },
                  { id: 'cm', label: 'Amphi (CM)', badge: 4 },
                  { id: 'td', label: 'Travaux Dirigés', badge: 6 },
                  { id: 'tp', label: 'Machines (TP)', badge: 4 },
                ]}
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Touches Kbd & Tooltips Tactiles</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Tooltip content="Basculer vers la vue Jour">
                  <span className="flex items-center gap-1 text-xs font-mono">
                    Vue Jour <Kbd>J</Kbd>
                  </span>
                </Tooltip>
                <Tooltip content="Ouvrir la palette de commandes">
                  <span className="flex items-center gap-1 text-xs font-mono">
                    Palette <Kbd>⌘K</Kbd>
                  </span>
                </Tooltip>
                <Tooltip content="Revenir à la date du jour">
                  <span className="flex items-center gap-1 text-xs font-mono">
                    Aujourd&apos;hui <Kbd>T</Kbd>
                  </span>
                </Tooltip>
                <Tooltip content="Activer ou quitter le mode Focus">
                  <span className="flex items-center gap-1 text-xs font-mono">
                    Focus Mode <Kbd>F</Kbd>
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 : Modales, Dialog & BottomSheet */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">5. Boîtes de Dialogue (Dialog Desktop & BottomSheet Mobile)</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Focus trap, Escape, scroll lock, swipe-down &gt; 70px</span>
          </div>

          <div className="p-5 border rounded-xs shadow-tactile-sm flex flex-wrap items-center gap-4" style={{ background: 'var(--surface)', borderColor: 'var(--border-2)' }}>
            <Button variant="default" onClick={() => setIsDialogOpen(true)} leftIcon={<Sparkles size={14} />}>
              Ouvrir Dialog Centré (Desktop / Universel)
            </Button>

            <Button variant="secondary" onClick={() => setIsBottomSheetOpen(true)} leftIcon={<FolderOpen size={14} />}>
              Ouvrir Feuille Tiroir (BottomSheet Mobile)
            </Button>
          </div>

          {/* Dialog Demo */}
          <Dialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            title="Détail du Cours — Algorithmique"
            accentColor="var(--cm-bar)"
          >
            <div className="p-5 space-y-4 text-xs sm:text-sm font-sans">
              <p className="text-[var(--text)] font-600">
                Séance magistrale d&apos;algorithmique avancée dispensée au Grand Amphi de la Faculté des Sciences.
              </p>
              <div className="p-3 border rounded-xs bg-[var(--surface-2)] space-y-1 font-mono text-xs">
                <p><strong>Bâtiment :</strong> Sciences · Rez-de-chaussée</p>
                <p><strong>Horaire :</strong> 08:30 – 10:00 (1h30)</p>
                <p><strong>Enseignant :</strong> Prof. Dupont</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="default" onClick={() => setIsDialogOpen(false)}>Fermer</Button>
                <Button variant="primary" onClick={() => { setIsDialogOpen(false); triggerToast('Export Google Agenda simulé'); }}>Exporter</Button>
              </div>
            </div>
          </Dialog>

          {/* BottomSheet Demo */}
          <BottomSheet
            isOpen={isBottomSheetOpen}
            onClose={() => setIsBottomSheetOpen(false)}
            title="Feuille d'Actions Rapides Mobile"
          >
            <div className="space-y-4 text-xs sm:text-sm font-sans">
              <p className="text-[var(--text-2)]">
                Cette feuille tiroir se referme au tapotement extérieur ou par balayage vertical (swipe-down &gt; 70px).
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <Button variant="secondary" onClick={() => { setIsBottomSheetOpen(false); triggerToast('Source sélectionnée'); }}>Groupe 2-2</Button>
                <Button variant="secondary" onClick={() => { setIsBottomSheetOpen(false); triggerToast('Radar ouvert'); }}>Radar Examens</Button>
              </div>
            </div>
          </BottomSheet>
        </section>

        {/* Section 6 : États d'attente, Skeletons, Vides & Erreurs */}
        <section className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-800 tracking-tight uppercase">6. États Vides, Erreurs, Skeletons & Spinners</h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">Ton éditorial concis, dimensions exactes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Skeleton de Cours (Dimensions Réelles)</h3>
              <Skeleton variant="course" />
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-mono text-[var(--muted)]">Spinners industriels :</span>
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono text-xs font-700 text-[var(--muted)] uppercase">Composants d&apos;Erreur & d&apos;Absence</h3>
              <ErrorState
                title="Synchronisation Interrompue"
                message="Le serveur ADE de l'Université d'Artois n'a pas répondu dans le délai imparti (12s)."
                onRetry={() => triggerToast('Nouvelle tentative de synchronisation lancée…')}
              />
              <EmptyState
                title="Aucune séance programmée"
                description="Le planning de ce jour ne comporte aucun enseignement. Profitez de votre journée d'étude personnelle."
                actionLabel="Ajouter un devoir personnel"
                onAction={() => triggerToast('Ajout de devoir')}
              />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
