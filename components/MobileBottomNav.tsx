'use client';

import React from 'react';
import { Calendar, CalendarDays, BookOpen, AlertTriangle, Menu } from 'lucide-react';
import { ViewMode } from '@/types/schedule';
import { triggerHaptic } from '@/lib/haptics';

export interface MobileBottomNavProps {
  currentViewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onGoToToday: () => void;
  onOpenHomework: () => void;
  homeworkCount?: number;
  onOpenExamRadar: () => void;
  examCount?: number;
  onOpenActionMenu: () => void;
  canInstall?: boolean;
  isStandalone?: boolean;
}

export function MobileBottomNav({
  currentViewMode,
  onSelectViewMode,
  onGoToToday,
  onOpenHomework,
  homeworkCount = 0,
  onOpenExamRadar,
  examCount = 0,
  onOpenActionMenu,
  canInstall = false,
  isStandalone = false,
}: MobileBottomNavProps) {
  const handleJourClick = () => {
    triggerHaptic('tap');
    if (currentViewMode !== 'day') {
      onSelectViewMode('day');
    } else {
      onGoToToday();
    }
  };

  const handleSemaineClick = () => {
    triggerHaptic('tap');
    onSelectViewMode('week');
  };

  const handleHomeworkClick = () => {
    triggerHaptic('tap');
    onOpenHomework();
  };

  const handleExamClick = () => {
    triggerHaptic('tap');
    onOpenExamRadar();
  };

  const handleMenuClick = () => {
    triggerHaptic('tap');
    onOpenActionMenu();
  };

  const isDayActive = currentViewMode === 'day';
  const isWeekActive = currentViewMode === 'week';

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t transition-colors pb-[env(safe-area-inset-bottom)]"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
        boxShadow: 'var(--el-3)',
      }}
      aria-label="Navigation mobile principale"
    >
      <div className="grid grid-cols-5 h-16 items-center">
        {/* 1. Onglet Jour */}
        <button
          type="button"
          onClick={handleJourClick}
          aria-current={isDayActive ? 'page' : undefined}
          className={`btn-tactile flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${
            isDayActive ? 'text-[var(--accent)] font-black' : 'text-[var(--muted)] font-bold'
          }`}
          aria-label="Afficher la vue Jour"
        >
          <div className="relative">
            <Calendar className="w-5 h-5" strokeWidth={isDayActive ? 2.5 : 1.75} />
            {isDayActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </div>
          <span className="text-[11px] font-sans tracking-tight">Jour</span>
        </button>

        {/* 2. Onglet Semaine */}
        <button
          type="button"
          onClick={handleSemaineClick}
          aria-current={isWeekActive ? 'page' : undefined}
          className={`btn-tactile flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${
            isWeekActive ? 'text-[var(--accent)] font-black' : 'text-[var(--muted)] font-bold'
          }`}
          aria-label="Afficher la vue Semaine"
        >
          <div className="relative">
            <CalendarDays className="w-5 h-5" strokeWidth={isWeekActive ? 2.5 : 1.75} />
            {isWeekActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </div>
          <span className="text-[11px] font-sans tracking-tight">Semaine</span>
        </button>

        {/* 3. Onglet Devoirs */}
        <button
          type="button"
          onClick={handleHomeworkClick}
          className="btn-tactile relative flex flex-col items-center justify-center gap-1 h-full cursor-pointer text-[var(--muted)] font-bold transition-colors hover:text-[var(--projet-bar)]"
          aria-label={`Devoirs (${homeworkCount} en attente)`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" strokeWidth={1.75} />
            {homeworkCount > 0 && (
              <span
                className="absolute -top-1.5 -right-3 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-xs text-[10px] font-mono font-black text-white"
                style={{ background: 'var(--projet-bar)' }}
              >
                {homeworkCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-sans tracking-tight">Devoirs</span>
        </button>

        {/* 4. Onglet Contrôles */}
        <button
          type="button"
          onClick={handleExamClick}
          className="btn-tactile relative flex flex-col items-center justify-center gap-1 h-full cursor-pointer text-[var(--muted)] font-bold transition-colors hover:text-[var(--exam-bar)]"
          aria-label={`Contrôles et examens (${examCount} à venir)`}
        >
          <div className="relative">
            <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
            {examCount > 0 && (
              <span
                className="absolute -top-1.5 -right-3 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-xs text-[10px] font-mono font-black text-white"
                style={{ background: 'var(--exam-bar)' }}
              >
                {examCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-sans tracking-tight">Contrôles</span>
        </button>

        {/* 5. Onglet Menu / Plus */}
        <button
          type="button"
          onClick={handleMenuClick}
          className="btn-tactile relative flex flex-col items-center justify-center gap-1 h-full cursor-pointer text-[var(--muted)] font-bold transition-colors hover:text-[var(--text)]"
          aria-label="Menu des actions rapides"
        >
          <div className="relative">
            <Menu className="w-5 h-5" strokeWidth={1.75} />
            {canInstall && !isStandalone && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            )}
          </div>
          <span className="text-[11px] font-sans tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
