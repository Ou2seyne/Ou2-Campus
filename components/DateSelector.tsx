'use client';

import React from 'react';
import { ViewMode } from '@/types/schedule';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/haptics';

interface DateSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  weekDays: {
    date: Date;
    formattedDay: string;
    dayNumber: string;
    hasEvents: boolean;
    eventCount: number;
    isToday: boolean;
    isSelected: boolean;
  }[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onGoToToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: 'day',  label: 'Jour' },
  { key: 'week', label: 'Semaine' },
  { key: 'list', label: 'Liste' },
];

export function DateSelector({
  selectedDate,
  onSelectDate,
  weekDays,
  viewMode,
  onViewModeChange,
  onGoToToday,
  onPrev,
  onNext,
}: DateSelectorProps) {
  const isSelectedToday = isSameDay(selectedDate, new Date());
  const formattedFullDate = format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <div
      className="w-full border shadow-tactile-sm"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
    >
      {/* Barre de navigation + sélecteur de vue (Spacieuse) */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Navigation gauche */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              haptic.tap();
              onPrev();
            }}
            className="btn-tactile p-1.5 rounded-xs border border-[var(--border)] hover:border-[var(--border-2)] transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface-2)] shadow-tactile-xs active-press min-w-[34px] min-h-[34px] flex items-center justify-center"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => {
              haptic.medium();
              onGoToToday();
            }}
            className="btn-tactile px-3 py-1.5 text-sm font-bold rounded-xs transition-colors cursor-pointer shadow-tactile-xs border active-press min-h-[34px]"
            style={{
              color: isSelectedToday ? 'var(--accent)' : 'var(--muted)',
              background: isSelectedToday ? 'var(--accent-dim)' : 'var(--surface-2)',
              borderColor: isSelectedToday ? 'var(--accent)' : 'var(--border)',
            }}
          >
            Aujourd&apos;hui
          </button>

          <button
            onClick={() => {
              haptic.tap();
              onNext();
            }}
            className="btn-tactile p-1.5 rounded-xs border border-[var(--border)] hover:border-[var(--border-2)] transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface-2)] shadow-tactile-xs active-press min-w-[34px] min-h-[34px] flex items-center justify-center"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>

          {/* Date complète */}
          <span
            className="ml-2 text-sm font-bold capitalize hidden sm:inline tracking-tight"
            style={{ color: 'var(--text)' }}
            suppressHydrationWarning
          >
            {formattedFullDate}
          </span>
        </div>

        {/* Segmented control vue avec glisseur physique layoutId */}
        <div
          className="inline-flex border p-1 relative shadow-tactile-xs"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border-2)',
          }}
          role="tablist"
          aria-label="Mode d'affichage"
        >
          {VIEW_MODES.map(({ key, label }) => {
            const isActive = viewMode === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  haptic.tap();
                  onViewModeChange(key);
                }}
                className="relative px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer z-10 min-h-[32px] flex items-center justify-center"
                style={{
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-view-glider"
                    className="absolute inset-0 shadow-tactile-xs border -z-10"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border-2)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strip de jours avec glisseur layoutId (Généreux) */}
      <div className="grid grid-cols-6 relative">
        {weekDays.map((item, idx) => {
          const isSelected = item.isSelected;
          const isToday    = item.isToday;

          return (
            <button
              key={idx}
              onClick={() => {
                haptic.tap();
                onSelectDate(item.date);
              }}
              className="relative flex flex-col items-center py-3 sm:py-4 px-2 transition-colors cursor-pointer select-none group active-press"
              style={{
                borderRight: idx < 5 ? '1px solid var(--border)' : 'none',
                color: isSelected
                  ? 'var(--bg)'
                  : isToday
                  ? 'var(--accent)'
                  : 'var(--muted)',
              }}
              aria-label={`${item.formattedDay} ${item.dayNumber}${item.hasEvents ? `, ${item.eventCount} cours` : ''}`}
              aria-pressed={isSelected}
            >
              {/* Fond glissant pour le jour sélectionné */}
              {isSelected && (
                <motion.div
                  layoutId="active-day-glider"
                  className="absolute inset-0 z-0"
                  style={{
                    background: 'var(--text)',
                  }}
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              {/* Arrière-plan subtil si aujourd'hui mais non sélectionné */}
              {!isSelected && isToday && (
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    background: 'var(--accent-dim)',
                  }}
                />
              )}

              {/* Jour abrégé */}
              <span
                className="relative z-10 text-xs sm:text-sm font-black uppercase tracking-widest block transition-colors group-hover:text-[var(--accent)] font-mono"
                style={{ letterSpacing: '0.08em' }}
              >
                {item.formattedDay}
              </span>

              {/* Numéro */}
              <span
                className="relative z-10 text-2xl sm:text-3xl font-black leading-none tabular-nums mt-1 font-mono tracking-tight"
              >
                {item.dayNumber}
              </span>

              {/* Indicateur événements */}
              <div className="relative z-10 h-5 flex items-center justify-center mt-2">
                {item.hasEvents ? (
                  <span
                    className="text-xs font-black tabular-nums px-2.5 py-0.5 rounded-xs font-mono"
                    style={{
                      background: isSelected
                        ? 'rgba(255,255,255,0.22)'
                        : isToday
                        ? 'var(--accent)'
                        : 'var(--surface-3)',
                      color: isSelected ? '#ffffff' : isToday ? '#ffffff' : 'var(--text)',
                    }}
                  >
                    {item.eventCount}
                  </span>
                ) : (
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: isSelected ? 'var(--bg)' : 'var(--border-2)', opacity: 0.6 }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
