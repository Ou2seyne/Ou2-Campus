'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { format, differenceInDays, differenceInMinutes, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, X } from 'lucide-react';
import { Stamp } from '@/components/ui/Stamp';

export interface ContextBannerProps {
  events: ScheduleEvent[];
  lastFetchedAt?: string | null;
  onOpenExamRadar?: () => void;
  onSelectEvent?: (event: ScheduleEvent) => void;
}

/**
 * ContextBanner — static, accessible, dismissible status banner.
 * Replaces the distracting marquee ticker with an informative editorial dispatch.
 * Conforms to WCAG 2.2: aria-live="polite", role="status", dismissible.
 */
export function ContextBanner({
  events,
  lastFetchedAt,
  onOpenExamRadar,
  onSelectEvent,
}: ContextBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Compute current ongoing course or nearest upcoming exam
  const context = useMemo(() => {
    const now = nowTimestamp;

    // 1. Ongoing course
    const ongoing = events.find((e) => {
      const start = new Date(e.dtstart).getTime();
      const end = new Date(e.dtend).getTime();
      return now >= start && now <= end;
    });

    if (ongoing) {
      const end = new Date(ongoing.dtend).getTime();
      const minsLeft = Math.max(1, Math.round((end - now) / 60000));
      return {
        type: 'ongoing' as const,
        event: ongoing,
        message: `Séance en cours : ${ongoing.cleanTitle}${ongoing.room ? ` en ${ongoing.room}` : ''}`,
        detail: `Fin dans ${minsLeft} min`,
      };
    }

    // 2. Next exam in the next 14 days
    const upcomingExams = events
      .filter((e) => {
        const isExam =
          e.category === 'EXAM' ||
          /\bds\b|\bexam|\bpartiel|\bévaluation/i.test(`${e.summary} ${e.cleanTitle}`);
        return isExam && new Date(e.dtstart).getTime() > now;
      })
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());

    if (upcomingExams.length > 0) {
      const nextExam = upcomingExams[0];
      const start = new Date(nextExam.dtstart);
      const days = differenceInDays(start, new Date(now));
      const hours = Math.round(differenceInMinutes(start, new Date(now)) / 60);

      const timeText =
        days === 0
          ? `aujourd'hui dans ${hours}h`
          : days === 1
          ? 'demain'
          : `dans ${days} jours`;

      return {
        type: 'exam' as const,
        event: nextExam,
        message: `Prochain DS ${timeText} : ${nextExam.cleanTitle}`,
        detail: format(start, 'EEEE d MMM · HH:mm', { locale: fr }),
      };
    }

    // 3. Fallback: all good, or freshness info
    let fetchLabel = '';
    if (lastFetchedAt) {
      try {
        fetchLabel = `Données du ${format(parseISO(lastFetchedAt), 'd MMM à HH:mm', { locale: fr })}`;
      } catch {
        fetchLabel = 'Planning synchronisé';
      }
    }

    return {
      type: 'idle' as const,
      event: null,
      message: 'Cockpit académique à jour',
      detail: fetchLabel || 'Aucune alerte critique',
    };
  }, [events, nowTimestamp, lastFetchedAt]);

  if (isDismissed) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="w-full border-b select-none no-print transition-colors"
      style={{
        background:
          context.type === 'exam'
            ? 'var(--exam-bg)'
            : context.type === 'ongoing'
            ? 'var(--live-bg)'
            : 'var(--surface-2)',
        borderColor:
          context.type === 'exam'
            ? 'var(--exam-bar)'
            : context.type === 'ongoing'
            ? 'var(--live-bar)'
            : 'var(--border)',
        color:
          context.type === 'exam'
            ? 'var(--exam-text)'
            : context.type === 'ongoing'
            ? 'var(--live-text)'
            : 'var(--text-2)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {context.type === 'ongoing' ? (
            <Stamp variant="live">LIVE</Stamp>
          ) : context.type === 'exam' ? (
            <Stamp variant="exam">ÉVALUATION</Stamp>
          ) : (
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
          )}

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
            {context.event ? (
              <button
                type="button"
                onClick={() => {
                  if (context.type === 'exam' && onOpenExamRadar) onOpenExamRadar();
                  else if (context.event && onSelectEvent) onSelectEvent(context.event);
                }}
                className="font-sans font-700 hover:underline text-left cursor-pointer truncate"
              >
                {context.message}
              </button>
            ) : (
              <span className="font-sans font-700">{context.message}</span>
            )}

            <span className="font-mono text-[11px] opacity-80">
              · {context.detail}
            </span>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Masquer cette bannière"
          className="btn-tactile p-1 rounded-xs opacity-70 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
          title="Masquer"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
