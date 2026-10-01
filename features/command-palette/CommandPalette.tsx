'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  List,
  CalendarDays,
  BookOpen,
  BarChart2,
  Moon,
  Sun,
  RotateCcw,
  Settings,
  Zap,
  Clock,
  Focus,
  History,
  Users,
  MapPin,
  GraduationCap,
  Sparkles,
  ArrowRightLeft,
  Printer,
} from 'lucide-react';
import type { ScheduleEvent } from '@/types/schedule';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HighlightText } from '@/lib/highlight';
import { Kbd } from '@/components/ui/Kbd';
import { triggerHaptic } from '@/lib/haptics';

/* ── Types ───────────────────────────────────────────────── */

export interface CommandItem {
  id: string;
  type: 'action' | 'course' | 'room' | 'teacher' | 'group' | 'history';
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  events: ScheduleEvent[];
  isDark: boolean;
  onToggleDark: () => void;
  onViewChange: (v: 'day' | 'week' | 'list') => void;
  onOpenExamRadar: () => void;
  onOpenHomework: () => void;
  onOpenAnalytics: () => void;
  onOpenSources: () => void;
  onOpenRevisionPlanner?: () => void;
  onOpenComparator?: () => void;
  onRefresh: () => void;
  onGoToToday: () => void;
  onSearchChange: (q: string) => void;
  onSelectSubGroup?: (g: string) => void;
  onToggleFocusMode?: () => void;
  isFocusMode?: boolean;
}

/* ── Keyboard Hook for Cmd+K (works anywhere including inputs) ─── */

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K triggers palette regardless of active element
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}

/* ── CommandPalette Component ────────────────────────────── */

const HISTORY_STORAGE_KEY = 'aura_palette_history';

