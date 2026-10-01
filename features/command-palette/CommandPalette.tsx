'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
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
  Download,
  Settings,
  Zap,
  ChevronRight,
  Clock,
} from 'lucide-react';
import type { ScheduleEvent } from '@/types/schedule';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Types ───────────────────────────────────────────────── */

interface CommandItem {
  id: string;
  type: 'command' | 'course' | 'room' | 'teacher';
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
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
  onRefresh: () => void;
  onGoToToday: () => void;
  onSearchChange: (q: string) => void;
}

/* ── Keyboard hook for Cmd+K ─────────────────────────────── */

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}

/* ── CommandPalette Component ────────────────────────────── */

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
  onRefresh,
  onGoToToday,
  onSearchChange,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setQuery('');
        setActiveIndex(0);
      }, 0);
    }
  }, [isOpen]);

  const { containerRef, handleKeyDown: trapKeyDown } = useFocusTrap<HTMLDivElement>({
    active: isOpen,
    onClose,
    returnFocus: true,
  });

  /* ── Static command list ────────────────────────────────── */
  const staticCommands: CommandItem[] = useMemo(
    () => [
      {
        id: 'view-day',
        type: 'command',
        label: 'Vue Jour',
        description: 'Voir les cours du jour sélectionné',
        icon: <Calendar size={14} />,
        shortcut: 'J',
        onSelect: () => { onViewChange('day'); onClose(); },
      },
      {
        id: 'view-week',
        type: 'command',
        label: 'Vue Semaine',
        description: 'Voir la grille de la semaine',
        icon: <CalendarDays size={14} />,
        shortcut: 'S',
        onSelect: () => { onViewChange('week'); onClose(); },
      },
      {
        id: 'view-list',
        type: 'command',
        label: 'Vue Liste',
        description: 'Liste complète du semestre',
        icon: <List size={14} />,
        shortcut: 'L',
        onSelect: () => { onViewChange('list'); onClose(); },
      },
      {
        id: 'today',
        type: 'command',
        label: "Aller à aujourd'hui",
        description: "Revenir à la date d'aujourd'hui",
        icon: <Clock size={14} />,
        shortcut: 'T',
        onSelect: () => { onGoToToday(); onClose(); },
      },
      {
        id: 'exams',
        type: 'command',
        label: 'Radar des examens',
        description: 'Voir les contrôles et partiels à venir',
        icon: <Zap size={14} />,
        shortcut: '>examen',
        onSelect: () => { onOpenExamRadar(); onClose(); },
      },
      {
        id: 'homework',
        type: 'command',
        label: 'Devoirs & Rappels',
        description: 'Gérer les devoirs et tâches',
        icon: <BookOpen size={14} />,
        shortcut: '>devoir',
        onSelect: () => { onOpenHomework(); onClose(); },
      },
      {
        id: 'analytics',
        type: 'command',
        label: 'Statistiques',
        description: 'Volume horaire et analyses',
        icon: <BarChart2 size={14} />,
        onSelect: () => { onOpenAnalytics(); onClose(); },
      },
      {
        id: 'sources',
        type: 'command',
        label: 'Gérer les sources ADE',
        description: 'Ajouter ou changer le flux iCal',
        icon: <Settings size={14} />,
        onSelect: () => { onOpenSources(); onClose(); },
      },
      {
        id: 'refresh',
        type: 'command',
        label: 'Actualiser le planning',
        description: 'Recharger le flux ADE maintenant',
        icon: <RotateCcw size={14} />,
        shortcut: 'R',
        onSelect: () => { onRefresh(); onClose(); },
      },
      {
        id: 'theme',
        type: 'command',
        label: isDark ? 'Passer en mode clair' : 'Passer en mode sombre',
        description: 'Basculer le thème de l\'interface',
        icon: isDark ? <Sun size={14} /> : <Moon size={14} />,
        shortcut: '>thème',
        onSelect: () => { onToggleDark(); onClose(); },
      },
    ],
    [isDark, onClose, onGoToToday, onOpenAnalytics, onOpenExamRadar, onOpenHomework, onOpenSources, onRefresh, onToggleDark, onViewChange]
  );

  /* ── Dynamic search results from events ─────────────────── */
  const searchResults = useMemo((): CommandItem[] => {
    const q = query.trim().toLowerCase();

    // > commands: show static list matching after '>'
    if (q.startsWith('>')) {
      const cmd = q.slice(1).trim();
      return staticCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(cmd) ||
          (c.description ?? '').toLowerCase().includes(cmd) ||
          (c.shortcut?.replace('>', '').toLowerCase() ?? '').includes(cmd)
      );
    }

    if (q.length < 2) return staticCommands;

    const courseResults: CommandItem[] = [];
    const rooms = new Set<string>();
    const teachers = new Set<string>();

    events.forEach((e) => {
      const titleMatch   = e.cleanTitle.toLowerCase().includes(q);
      const roomMatch    = e.room?.toLowerCase().includes(q);
      const teacherMatch = e.teacher.toLowerCase().includes(q);

      if (titleMatch) {
        courseResults.push({
          id: `course-${e.id}`,
          type: 'course',
          label: e.cleanTitle,
          description: `${format(new Date(e.dtstart), 'EEE d MMM', { locale: fr })} · ${format(new Date(e.dtstart), 'HH:mm')} — ${e.room ?? ''}`,
          icon: <Calendar size={14} />,
          onSelect: () => {
            onSearchChange(e.cleanTitle);
            onClose();
          },
        });
      }
      if (roomMatch && e.room && !rooms.has(e.room)) {
        rooms.add(e.room);
        courseResults.push({
          id: `room-${e.room}`,
          type: 'room',
          label: e.room,
          description: 'Salle — filtrer par cette salle',
          icon: <ChevronRight size={14} />,
          onSelect: () => {
            onSearchChange(e.room!);
            onClose();
          },
        });
      }
      if (teacherMatch && e.teacher && !teachers.has(e.teacher)) {
        teachers.add(e.teacher);
        courseResults.push({
          id: `teacher-${e.teacher}`,
          type: 'teacher',
          label: e.teacher,
          description: 'Enseignant — filtrer par ce professeur',
          icon: <ChevronRight size={14} />,
          onSelect: () => {
            onSearchChange(e.teacher);
            onClose();
          },
        });
      }
    });

    return courseResults.slice(0, 12);
  }, [query, staticCommands, events, onSearchChange, onClose]);

  /* ── Keyboard navigation ─────────────────────────────────── */
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      searchResults[activeIndex]?.onSelect();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="palette-backdrop no-print"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Palette de commandes"
            className="w-full max-w-2xl mx-4"
            initial={{ y: -8, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              boxShadow: 'var(--el-dark)',
              borderRadius: 'var(--r-1)',
              overflow: 'hidden',
            }}
          >
            {/* Input row */}
            <div
              className="flex items-center gap-3.5 px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <Search size={20} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher un cours, une salle, un prof… ou taper > pour les commandes"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                className="flex-1 bg-transparent font-sans text-base outline-none placeholder:opacity-50"
                style={{
                  color: 'var(--text)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  border: 'none',
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <kbd
                className="hidden sm:inline-flex font-mono text-xs px-2 py-0.5 border font-bold"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border-2)',
                  color: 'var(--muted)',
                  boxShadow: '1px 1px 0 var(--border-2)',
                  borderRadius: '2px',
                }}
              >
                Esc
              </kbd>
            </div>

            {/* Results list */}
            <ul
              ref={listRef}
              role="listbox"
              className="overflow-y-auto py-1.5"
              style={{ maxHeight: '460px' }}
            >
              {searchResults.length === 0 ? (
                <li
                  className="px-5 py-10 text-center text-sm sm:text-base font-sans font-medium"
                  style={{ color: 'var(--muted)' }}
                >
                  Aucun résultat pour « {query} »
                </li>
              ) : (
                searchResults.map((item, i) => (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={i === activeIndex}
                    onClick={item.onSelect}
                    onMouseEnter={() => setActiveIndex(i)}
                    className="flex items-center gap-3.5 px-5 py-3 cursor-pointer transition-colors"
                    style={{
                      background: i === activeIndex ? 'var(--surface-2)' : 'transparent',
                      color: 'var(--text)',
                    }}
                  >
                    <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-sans text-sm sm:text-base font-bold truncate">
                        {item.label}
                      </span>
                      {item.description && (
                        <span
                          className="block font-mono text-xs truncate mt-0.5"
                          style={{ color: 'var(--muted)' }}
                        >
                          {item.description}
                        </span>
                      )}
                    </span>
                    {item.shortcut && (
                      <kbd
                        className="font-mono text-xs px-2 py-0.5 border shrink-0 font-bold"
                        style={{
                          background: 'var(--surface-3)',
                          borderColor: 'var(--border-2)',
                          color: 'var(--muted)',
                          boxShadow: '1px 1px 0 var(--border-2)',
                          borderRadius: '2px',
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </li>
                ))
              )}
            </ul>

            {/* Footer hint */}
            <div
              className="flex items-center gap-3 px-4 py-2 border-t font-mono text-[10px]"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-2)' }}
            >
              <span>↑↓ naviguer</span>
              <span>↵ sélectionner</span>
              <span>esc fermer</span>
              <span className="ml-auto">Tapez <b style={{ color: 'var(--muted)' }}>&gt;</b> pour les commandes</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
