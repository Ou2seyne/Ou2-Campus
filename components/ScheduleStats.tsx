'use client';

import React from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleStatsProps {
  stats: {
    count: number;
    durationLabel: string;
    totalMinutes: number;
    ongoing?: ScheduleEvent;
    upcoming?: ScheduleEvent;
  };
  onSelectEvent: (event: ScheduleEvent) => void;
}

export function ScheduleStats({ stats, onSelectEvent }: ScheduleStatsProps) {
  const now = new Date();
  const minutesToNext = stats.upcoming
    ? Math.max(1, Math.round((new Date(stats.upcoming.dtstart).getTime() - now.getTime()) / 60000))
    : 0;

  return (
    <div
      className="w-full flex flex-wrap items-center gap-x-0 border divide-x text-xs shadow-tactile-sm transition-colors"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
      role="status"
      aria-label="Résumé du jour"
    >
      {/* Bloc 1 : nombre de cours animé avec flip */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0">
        <div className="overflow-hidden h-6 flex items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={stats.count}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="text-xl font-800 tabular-nums font-mono block"
              style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              {stats.count}
            </motion.span>
          </AnimatePresence>
        </div>

        <span style={{ color: 'var(--muted)', fontWeight: 700 }}>
          cours · {stats.durationLabel}
        </span>
      </div>

      {/* Bloc 2 : en cours / prochain */}
      {stats.ongoing ? (
        <button
          onClick={() => onSelectEvent(stats.ongoing!)}
          className="btn-tactile flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-colors text-left flex-1 min-w-0"
          style={{ color: 'var(--text)' }}
          aria-label={`En cours : ${stats.ongoing.cleanTitle}`}
        >
          {/* Indicateur live avec pulse */}
          <span className="stamp-live shrink-0">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 live-indicator-pulse"
              aria-hidden="true"
            />
            <span>EN COURS</span>
          </span>

          <span className="truncate font-700 max-w-[200px] sm:max-w-xs" style={{ color: 'var(--text)' }}>
            {stats.ongoing.cleanTitle}
          </span>

          {stats.ongoing.room && (
            <span
              className="shrink-0 hidden sm:inline px-1.5 py-0.2 rounded-xs border border-[var(--border)] font-mono text-[11px]"
              style={{ color: 'var(--muted)', background: 'var(--surface-2)' }}
            >
              {stats.ongoing.room}
            </span>
          )}
        </button>
      ) : stats.upcoming ? (
        <button
          onClick={() => onSelectEvent(stats.upcoming!)}
          className="btn-tactile flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors text-left flex-1 min-w-0"
          style={{ color: 'var(--text)' }}
          aria-label={`Prochain cours : ${stats.upcoming.cleanTitle}`}
        >
          <span
            className="font-800 tabular-nums shrink-0 font-mono px-1.5 py-0.5 rounded-xs"
            style={{
              background: 'var(--td-bg)',
              color: 'var(--td-text)',
              border: '1px solid var(--td-bar)',
            }}
          >
            {minutesToNext < 90
              ? `DANS ${minutesToNext} MIN`
              : `À ${format(new Date(stats.upcoming.dtstart), 'HH:mm')}`}
          </span>

          <span className="truncate font-700 max-w-[200px] sm:max-w-xs" style={{ color: 'var(--text)' }}>
            {stats.upcoming.cleanTitle}
          </span>
        </button>
      ) : (
        <div
          className="px-4 py-2 font-mono text-[11px]"
          style={{ color: 'var(--muted)' }}
        >
          {stats.count === 0 ? 'Journée libre sans enseignement' : 'Tous les cours du jour sont terminés'}
        </div>
      )}

      {/* Bloc 3 : salle (si en cours ou prochain) */}
      {(stats.ongoing?.room || stats.upcoming?.room) && (
        <div
          className="hidden md:flex items-center gap-2 px-4 py-2 shrink-0 bg-[var(--surface-2)]"
          style={{ color: 'var(--muted)' }}
        >
          <span className="font-mono text-xs font-700" style={{ color: 'var(--text)' }}>
            📍 {stats.ongoing?.room || stats.upcoming?.room}
          </span>
        </div>
      )}
    </div>
  );
}