export function CommandPalette({
  isOpen,
  onClose,
  events,
  isDark,
  onToggleDark,
  onViewChange,
  onOpenExamRadar,
  onOpenHomework,
  onOpenAnalytics,
  onOpenSources,
  onOpenRevisionPlanner,
  onOpenComparator,
  onRefresh,
  onGoToToday,
  onSearchChange,
  onSelectSubGroup,
  onToggleFocusMode,
  isFocusMode = false,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentHistory, setRecentHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored).slice(0, 5) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const saveToHistory = React.useCallback((item: string) => {
    setRecentHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h !== item)].slice(0, 5);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Focus input and reset on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setQuery('');
        setActiveIndex(0);
      }, 10);
    }
  }, [isOpen]);

  /* ── 1. Static Action Commands ───────────────────────────── */
  const actionCommands: CommandItem[] = useMemo(
    () => [
      {
        id: 'cmd-view-day',
        type: 'action',
        label: 'Vue Jour',
        description: 'Afficher la chronologie des cours du jour',
        icon: <Calendar size={14} className="text-[var(--accent)]" />,
        shortcut: 'J',
        onSelect: () => { onViewChange('day'); onClose(); },
      },
      {
        id: 'cmd-view-week',
        type: 'action',
        label: 'Vue Semaine',
        description: 'Grille horaire hebdomadaire 8h–20h',
        icon: <CalendarDays size={14} className="text-[var(--accent)]" />,
        shortcut: 'S',
        onSelect: () => { onViewChange('week'); onClose(); },
      },
      {
        id: 'cmd-view-list',
        type: 'action',
        label: 'Vue Liste',
        description: 'Parcourir la liste complète du semestre',
        icon: <List size={14} className="text-[var(--accent)]" />,
        shortcut: 'L',
        onSelect: () => { onViewChange('list'); onClose(); },
      },
      {
        id: 'cmd-today',
        type: 'action',
        label: "Aujourd'hui",
        description: "Revenir immédiatement à la date d'aujourd'hui",
        icon: <Clock size={14} className="text-emerald-500" />,
        shortcut: 'T',
        onSelect: () => { onGoToToday(); onClose(); },
      },
      {
        id: 'cmd-exams',
        type: 'action',
        label: 'Radar des Examens',
        description: 'Contrôles continus, partiels et comptes à rebours',
        icon: <Zap size={14} className="text-red-500" />,
        shortcut: '>examen',
        onSelect: () => { onOpenExamRadar(); onClose(); },
      },
      {
        id: 'cmd-homework',
        type: 'action',
        label: 'Devoirs & Tâches',
        description: 'Gestionnaire de devoirs contextuel par matière',
        icon: <BookOpen size={14} className="text-purple-500" />,
        shortcut: '>devoir',
        onSelect: () => { onOpenHomework(); onClose(); },
      },
      {
        id: 'cmd-analytics',
        type: 'action',
        label: 'Statistiques & Volumes Horaires',
        description: 'Répartition CM/TD/TP et analyse de charge',
        icon: <BarChart2 size={14} className="text-amber-500" />,
        shortcut: '>stats',
        onSelect: () => { onOpenAnalytics(); onClose(); },
      },
      {
        id: 'cmd-refresh',
        type: 'action',
        label: 'Actualiser le planning',
        description: 'Forcer la resynchronisation du flux ADE',
        icon: <RotateCcw size={14} className="text-[var(--muted)]" />,
        shortcut: 'R',
        onSelect: () => { onRefresh(); onClose(); },
      },
      {
        id: 'cmd-focus',
        type: 'action',
        label: isFocusMode ? 'Quitter le Focus Mode' : 'Activer le Focus Mode Amphi',
        description: 'Interface épurée plein écran sans distractions',
        icon: <Focus size={14} className="text-[var(--accent)]" />,
        shortcut: 'F',
        onSelect: () => { onToggleFocusMode?.(); onClose(); },
      },
      {
        id: 'cmd-revisions',
        type: 'action',
        label: 'Planifier des Révisions',
        description: 'Détecter les créneaux libres avant un DS et les bloquer',
        icon: <Sparkles size={14} className="text-amber-500" />,
        shortcut: '>revisions',
        onSelect: () => { onOpenRevisionPlanner?.(); onClose(); },
      },
      {
        id: 'cmd-comparator',
        type: 'action',
        label: 'Comparateur de Plannings',
        description: 'Comparer avec un autre groupe et trouver les temps libres communs',
        icon: <ArrowRightLeft size={14} className="text-[var(--accent)]" />,
        shortcut: '>comparer',
        onSelect: () => { onOpenComparator?.(); onClose(); },
      },
      {
        id: 'cmd-print',
        type: 'action',
        label: 'Imprimer la Gazette (A4)',
        description: 'Export haute définition noir et blanc @media print',
        icon: <Printer size={14} className="text-[var(--muted)]" />,
        shortcut: '⌘P',
        onSelect: () => { onClose(); window.print(); },
      },
      {
        id: 'cmd-sources',
        type: 'action',
        label: 'Changer de source ADE / Presets',
        description: 'Gérer les liens iCalendar et plannings favoris',
        icon: <Settings size={14} className="text-[var(--muted)]" />,
        shortcut: '>sources',
        onSelect: () => { onOpenSources(); onClose(); },
      },
      {
        id: 'cmd-theme',
        type: 'action',
        label: isDark ? 'Basculer en Mode Clair' : 'Basculer en Mode Sombre',
        description: 'Changer le thème visuel du cockpit',
        icon: isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />,
        shortcut: '>thème',
        onSelect: () => { onToggleDark(); onClose(); },
      },
    ],
    [isDark, isFocusMode, onClose, onGoToToday, onOpenAnalytics, onOpenComparator, onOpenExamRadar, onOpenHomework, onOpenRevisionPlanner, onOpenSources, onRefresh, onToggleDark, onToggleFocusMode, onViewChange]
  );

  /* ── 2. Filtered Results Engine ─────────────────────────── */
  const results = useMemo((): CommandItem[] => {
    const q = query.trim().toLowerCase();

    // Prefix `>` exclusively displays actions
    if (q.startsWith('>')) {
      const filter = q.slice(1).trim();
      if (!filter) return actionCommands;
      return actionCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(filter) ||
          (c.description ?? '').toLowerCase().includes(filter) ||
          (c.shortcut?.toLowerCase() ?? '').includes(filter)
      );
    }

    // Empty query: show recent history + default actions + groups
    if (!q) {
      const items: CommandItem[] = [];

      // History items
      recentHistory.forEach((hist, i) => {
        items.push({
          id: `hist-${i}`,
          type: 'history',
          label: hist,
          description: 'Recherche récente',
          icon: <History size={14} className="text-[var(--muted)]" />,
          onSelect: () => {
            setQuery(hist);
          },
        });
      });

      // Quick groups if available
      if (onSelectSubGroup) {
        items.push(
          {
            id: 'grp-2-2',
            type: 'group',
            label: 'Groupe TP 2-2 ★',
            description: 'Filtrer sur le sous-groupe principal',
            icon: <Users size={14} className="text-amber-500" />,
            onSelect: () => { onSelectSubGroup('2-2'); onClose(); },
          },
          {
            id: 'grp-2-1',
            type: 'group',
            label: 'Groupe TP 2-1',
            description: 'Filtrer sur le sous-groupe alternatif',
            icon: <Users size={14} className="text-blue-500" />,
            onSelect: () => { onSelectSubGroup('2-1'); onClose(); },
          },
          {
            id: 'grp-all',
            type: 'group',
            label: 'Toute la promotion (Tous)',
            description: 'Afficher tous les sous-groupes sans filtre',
            icon: <Users size={14} className="text-emerald-500" />,
            onSelect: () => { onSelectSubGroup('ALL'); onClose(); },
          }
        );
      }

      // Add actions
      items.push(...actionCommands);
      return items;
    }

    // Dynamic search across courses, rooms, teachers
    const matches: CommandItem[] = [];

    // Check actions first if they match
    actionCommands.forEach((c) => {
      if (
        c.label.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
      ) {
        matches.push(c);
      }
    });

    const seenCourses = new Set<string>();
    const seenRooms = new Set<string>();
    const seenTeachers = new Set<string>();

    events.forEach((e) => {
      const titleLower = e.cleanTitle.toLowerCase();
      const roomLower = (e.room || '').toLowerCase();
      const teacherLower = (e.teacher || '').toLowerCase();

      // Title match
      if (titleLower.includes(q) && !seenCourses.has(e.cleanTitle)) {
        seenCourses.add(e.cleanTitle);
        matches.push({
          id: `course-${e.id}`,
          type: 'course',
          label: e.cleanTitle,
          description: `${format(new Date(e.dtstart), 'EEE d MMM', { locale: fr })} · ${e.category} ${e.room ? `— ${e.room}` : ''}`,
          icon: <Calendar size={14} className="text-[var(--accent)]" />,
          onSelect: () => {
            saveToHistory(e.cleanTitle);
            onSearchChange(e.cleanTitle);
            onClose();
          },
        });
      }

      // Room match
      if (e.room && roomLower.includes(q) && !seenRooms.has(e.room)) {
        seenRooms.add(e.room);
        matches.push({
          id: `room-${e.room}`,
          type: 'room',
          label: `Salle ${e.room}`,
          description: `Filtrer tous les cours dans la salle ${e.room}`,
          icon: <MapPin size={14} className="text-amber-500" />,
          onSelect: () => {
            saveToHistory(e.room!);
            onSearchChange(e.room!);
            onClose();
          },
        });
      }

      // Teacher match
      if (e.teacher && teacherLower.includes(q) && !seenTeachers.has(e.teacher)) {
        seenTeachers.add(e.teacher);
        matches.push({
          id: `teacher-${e.teacher}`,
          type: 'teacher',
          label: e.teacher,
          description: `Filtrer tous les enseignements de ${e.teacher}`,
          icon: <GraduationCap size={14} className="text-emerald-500" />,
          onSelect: () => {
            saveToHistory(e.teacher);
            onSearchChange(e.teacher);
            onClose();
          },
        });
      }
    });

    return matches.slice(0, 30);
  }, [actionCommands, events, onClose, onSearchChange, onSelectSubGroup, query, recentHistory, saveToHistory]);

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[activeIndex] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      triggerHaptic('light');
      setActiveIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      triggerHaptic('light');
      setActiveIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = results[activeIndex];
      if (current) {
        triggerHaptic('tap');
        current.onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 bg-black/60 backdrop-blur-xs no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Palette de commandes"
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl border rounded-xs shadow-tactile-dark overflow-hidden flex flex-col"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-2)',
              borderTop: '3px solid var(--accent)',
              maxHeight: '80vh',
            }}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--surface-2)',
              }}
            >
              <Search size={16} className="text-[var(--muted)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Rechercher un cours, enseignant, salle… (ou tapez > pour les actions)"
                className="w-full font-sans text-xs sm:text-sm bg-transparent outline-none text-[var(--text)] placeholder-[var(--muted)]"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="font-mono text-[10px] uppercase text-[var(--muted)] hover:text-[var(--text)] px-1.5 py-0.5 border rounded-xs"
                  style={{ borderColor: 'var(--border-2)', background: 'var(--surface)' }}
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Results List */}
            <ul
              ref={listRef}
              className="flex-1 overflow-y-auto divide-y divide-[var(--border)] p-1"
              role="listbox"
            >
              {results.length === 0 ? (
                <li className="p-8 text-center font-sans text-xs text-[var(--muted)]">
                  Aucun résultat pour « {query} ». Tapez <Kbd>&gt;</Kbd> pour voir toutes les actions.
                </li>
              ) : (
                results.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <li
                      key={item.id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        triggerHaptic('tap');
                        item.onSelect();
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`btn-tactile px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer rounded-xs transition-colors ${
                        isActive
                          ? 'bg-[var(--accent-dim)] border border-[var(--accent)] text-[var(--text)]'
                          : 'hover:bg-[var(--surface-2)] text-[var(--text-2)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-6 h-6 rounded-xs border flex items-center justify-center shrink-0"
                          style={{
                            background: isActive ? 'var(--surface)' : 'var(--surface-2)',
                            borderColor: 'var(--border-2)',
                          }}
                        >
                          {item.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-sans font-700 text-xs sm:text-sm leading-tight truncate">
                            <HighlightText text={item.label} query={query.replace(/^>/, '')} />
                          </p>
                          {item.description && (
                            <p className="font-mono text-[10px] text-[var(--muted)] truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.shortcut && (
                        <Kbd className="shrink-0">{item.shortcut}</Kbd>
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer / Instructions */}
            <div
              className="px-4 py-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[var(--muted)] shrink-0"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--surface-2)',
              }}
            >
              <div className="flex items-center gap-3">
                <span>Naviguer <Kbd>↑</Kbd> <Kbd>↓</Kbd></span>
                <span>Ouvrir <Kbd>↵</Kbd></span>
                <span>Fermer <Kbd>Esc</Kbd></span>
              </div>
              <span>Préfixe <Kbd>&gt;</Kbd> pour les actions rapides</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
