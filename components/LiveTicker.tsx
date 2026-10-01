'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { format } from 'date-fns';
import { Radio, AlertTriangle, BookOpen, Clock } from 'lucide-react';

interface LiveTickerProps {
  ongoingEvent?: ScheduleEvent;
  upcomingEvent?: ScheduleEvent;
  examCount?: number;
  homeworkCount?: number;
  onSelectEvent?: (event: ScheduleEvent) => void;
  onOpenExamRadar?: () => void;
  onOpenHomework?: () => void;
}

export function LiveTicker({
  ongoingEvent,
  upcomingEvent,
  examCount = 0,
  homeworkCount = 0,
  onSelectEvent,
  onOpenExamRadar,
  onOpenHomework,
}: LiveTickerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [nowTimeStr, setNowTimeStr] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      setNowTimeStr(format(now, 'HH:mm:ss'));

      if (ongoingEvent) {
        const diff = Math.max(0, Math.floor((new Date(ongoingEvent.dtend).getTime() - now.getTime()) / 1000));
        setSecondsRemaining(diff);
      } else if (upcomingEvent) {
        const diff = Math.max(0, Math.floor((new Date(upcomingEvent.dtstart).getTime() - now.getTime()) / 1000));
        setSecondsRemaining(diff);
      } else {
        setSecondsRemaining(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [ongoingEvent, upcomingEvent]);

  const formatHMS = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div
      className="w-full border shadow-tactile-sm transition-colors overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
      role="region"
      aria-label="Tableau de bord temps réel"
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch justify-between divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
        
        {/* Section Live / Prochain cours */}
        <div className="flex-1 flex items-center min-w-0 px-3.5 py-2">
          {ongoingEvent ? (
            <button
              onClick={() => onSelectEvent?.(ongoingEvent)}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group w-full"
            >
              <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-xs stamp-live">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator-pulse inline-block" />
                <span>EN COURS</span>
              </div>

              <div className="min-w-0 flex-1 truncate">
                <span className="text-xs font-700 text-[var(--text)] group-hover:underline truncate mr-2">
                  {ongoingEvent.cleanTitle}
                </span>
                {ongoingEvent.room && (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-xs border border-[var(--border-2)] text-[var(--muted)] shrink-0">
                    {ongoingEvent.room}
                  </span>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-mono font-700 text-emerald-600 dark:text-emerald-400">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                <span>-{formatHMS(secondsRemaining)}</span>
              </div>
            </button>
          ) : upcomingEvent ? (
            <button
              onClick={() => onSelectEvent?.(upcomingEvent)}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group w-full"
            >
              <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-xs stamp-badge" style={{ background: 'var(--td-bg)', borderColor: 'var(--td-bar)', color: 'var(--td-text)' }}>
                <Radio className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>PROCHAIN COURS</span>
              </div>

              <div className="min-w-0 flex-1 truncate">
                <span className="text-xs font-700 text-[var(--text)] group-hover:underline truncate mr-2">
                  {upcomingEvent.cleanTitle}
                </span>
                {upcomingEvent.room && (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-xs border border-[var(--border-2)] text-[var(--muted)] shrink-0">
                    {upcomingEvent.room}
                  </span>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-mono font-700 text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                <span>dans {formatHMS(secondsRemaining)}</span>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] py-0.5">
              <span className="w-2 h-2 rounded-full bg-[var(--border-2)]" />
              <span className="font-mono">Tous les cours programmés aujourd&apos;hui sont terminés</span>
            </div>
          )}
        </div>

        {/* Section Status & Raccourcis */}
        <div className="flex items-center justify-between sm:justify-end gap-3 px-3 py-1.5 shrink-0 bg-[var(--surface-2)]">
          {/* Horloge précise */}
          <div
            className="flex items-center gap-1 text-[11px] font-mono font-700 text-[var(--muted)]"
            suppressHydrationWarning
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{nowTimeStr || '00:00:00'}</span>
          </div>

          {/* Badges alertes rapides cliquables */}
          <div className="flex items-center gap-1.5">
            {examCount > 0 && (
              <button
                onClick={onOpenExamRadar}
                className="btn-tactile cursor-pointer flex items-center gap-1 text-[11px] font-mono font-700 px-2 py-0.5 stamp-exam"
                title={`${examCount} examen(s) prévu(s)`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>{examCount} ÉVAL</span>
              </button>
            )}

            {homeworkCount > 0 && (
              <button
                onClick={onOpenHomework}
                className="btn-tactile cursor-pointer flex items-center gap-1 text-[11px] font-mono font-700 px-2 py-0.5 border rounded-xs"
                style={{
                  background: 'var(--projet-bg)',
                  borderColor: 'var(--projet-bar)',
                  color: 'var(--projet-text)',
                  boxShadow: '1px 1px 0px 0px var(--projet-bar)',
                }}
                title={`${homeworkCount} devoir(s) à faire`}
              >
                <BookOpen className="w-3 h-3" />
                <span>{homeworkCount} DEVOIR{homeworkCount > 1 ? 'S' : ''}</span>
              </button>
            )}
          </div>

          {/* Guide touches clavier */}
          <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-[var(--muted)] pl-1">
            <span className="text-[var(--muted-2)]">Clavier :</span>
            <kbd className="px-1 py-0.2 border border-[var(--border-2)] bg-[var(--surface)] text-[var(--text)] rounded-xs">J</kbd>
            <kbd className="px-1 py-0.2 border border-[var(--border-2)] bg-[var(--surface)] text-[var(--text)] rounded-xs">S</kbd>
            <kbd className="px-1 py-0.2 border border-[var(--border-2)] bg-[var(--surface)] text-[var(--text)] rounded-xs">L</kbd>
            <kbd className="px-1 py-0.2 border border-[var(--border-2)] bg-[var(--surface)] text-[var(--text)] rounded-xs">←/→</kbd>
          </div>
        </div>

      </div>
    </div>
  );
}
