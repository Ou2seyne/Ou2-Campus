'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { format } from 'date-fns';
import { Clock, Radio, AlertTriangle, BookOpen, CheckCircle2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleLiveBannerProps {
  stats: {
    count: number;
    durationLabel: string;
    totalMinutes: number;
    ongoing?: ScheduleEvent;
    upcoming?: ScheduleEvent;
  };
  examCount?: number;
  homeworkCount?: number;
  onSelectEvent: (event: ScheduleEvent) => void;
  onOpenExamRadar?: () => void;
  onOpenHomework?: () => void;
  onOpenShortcuts?: () => void;
}

export function ScheduleLiveBanner({
  stats,
  examCount = 0,
  homeworkCount = 0,
  onSelectEvent,
  onOpenExamRadar,
  onOpenHomework,
  onOpenShortcuts,
}: ScheduleLiveBannerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [nowTimeStr, setNowTimeStr] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      setNowTimeStr(format(now, 'HH:mm:ss'));

      if (stats.ongoing) {
        const start = new Date(stats.ongoing.dtstart).getTime();
        const end = new Date(stats.ongoing.dtend).getTime();
        const nowMs = now.getTime();
        const diff = Math.max(0, Math.floor((end - nowMs) / 1000));
        setSecondsRemaining(diff);

        const totalDuration = end - start;
        if (totalDuration > 0) {
          const pct = Math.min(100, Math.max(2, Math.round(((nowMs - start) / totalDuration) * 100)));
          setProgressPercent(pct);
        }
      } else if (stats.upcoming) {
        const start = new Date(stats.upcoming.dtstart).getTime();
        const diff = Math.max(0, Math.floor((start - now.getTime()) / 1000));
        setSecondsRemaining(diff);
        setProgressPercent(0);
      } else {
        setSecondsRemaining(0);
        setProgressPercent(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [stats.ongoing, stats.upcoming]);

  const formatHMS = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div
      className="w-full border shadow-tactile-sm transition-colors overflow-hidden relative"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
      role="region"
      aria-label="Tableau de bord de la journée"
    >
      {/* Barre de progression si un cours est en direct */}
      {stats.ongoing && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] bg-black/10 dark:bg-white/10 z-20 overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-emerald-500 transition-all duration-700 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
        
        {/* 1. Résumé chiffré du jour (Spacieux) */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0 bg-[var(--surface-2)] lg:bg-transparent">
          <div className="overflow-hidden h-9 flex items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={stats.count}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="text-2xl font-black tabular-nums font-mono block"
                style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
              >
                {stats.count}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
              cours prévu{stats.count > 1 ? 's' : ''}
            </span>
            <span className="text-xs sm:text-sm font-mono leading-tight font-bold" style={{ color: 'var(--muted)' }}>
              {stats.durationLabel}
            </span>
          </div>
        </div>

        {/* 2. Centre d'action Live / Prochain cours */}
        <div className="flex-1 flex items-center min-w-0 px-4 py-3">
          {stats.ongoing ? (
            <button
              onClick={() => onSelectEvent(stats.ongoing!)}
              className="btn-tactile flex items-center gap-3.5 min-w-0 text-left cursor-pointer group w-full"
              aria-label={`En cours : ${stats.ongoing.cleanTitle}, salle ${stats.ongoing.room || 'non précisée'}`}
            >
              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xs stamp-live">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-indicator-pulse inline-block" />
                <span>EN COURS</span>
              </div>

              <div className="min-w-0 flex-1 truncate">
                <span className="text-sm font-black text-[var(--text)] group-hover:underline truncate mr-2">
                  {stats.ongoing.cleanTitle}
                </span>
                {stats.ongoing.room && (
                  <span className="text-xs sm:text-sm font-mono px-2.5 py-1 rounded-xs border border-[var(--border-2)] text-[var(--muted)] shrink-0 font-bold">
                    {stats.ongoing.room}
                  </span>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1.5 text-sm sm:text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
                <Clock className="w-4.5 h-4.5" strokeWidth={2} />
                <span>-{formatHMS(secondsRemaining)}</span>
              </div>
            </button>
          ) : stats.upcoming ? (
            <button
              onClick={() => onSelectEvent(stats.upcoming!)}
              className="btn-tactile flex items-center gap-3.5 min-w-0 text-left cursor-pointer group w-full"
              aria-label={`Prochain cours : ${stats.upcoming.cleanTitle}, salle ${stats.upcoming.room || 'non précisée'}`}
            >
              <div
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xs stamp-badge"
                style={{
                  background: 'var(--td-bg)',
                  borderColor: 'var(--td-bar)',
                  color: 'var(--td-text)',
                }}
              >
                <Radio className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>PROCHAIN COURS</span>
              </div>

              <div className="min-w-0 flex-1 truncate">
                <span className="text-sm font-black text-[var(--text)] group-hover:underline truncate mr-2">
                  {stats.upcoming.cleanTitle}
                </span>
                {stats.upcoming.room && (
                  <span className="text-xs sm:text-sm font-mono px-2.5 py-1 rounded-xs border border-[var(--border-2)] text-[var(--muted)] shrink-0 font-bold">
                    {stats.upcoming.room}
                  </span>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1.5 text-sm sm:text-base font-mono font-black text-amber-600 dark:text-amber-400">
                <Clock className="w-4.5 h-4.5" strokeWidth={2} />
                <span>dans {formatHMS(secondsRemaining)}</span>
              </div>
            </button>
          ) : stats.count > 0 ? (
            <div className="flex items-center gap-3 text-sm sm:text-base text-[var(--muted)] py-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span className="font-mono text-sm sm:text-base font-bold">
                Journée terminée · Tous les cours d&apos;aujourd&apos;hui sont terminés
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm sm:text-base text-[var(--muted)] py-1">
              <span className="w-3 h-3 rounded-full bg-[var(--border-2)] shrink-0" />
              <span className="font-mono text-sm sm:text-base font-bold">Aucun cours programmé pour ce jour</span>
            </div>
          )}
        </div>

        {/* 3. Statuts & Alertes rapides */}
        <div className="flex items-center justify-between sm:justify-end gap-3 px-6 sm:px-8 py-4 sm:py-5 shrink-0 bg-[var(--surface-2)]">
          {/* Horloge précise */}
          <div
            className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-extrabold text-[var(--muted)]"
            suppressHydrationWarning
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{nowTimeStr || '00:00:00'}</span>
          </div>

          {/* Alertes d'examens */}
          {examCount > 0 && onOpenExamRadar && (
            <button
              onClick={onOpenExamRadar}
              className="btn-tactile cursor-pointer flex items-center gap-1 text-[11px] font-mono font-700 px-2 py-0.5 stamp-exam"
              title={`${examCount} examen(s) prévu(s)`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{examCount} ÉVAL</span>
            </button>
          )}

          {/* Devoirs à faire */}
          {homeworkCount > 0 && onOpenHomework && (
            <button
              onClick={onOpenHomework}
              className="btn-tactile cursor-pointer flex items-center gap-1 text-[11px] font-mono font-700 px-2 py-0.5 border rounded-xs"
              style={{
                background: 'var(--projet-bg)',
                borderColor: 'var(--projet-bar)',
                color: 'var(--projet-text)',
                boxShadow: '1px 1px 0px 0px var(--projet-bar)',
              }}
              title={`${homeworkCount} devoir(s) en attente`}
            >
              <BookOpen className="w-3 h-3" />
              <span>{homeworkCount} DÉV.</span>
            </button>
          )}

          {/* Raccourcis clavier help button */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="btn-tactile hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded-xs border border-[var(--border-2)] text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface)]"
              title="Afficher les raccourcis clavier [?]"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Raccourcis</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
