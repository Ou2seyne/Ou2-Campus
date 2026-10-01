'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
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
  Wifi,
  WifiOff,
} from 'lucide-react';
import { format, getWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { triggerHaptic } from '@/lib/haptics';
import { SavedSchedule } from '@/types/schedule';
import { Kbd } from '@/components/ui/Kbd';

export interface HeaderProps {
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
  onOpenCommandPalette?: () => void;
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
  const [editionText, setEditionText] = useState<string>('');
  const [isScheduleMenuOpen, setIsScheduleMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const scheduleMenuRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(format(now, 'HH:mm:ss'));
      const dayStr = format(now, 'EEEE d MMMM', { locale: fr }).toUpperCase();
      const semStr = `SEM. ${getWeek(now, { weekStartsOn: 1 })}`;
      setEditionText(`ÉDITION DU ${dayStr} · ${semStr}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(e.target as Node)) {
        setIsScheduleMenuOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefreshClick = () => {
    triggerHaptic('tap');
    onRefresh();
  };

  return (
    <header
      className="sticky top-0 z-30 w-full h-[60px] border-b select-none no-print transition-colors"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
        {/* Left: Masthead Brand & Schedule Dropdown */}
        <div className="flex items-center gap-3 min-w-0" ref={scheduleMenuRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setIsScheduleMenuOpen((prev) => !prev);
              }}
              aria-expanded={isScheduleMenuOpen}
              aria-haspopup="true"
              className="btn-tactile flex items-center gap-2 px-2.5 py-1 border rounded-xs max-w-[220px] sm:max-w-[320px] text-left"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border-2)',
                color: 'var(--text)',
                boxShadow: 'var(--el-1)',
              }}
              title="Changer d'emploi du temps ou de groupe"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-sans font-800 text-xs sm:text-sm leading-tight truncate">
                  {scheduleName}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--muted)] truncate">
                  {editionText || 'AURA CAMPUS V3'}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-[var(--muted)] shrink-0 transition-transform ${
                  isScheduleMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Schedule Selector Dropdown Menu */}
            <AnimatePresence>
              {isScheduleMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1.5 w-72 border rounded-xs shadow-tactile-dark p-2 z-50 space-y-1"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-2)',
                  }}
                >
                  <div className="px-2 py-1 flex items-center justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-mono text-[10px] font-bold uppercase text-[var(--muted)]">
                      Mes Emplois du Temps
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsScheduleMenuOpen(false);
                        onOpenAddModal();
                      }}
                      className="text-[11px] font-mono font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} />
                      <span>Ajouter</span>
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-[var(--border)]">
                    {schedules.map((s) => {
                      const isCurrent = s.id === currentScheduleId;
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between p-2 text-xs rounded-xs transition-colors ${
                            isCurrent ? 'bg-[var(--accent-dim)] font-bold' : 'hover:bg-[var(--surface-2)]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSchedule?.(s.id);
                              setIsScheduleMenuOpen(false);
                            }}
                            className="flex-1 text-left truncate mr-2"
                          >
                            <span className="truncate block">{s.name}</span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            {onToggleFavorite && (
                              <button
                                type="button"
                                onClick={() => onToggleFavorite(s.id)}
                                aria-label="Favori"
                                className="p-1 text-[var(--muted)] hover:text-amber-500"
                              >
                                <Star
                                  size={13}
                                  className={s.isFavorite ? 'fill-amber-500 text-amber-500' : ''}
                                />
                              </button>
                            )}
                            {onRemoveSchedule && schedules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => onRemoveSchedule(s.id)}
                                aria-label="Supprimer"
                                className="p-1 text-[var(--muted)] hover:text-red-500"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Network status indicator badge */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-0.5 border rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: isOnline ? 'var(--surface-2)' : 'var(--exam-bg)',
              borderColor: isOnline ? 'var(--border)' : 'var(--exam-bar)',
              color: isOnline ? 'var(--muted)' : 'var(--exam-text)',
            }}
            title={isOnline ? 'Connecté aux serveurs ADE' : 'Mode Hors-ligne activé (Cache local)'}
          >
            {isOnline ? (
              <>
                <Wifi size={11} className="text-emerald-500" />
                <span>En Ligne</span>
              </>
            ) : (
              <>
                <WifiOff size={11} className="text-red-500" />
                <span>Hors-Ligne</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Live Clock & Freshness */}
        <div className="hidden lg:flex flex-col items-center justify-center font-mono">
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider" style={{ color: 'var(--text)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span suppressHydrationWarning>{currentTime || '00:00:00'}</span>
          </div>
          {lastFetchedAt && (
            <span className="text-[9px] text-[var(--muted)] tracking-tight">
              Synchro ADE : {format(new Date(lastFetchedAt), 'HH:mm')}
            </span>
          )}
        </div>

        {/* Right: Search Button (⌘K) & Action Icons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Search trigger button with ⌘K */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                onOpenCommandPalette();
              }}
              className="btn-tactile hidden sm:inline-flex items-center gap-2 px-2.5 py-1 border rounded-xs font-sans text-xs"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border-2)',
                color: 'var(--muted)',
                boxShadow: 'var(--el-1)',
                minHeight: '36px',
              }}
              title="Ouvrir la palette de commandes [⌘K]"
            >
              <Search size={13} className="text-[var(--muted)]" />
              <span className="font-600">Rechercher…</span>
              <Kbd className="ml-1">⌘K</Kbd>
            </button>
          )}

          {/* Radar Examens button with badge */}
          {onOpenExamRadar && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                onOpenExamRadar();
              }}
              aria-label="Radar des examens"
              className={`btn-tactile relative p-2 border rounded-xs inline-flex items-center justify-center ${
                examCount > 0 ? 'bg-[var(--exam-bg)] border-[var(--exam-bar)] text-[var(--exam-text)]' : 'bg-[var(--surface-2)] border-[var(--border-2)] text-[var(--muted)]'
              }`}
              style={{ minWidth: '40px', minHeight: '40px', boxShadow: 'var(--el-1)' }}
              title="Radar des Examens"
            >
              <AlertTriangle size={16} />
              {examCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 px-1 font-mono text-[9px] font-black rounded-xs border text-white"
                  style={{ background: 'var(--exam-bar)', borderColor: 'var(--exam-bar)' }}
                >
                  {examCount}
                </span>
              )}
            </button>
          )}

          {/* Homework button with count */}
          {onOpenHomework && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                onOpenHomework();
              }}
              aria-label="Devoirs et rappels"
              className={`btn-tactile relative p-2 border rounded-xs inline-flex items-center justify-center ${
                homeworkCount > 0 ? 'bg-[var(--projet-bg)] border-[var(--projet-bar)] text-[var(--projet-text)]' : 'bg-[var(--surface-2)] border-[var(--border-2)] text-[var(--muted)]'
              }`}
              style={{ minWidth: '40px', minHeight: '40px', boxShadow: 'var(--el-1)' }}
              title="Devoirs & Tâches"
            >
              <BookOpen size={16} />
              {homeworkCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 px-1 font-mono text-[9px] font-black rounded-xs border text-white"
                  style={{ background: 'var(--projet-bar)', borderColor: 'var(--projet-bar)' }}
                >
                  {homeworkCount}
                </span>
              )}
            </button>
          )}

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            aria-label="Actualiser l'emploi du temps"
            className="btn-tactile p-2 border rounded-xs inline-flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)]"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border-2)',
              minWidth: '40px',
              minHeight: '40px',
              boxShadow: 'var(--el-1)',
            }}
            title="Rafraîchir [R]"
          >
            <RotateCw size={15} className={isRefreshing ? 'animate-spin text-[var(--accent)]' : ''} />
          </button>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onToggleDark();
            }}
            aria-label="Basculer le thème"
            className="btn-tactile p-2 border rounded-xs inline-flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)]"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border-2)',
              minWidth: '40px',
              minHeight: '40px',
              boxShadow: 'var(--el-1)',
            }}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* More Actions Dropdown Menu */}
          <div className="relative" ref={actionsMenuRef}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setIsActionsMenuOpen((prev) => !prev);
              }}
              aria-expanded={isActionsMenuOpen}
              aria-label="Plus d'actions"
              className="btn-tactile p-2 border rounded-xs inline-flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)]"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border-2)',
                minWidth: '40px',
                minHeight: '40px',
                boxShadow: 'var(--el-1)',
              }}
              title="Menu d'outils complémentaires"
            >
              <MoreHorizontal size={16} />
            </button>

            <AnimatePresence>
              {isActionsMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-56 border rounded-xs shadow-tactile-dark p-1.5 z-50 space-y-1 font-sans text-xs"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-2)',
                  }}
                >
                  {onOpenAnalytics && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        onOpenAnalytics();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xs hover:bg-[var(--surface-2)] text-left cursor-pointer"
                    >
                      <BarChart3 size={14} className="text-[var(--muted)]" />
                      <span>Statistiques & Volumes</span>
                    </button>
                  )}

                  {onOpenShortcuts && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        onOpenShortcuts();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xs hover:bg-[var(--surface-2)] text-left cursor-pointer"
                    >
                      <HelpCircle size={14} className="text-[var(--muted)]" />
                      <span>Raccourcis Clavier [?]</span>
                    </button>
                  )}

                  {canInstall && !isStandalone && onOpenInstallSheet && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        onOpenInstallSheet();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xs hover:bg-[var(--surface-2)] text-left cursor-pointer text-[var(--accent)] font-bold"
                    >
                      <Smartphone size={14} />
                      <span>Installer l&apos;App (PWA)</span>
                    </button>
                  )}

                  <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />

                  <Link
                    href="/_ui"
                    onClick={() => setIsActionsMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xs hover:bg-[var(--surface-2)] text-left cursor-pointer font-mono text-[11px] text-[var(--muted)]"
                  >
                    <span>/_ui (Design Tokens)</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
