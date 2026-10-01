'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { CourseCard } from './CourseCard';
import { Coffee, Utensils } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { motion, Variants } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { getCategoryTheme } from '@/lib/theme';

interface TimelineViewProps {
  events: ScheduleEvent[];
  onSelectEvent: (event: ScheduleEvent) => void;
  pendingByCourse?: Record<string, number>;
  onAddHomework?: (courseTitle: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  searchQuery?: string;
  onFilterTeacher?: (teacher: string) => void;
  onFilterRoom?: (room: string) => void;
  /** Current timestamp (ms) — injected from page.tsx 1-second timer */
  currentTimestamp?: number;
}

const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.12 },
  },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.14 },
  },
};

export function TimelineView({
  events,
  onSelectEvent,
  pendingByCourse = {},
  onAddHomework,
  onPrev,
  onNext,
  searchQuery = '',
  onFilterTeacher,
  onFilterRoom,
}: TimelineViewProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Horizontal swipe: at least 40px horizontally and predominantly horizontal
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      haptic.light();
      if (deltaX < 0) {
        onNext?.();
      } else {
        onPrev?.();
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  if (events.length === 0) {
    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full flex flex-col items-start gap-3 p-6 border shadow-tactile-sm my-2 touch-pan-y"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border-2)',
          borderLeft: '4px solid var(--accent)',
          borderRadius: 'var(--r-1)',
        }}
      >
        <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
          <Coffee className="w-4 h-4 shrink-0 text-[var(--accent)]" strokeWidth={2} />
          <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>
            Aucun cours programmé ce jour
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Journée libre ou données non chargées. Balayez l&apos;écran ou naviguez vers un autre jour.
        </p>
      </div>
    );
  }

  const isToday = isSameDay(new Date(events[0].dtstart), currentTime);
  const nowMs   = currentTime.getTime();

  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="show"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full my-3 space-y-0 touch-pan-y relative"
    >
      {events.map((event, idx) => {
        const nextEvent = events[idx + 1];
        const currentStart = new Date(event.dtstart);
        const currentEnd   = new Date(event.dtend);
        const currentStartMs = currentStart.getTime();
        const currentEndMs   = currentEnd.getTime();

        const isOngoing = nowMs >= currentStartMs && nowMs <= currentEndMs;
        const isPast    = isToday && nowMs > currentEndMs;

        const startTime = format(currentStart, 'HH:mm');
        const endTime   = format(currentEnd,   'HH:mm');

        const theme = getCategoryTheme(event.category);

        // Ligne "Maintenant" si l'heure actuelle se situe entre deux cours
        const prevEvent = events[idx - 1];
        const prevEndMs = prevEvent ? new Date(prevEvent.dtend).getTime() : 0;
        const showNowLineBefore =
          isToday &&
          nowMs < currentStartMs &&
          (prevEvent ? nowMs >= prevEndMs : true);

        let breakElement: React.ReactNode = null;

        if (nextEvent) {
          const nextStart   = new Date(nextEvent.dtstart);
          const diffMinutes = Math.round((nextStart.getTime() - currentEndMs) / 60000);

          if (diffMinutes >= 20) {
            const hours = Math.floor(diffMinutes / 60);
            const mins  = diffMinutes % 60;
            const durationLabel = hours > 0
              ? `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
              : `${mins} min`;
            const isLunch =
              (currentEnd.getHours() === 11 && currentEnd.getMinutes() >= 30) ||
              (currentEnd.getHours() >= 12 && currentEnd.getHours() <= 14);
            const isBreakOngoing = isToday && nowMs >= currentEndMs && nowMs < nextStart.getTime();
            const remainingBreakMinutes = isBreakOngoing
              ? Math.max(1, Math.round((nextStart.getTime() - nowMs) / 60000))
              : 0;

            breakElement = (
              <div className="flex items-center gap-3 sm:gap-5 my-3 select-none" aria-label={`Pause de ${durationLabel}`}>
                {/* Gutter heure de pause */}
                <div className="w-16 sm:w-20 shrink-0 text-right pr-1 font-mono text-xs text-[var(--muted-2)] tabular-nums font-bold">
                  {endTime}
                </div>

                {/* Point sur la colonne de repère */}
                <div className="relative flex items-center justify-center shrink-0 w-5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: isBreakOngoing ? '#F59E0B' : 'var(--border-2)' }}
                  />
                </div>

                {/* Contenu de la pause */}
                <div className="flex-1 min-w-0">
                  {isBreakOngoing ? (
                    <div
                      className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-5 py-3 border rounded-xs text-xs sm:text-sm font-mono shadow-tactile-xs bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 live-indicator-pulse shrink-0" />
                        {isLunch ? (
                          <Utensils className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2.2} />
                        ) : (
                          <Coffee className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2.2} />
                        )}
                        <span className="font-extrabold tracking-tight">
                          {isLunch ? 'PAUSE DÉJEUNER EN COURS' : 'PAUSE EN COURS'} · RESTE {remainingBreakMinutes} MIN
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm opacity-90 font-bold">
                        Reprise {format(nextStart, 'HH:mm')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-xs sm:text-sm font-mono text-[var(--muted)]">
                      <div
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs border shadow-tactile-xs"
                        style={{
                          background: 'var(--surface-2)',
                          borderColor: 'var(--border)',
                          color: 'var(--muted)',
                        }}
                      >
                        {isLunch ? (
                          <Utensils className="w-4 h-4 text-amber-500" strokeWidth={2.2} />
                        ) : (
                          <Coffee className="w-4 h-4 text-amber-500" strokeWidth={2.2} />
                        )}
                        <span className="font-bold">{isLunch ? 'Pause déjeuner' : 'Pause'} · {durationLabel}</span>
                        <span className="text-xs text-[var(--muted-2)] font-semibold">
                          ({endTime} → {format(nextStart, 'HH:mm')})
                        </span>
                      </div>
                      <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: 'var(--border-2)' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          }
        }

        return (
          <React.Fragment key={event.id}>
            {/* Ligne repère MAINTENANT alignée sur les colonnes */}
            {showNowLineBefore && (
              <div className="flex items-center gap-3 sm:gap-5 my-3 relative z-20">
                <div className="w-16 sm:w-20 shrink-0 text-right">
                  <span className="inline-block px-2.5 py-1 rounded-xs font-mono text-xs sm:text-sm font-black text-white bg-red-600 shadow-sm">
                    {format(currentTime, 'HH:mm')}
                  </span>
                </div>
                <div className="relative flex items-center justify-center shrink-0 w-5">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-red-600 relative z-10" />
                </div>
                <div className="flex-1 h-[2px] bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              </div>
            )}

            {/* Rangée de cours : Gutter Heure (Gauche) + Rail (Centre) + Carte de cours (Droite) */}
            <motion.div
              variants={listItemVariants}
              className="flex items-stretch gap-3 sm:gap-5 group relative"
            >
              {/* 1. Colonne Gutter Gauche : Horaires (Spacieux) */}
              <div className="w-16 sm:w-20 shrink-0 flex flex-col items-end text-right pt-2.5 pb-3 select-none">
                {/* Heure de début */}
                <span
                  className="font-mono text-sm font-black tracking-tight tabular-nums leading-none"
                  style={{
                    color: isOngoing ? 'var(--live-pulse)' : 'var(--text)',
                  }}
                >
                  {startTime}
                </span>

                {/* Durée du créneau */}
                <span className="font-mono text-xs sm:text-sm text-[var(--muted)] mt-1.5 font-bold tabular-nums leading-tight">
                  {event.durationMinutes} min
                </span>

                {/* Heure de fin */}
                <span className="font-mono text-xs text-[var(--muted-2)] mt-auto pt-2 tabular-nums font-bold leading-none">
                  {endTime}
                </span>
              </div>

              {/* 2. Rail Timeline vertical avec nœud d'ancrage */}
              <div className="relative flex flex-col items-center shrink-0 w-5">
                {/* Ligne conductrice verticale */}
                <div
                  className="absolute top-0 bottom-0 w-[3px]"
                  style={{ background: 'var(--border)' }}
                />

                {/* Pastille de nœud alignée au début du cours */}
                <div
                  className={`relative z-10 mt-3.5 rounded-full border transition-all ${
                    isOngoing
                      ? 'w-5 h-5 bg-emerald-500 border-2 border-white shadow-[0_0_14px_rgba(34,197,94,0.8)] animate-pulse'
                      : isPast
                      ? 'w-3 h-3 bg-[var(--surface-3)] border-[var(--border-2)]'
                      : 'w-3.5 h-3.5 bg-[var(--surface)] group-hover:scale-125'
                  }`}
                  style={!isOngoing && !isPast ? { borderColor: theme.barColor, borderWidth: '2px' } : undefined}
                />
              </div>

              {/* 3. Carte de cours (Droite) */}
              <div className="flex-1 min-w-0 pb-5 sm:pb-6">
                <CourseCard
                  event={event}
                  onClick={() => onSelectEvent(event)}
                  pendingHomeworkCount={pendingByCourse[event.cleanTitle] || 0}
                  onAddHomework={onAddHomework}
                  searchQuery={searchQuery}
                  onFilterTeacher={onFilterTeacher}
                  onFilterRoom={onFilterRoom}
                  hideInlineTime={true}
                />
              </div>
            </motion.div>

            {breakElement}
          </React.Fragment>
        );
      })}

      {/* Ligne repère MAINTENANT si l'heure actuelle est après le dernier cours du jour */}
      {isToday && events.length > 0 && nowMs > new Date(events[events.length - 1].dtend).getTime() && (
        <div className="flex items-center gap-3 sm:gap-5 my-3 relative z-20">
          <div className="w-16 sm:w-20 shrink-0 text-right">
            <span className="inline-block px-2.5 py-1 rounded-xs font-mono text-xs sm:text-sm font-black text-white bg-red-600 shadow-sm">
              {format(currentTime, 'HH:mm')}
            </span>
          </div>
          <div className="relative flex items-center justify-center shrink-0 w-5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-red-600 relative z-10" />
          </div>
          <div className="flex-1 h-[2px] bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        </div>
      )}
    </motion.div>
  );
}
