'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  Calendar,
  Plus,
  BarChart3,
  BookOpen,
  AlertTriangle,
  HelpCircle,
  Smartphone,
  Moon,
  Sun,
  Search,
  ChevronDown,
  Star,
  Trash2,
  MoreHorizontal,
  Check,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { SavedSchedule } from '@/types/schedule';

interface HeaderProps {
  scheduleName?: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  lastFetchedAt?: string | null;
  onOpenExamRadar?: () => void;
  examCount?: number;
  onOpenHomework?: () => void;
  homeworkCount?: number;
  onOpenAnalytics?: () => void;
  onOpenShortcuts?: () => void;
  isDark?: boolean;
  onToggleDark?: () => void;
  isOnline?: boolean;
  onOpenInstallSheet?: () => void;
  canInstall?: boolean;
  isStandalone?: boolean;
  /** Callback to open command palette */
  onOpenCommandPalette?: () => void;
  /** Saved schedules for dropdown selector */
  schedules?: SavedSchedule[];
  currentScheduleId?: string | null;
  onSelectSchedule?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onRemoveSchedule?: (id: string) => void;
}

export function Header({
  scheduleName = 'Emploi du temps',
  isRefreshing = false,
  onRefresh,
  onOpenAddModal,
  lastFetchedAt,
  onOpenExamRadar,
  examCount = 0,
  onOpenHomework,
  homeworkCount = 0,
  onOpenAnalytics,
  onOpenShortcuts,
  isDark = false,
  onToggleDark = () => {},
  isOnline = true,
  onOpenInstallSheet,
  canInstall = false,
  isStandalone = false,
  onOpenCommandPalette,
  schedules = [],
  currentScheduleId,
  onSelectSchedule,
  onToggleFavorite,
  onRemoveSchedule,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [todayFormatted, setTodayFormatted] = useState<string>('');
  const [isScheduleMenuOpen, setIsScheduleMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const scheduleMenuRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(format(now, 'HH:mm'));
      setTodayFormatted(format(now, 'EEE d MMM', { locale: fr }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(e.target as Node)) {
        setIsScheduleMenuOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsScheduleMenuOpen(false);
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b no-print select-none"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
        boxShadow: '0 1px 0 var(--border)',
      }}
      role="banner"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

        {/* ── Left Zone: Logo + Interactive Schedule Switcher ── */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          {/* Logo Glyph */}
          <div
            className="shrink-0 w-8 h-8 flex items-center justify-center border shadow-tactile-xs"
            style={{
              borderColor: 'var(--border-2)',
              background: 'var(--surface-2)',
              borderRadius: 'var(--r-1)',
            }}
            aria-hidden="true"
          >
            <Calendar className="w-5 h-5 sm:w-5.5 sm:h-5.5" style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
          </div>

          {/* Schedule Switcher Dropdown */}
          <div className="relative min-w-0" ref={scheduleMenuRef}>
            <button
              onClick={() => {
                haptic.tap();
                setIsScheduleMenuOpen(prev => !prev);
              }}
              className="btn-tactile flex items-center gap-2 px-3 py-1.5 border rounded-xs text-left max-w-[220px] sm:max-w-[300px] min-h-[36px]"
              style={{
                background: isScheduleMenuOpen ? 'var(--surface-3)' : 'var(--surface-2)',
                borderColor: isScheduleMenuOpen ? 'var(--text)' : 'var(--border)',
                borderRadius: 'var(--r-1)',
              }}
              aria-expanded={isScheduleMenuOpen}
              aria-haspopup="menu"
              title="Changer d'emploi du temps ou gérer les promotions"
            >
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span
                    className="font-sans font-extrabold text-sm truncate leading-none"
                    style={{ color: 'var(--text)' }}
                  >
                    {scheduleName}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-150 ${isScheduleMenuOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--muted)' }}
                  />
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isScheduleMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 border shadow-tactile-dark z-50 overflow-hidden"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-2)',
                    borderRadius: 'var(--r-1)',
                  }}
                  role="menu"
                >
                  {/* Header info */}
                  <div
                    className="px-3 py-2 border-b flex items-center justify-between"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--muted)' }}>
                      Emplois du temps ({schedules.length})
                    </span>
                    <span className="font-mono text-[9px] uppercase px-1 py-0.5 border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      ARTOIS
                    </span>
                  </div>

                  {/* Schedule list */}
                  <div className="max-h-60 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                    {schedules.map(sch => {
                      const isActive = sch.id === currentScheduleId;
                      return (
                        <div
                          key={sch.id}
                          className="flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-[var(--surface-2)]"
                          style={{
                            background: isActive ? 'var(--accent-dim)' : 'transparent',
                          }}
                        >
                          <button
                            onClick={() => {
                              haptic.tap();
                              onSelectSchedule?.(sch.id);
                              setIsScheduleMenuOpen(false);
                            }}
                            className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                          >
                            {isActive ? (
                              <Check size={14} className="shrink-0" style={{ color: 'var(--accent)' }} />
                            ) : (
                              <div className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span
                              className={`truncate ${isActive ? 'font-bold' : 'font-medium'}`}
                              style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}
                            >
                              {sch.name}
                            </span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {onToggleFavorite && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onToggleFavorite(sch.id);
                                }}
                                className="p-1 hover:text-amber-500 cursor-pointer"
                                style={{ color: sch.isFavorite ? 'var(--td-bar)' : 'var(--muted-2)' }}
                                title={sch.isFavorite ? 'Retirer des favoris' : 'Marquer comme favori'}
                              >
                                <Star size={13} fill={sch.isFavorite ? 'currentColor' : 'none'} />
                              </button>
                            )}
                            {onRemoveSchedule && schedules.length > 1 && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onRemoveSchedule(sch.id);
                                }}
                                className="p-1 text-[var(--muted-2)] hover:text-red-500 cursor-pointer"
                                title="Supprimer ce planning"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions footer */}
                  <div
                    className="p-2 border-t flex items-center justify-between gap-2"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <button
                      onClick={() => {
                        haptic.tap();
                        setIsScheduleMenuOpen(false);
                        onOpenAddModal();
                      }}
                      className="btn-tactile flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold border"
                      style={{
                        background: 'var(--text)',
                        color: 'var(--bg)',
                        borderColor: 'var(--text)',
                        borderRadius: 'var(--r-1)',
                      }}
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Ajouter / Gérer</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live time ticker (subtle & compact) */}
          <div
            className="hidden md:flex items-center gap-1.5 font-mono text-xs pl-2 border-l"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            suppressHydrationWarning
          >
            {isOnline ? (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--live-pulse)' }} />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full pulse-dot shrink-0" style={{ background: '#F59E0B' }} />
            )}
            <span className="capitalize">{todayFormatted}</span>
            <span style={{ color: 'var(--border-2)' }}>·</span>
            <span className="tabular-nums font-semibold" style={{ color: 'var(--text-2)' }}>
              {currentTime}
            </span>
          </div>
        </div>

        {/* ── Right Zone: Essential Controls ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Command Palette Trigger (Cmd+K) */}
          {onOpenCommandPalette && (
            <button
              onClick={() => {
                haptic.tap();
                onOpenCommandPalette();
              }}
              className="btn-tactile inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm border"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--muted)',
                borderRadius: 'var(--r-1)',
                minHeight: '44px',
              }}
              aria-label="Ouvrir la palette de commandes (⌘K)"
              title="Palette de commandes (⌘K ou /)"
            >
              <Search size={16} style={{ color: 'var(--text-2)' }} />
              <kbd
                className="font-mono text-xs font-bold px-1.5 py-0.5 border"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-2)',
                  color: 'var(--text)',
                  borderRadius: '2px',
                }}
              >
                ⌘K
              </kbd>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => {
              haptic.tap();
              onToggleDark();
            }}
            className="btn-tactile p-2.5 border flex items-center justify-center cursor-pointer"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--muted)',
              borderRadius: 'var(--r-1)',
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="Basculer le thème (clair / sombre)"
            title="Basculer le thème"
            suppressHydrationWarning
          >
            <Sun size={18} className="text-amber-400 hidden dark:block" aria-hidden="true" />
            <Moon size={18} className="block dark:hidden" style={{ color: 'var(--text-2)' }} aria-hidden="true" />
          </button>

          {/* Refresh ADE Stream */}
          <button
            onClick={() => {
              haptic.tap();
              onRefresh();
            }}
            disabled={isRefreshing}
            className="btn-tactile p-2.5 border flex items-center justify-center cursor-pointer"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: isRefreshing ? 'var(--accent)' : 'var(--muted)',
              borderRadius: 'var(--r-1)',
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="Actualiser l'emploi du temps (R)"
            title="Actualiser le flux ADE (R)"
          >
            <RotateCw size={18} className={isRefreshing ? 'spinner' : ''} />
          </button>

          {/* Actions Menu Dropdown (Contrôles, Devoirs, Stats, Aide) */}
          <div className="relative" ref={actionsMenuRef}>
            <button
              onClick={() => {
                haptic.tap();
                setIsActionsMenuOpen(prev => !prev);
              }}
              className="btn-tactile relative p-2.5 border flex items-center justify-center cursor-pointer"
              style={{
                background: (examCount > 0 || homeworkCount > 0) ? 'var(--surface-3)' : 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                borderRadius: 'var(--r-1)',
                minWidth: '44px',
                minHeight: '44px',
              }}
              aria-expanded={isActionsMenuOpen}
              aria-haspopup="menu"
              aria-label="Menu d'outils et alertes académiques"
              title="Outils & Alertes"
            >
              <MoreHorizontal size={19} />

              {/* Notification pip if pending exams or homeworks */}
              {(examCount > 0 || homeworkCount > 0) && (
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--surface)]"
                  style={{
                    background: examCount > 0 ? 'var(--exam-bar)' : 'var(--projet-bar)',
                  }}
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Actions Menu Popup */}
            <AnimatePresence>
              {isActionsMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-64 border shadow-tactile-dark z-50 overflow-hidden divide-y"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-2)',
                    borderRadius: 'var(--r-1)',
                  }}
                  role="menu"
                >
                  <div className="p-1">
                    {/* Exam Radar */}
                    {onOpenExamRadar && (
                      <button
                        onClick={() => {
                          haptic.tap();
                          setIsActionsMenuOpen(false);
                          onOpenExamRadar();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-xs transition-colors hover:bg-[var(--surface-2)] text-left cursor-pointer"
                        style={{ color: examCount > 0 ? 'var(--exam-text)' : 'var(--text)' }}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} style={{ color: examCount > 0 ? 'var(--exam-bar)' : 'var(--muted)' }} />
                          <span>Radar Contrôles</span>
                        </div>
                        {examCount > 0 && (
                          <span
                            className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-xs"
                            style={{ background: 'var(--exam-bar)', color: '#fff' }}
                          >
                            {examCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Homework */}
                    {onOpenHomework && (
                      <button
                        onClick={() => {
                          haptic.tap();
                          setIsActionsMenuOpen(false);
                          onOpenHomework();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-xs transition-colors hover:bg-[var(--surface-2)] text-left cursor-pointer"
                        style={{ color: homeworkCount > 0 ? 'var(--projet-text)' : 'var(--text)' }}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} style={{ color: homeworkCount > 0 ? 'var(--projet-bar)' : 'var(--muted)' }} />
                          <span>Devoirs & Projets</span>
                        </div>
                        {homeworkCount > 0 && (
                          <span
                            className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-xs"
                            style={{ background: 'var(--projet-bar)', color: '#fff' }}
                          >
                            {homeworkCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Analytics */}
                    {onOpenAnalytics && (
                      <button
                        onClick={() => {
                          haptic.tap();
                          setIsActionsMenuOpen(false);
                          onOpenAnalytics();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-xs transition-colors hover:bg-[var(--surface-2)] text-left cursor-pointer"
                        style={{ color: 'var(--text)' }}
                      >
                        <BarChart3 size={14} style={{ color: 'var(--muted)' }} />
                        <span>Statistiques semestre</span>
                      </button>
                    )}

                    {/* Shortcuts */}
                    {onOpenShortcuts && (
                      <button
                        onClick={() => {
                          haptic.tap();
                          setIsActionsMenuOpen(false);
                          onOpenShortcuts();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-xs transition-colors hover:bg-[var(--surface-2)] text-left cursor-pointer"
                        style={{ color: 'var(--text)' }}
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle size={14} style={{ color: 'var(--muted)' }} />
                          <span>Raccourcis clavier</span>
                        </div>
                        <kbd className="font-mono text-[10px] text-[var(--muted)]">?</kbd>
                      </button>
                    )}
                  </div>

                  {/* Add / Manage Sources */}
                  <div className="p-1">
                    <button
                      onClick={() => {
                        haptic.tap();
                        setIsActionsMenuOpen(false);
                        onOpenAddModal();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-xs transition-colors hover:bg-[var(--surface-2)] text-left cursor-pointer"
                      style={{ color: 'var(--accent)' }}
                    >
                      <Plus size={14} />
                      <span>Gérer les flux ADE</span>
                    </button>

                    {canInstall && !isStandalone && onOpenInstallSheet && (
                      <button
                        onClick={() => {
                          haptic.tap();
                          setIsActionsMenuOpen(false);
                          onOpenInstallSheet();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-xs transition-colors hover:bg-[var(--surface-2)] text-left cursor-pointer"
                        style={{ color: 'var(--text)' }}
                      >
                        <Smartphone size={14} style={{ color: 'var(--muted)' }} />
                        <span>Installer l&apos;application</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
}
