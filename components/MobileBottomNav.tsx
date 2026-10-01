'use client';

import React from 'react';
import { Calendar, CalendarDays, BookOpen, AlertTriangle, Menu } from 'lucide-react';
import { ViewMode } from '@/types/schedule';
import { haptic } from '@/lib/haptics';

interface MobileBottomNavProps {
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
    haptic.tap();
    if (currentViewMode !== 'day') {
      onSelectViewMode('day');
    } else {
      onGoToToday();
    }
  };

  const handleSemaineClick = () => {
    haptic.tap();
    onSelectViewMode('week');
  };

  const handleHomeworkClick = () => {
    haptic.tap();
    onOpenHomework();
  };

  const handleExamClick = () => {
    haptic.tap();
    onOpenExamRadar();
  };

  const handleMenuClick = () => {
    haptic.tap();
    onOpenActionMenu();
  };

  const isDayActive = currentViewMode === 'day';
  const isWeekActive = currentViewMode === 'week';

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg transition-colors pb-[env(safe-area-inset-bottom)]"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
      }}
      aria-label="Navigation mobile principale"
    >
      <div className="grid grid-cols-5 h-16 items-center">
        {/* 1. Onglet Jour */}
        <button
          onClick={handleJourClick}
          className={`flex flex-col items-center justify-center gap-1.5 h-full cursor-pointer transition-all active:scale-90 active:opacity-75 ${
            isDayActive ? 'text-[var(--accent)] font-black' : 'text-[var(--muted)] font-bold'
          }`}
          aria-label="Afficher la vue Jour"
        >
          <div className="relative">
            <Calendar className="w-5 h-5" strokeWidth={isDayActive ? 2.6 : 2} />
            {isDayActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </div>
          <span className="text-xs tracking-tight">Jour</span>
        </button>

        {/* 2. Onglet Semaine */}
        <button
          onClick={handleSemaineClick}
          className={`flex flex-col items-center justify-center gap-1.5 h-full cursor-pointer transition-all active:scale-90 active:opacity-75 ${
            isWeekActive ? 'text-[var(--accent)] font-black' : 'text-[var(--muted)] font-bold'
          }`}
          aria-label="Afficher la vue Semaine"
        >
          <div className="relative">
            <CalendarDays className="w-5 h-5" strokeWidth={isWeekActive ? 2.6 : 2} />
            {isWeekActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </div>
          <span className="text-xs tracking-tight">Semaine</span>
        </button>

        {/* 3. Onglet Devoirs */}
        <button
          onClick={handleHomeworkClick}
          className="relative flex flex-col items-center justify-center gap-1.5 h-full cursor-pointer text-[var(--muted)] font-bold transition-all active:scale-90 active:opacity-75 hover:text-[var(--projet-bar)]"
          aria-label={`Devoirs (${homeworkCount} en attente)`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" strokeWidth={2} />
            {homeworkCount > 0 && (
              <span
                className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-mono font-black text-white shadow-xs"
                style={{ background: 'var(--projet-bar)' }}
              >
                {homeworkCount}
              </span>
            )}
          </div>
          <span className="text-xs tracking-tight">Devoirs</span>
        </button>

        {/* 4. Onglet Contrôles */}
        <button
          onClick={handleExamClick}
          className="relative flex flex-col items-center justify-center gap-1.5 h-full cursor-pointer text-[var(--muted)] font-bold transition-all active:scale-90 active:opacity-75 hover:text-[var(--exam-bar)]"
          aria-label={`Contrôles et examens (${examCount} à venir)`}
        >
          <div className="relative">
            <AlertTriangle className="w-5 h-5" strokeWidth={2} />
            {examCount > 0 && (
              <span
                className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-mono font-black text-white shadow-xs"
                style={{ background: 'var(--exam-bar)' }}
              >
                {examCount}
              </span>
            )}
          </div>
          <span className="text-xs tracking-tight">Contrôles</span>
        </button>

        {/* 5. Onglet Menu / Plus */}
        <button
          onClick={handleMenuClick}
          className="relative flex flex-col items-center justify-center gap-1.5 h-full cursor-pointer text-[var(--muted)] font-bold transition-all active:scale-90 active:opacity-75 hover:text-[var(--text)]"
          aria-label="Menu et réglages"
        >
          <div className="relative">
            <Menu className="w-5 h-5" strokeWidth={2} />
            {canInstall && !isStandalone && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            )}
          </div>
          <span className="text-xs tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
