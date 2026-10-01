'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent, HomeworkItem } from '@/types/schedule';
import { format, isToday, differenceInMinutes, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { CourseCard } from './CourseCard';

interface DailyBriefingCardProps {
  events: ScheduleEvent[];
  homeworks?: HomeworkItem[];
  selectedDate: Date;
  onSelectEvent?: (event: ScheduleEvent) => void;
  onOpenHomework?: () => void;
  onOpenExamRadar?: () => void;
}

export function DailyBriefingCard({
  events,
  homeworks = [],
  selectedDate,
  onSelectEvent,
  onOpenHomework,
  onOpenExamRadar,
}: DailyBriefingCardProps) {
  const [nowTimestamp, setNowTimestamp] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Sort events by dtstart
  const dayEvents = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime()
    );
  }, [events]);

  const isCurrentDay = isToday(selectedDate);

  // Find ongoing event, upcoming events, finished events
  const { ongoingEvent, upcomingEvent, completedEvents } = useMemo<{
    ongoingEvent: ScheduleEvent | null;
    upcomingEvent: ScheduleEvent | null;
    completedEvents: ScheduleEvent[];
  }>(() => {
    if (!isCurrentDay) {
      return {
        ongoingEvent: null,
        upcomingEvent: dayEvents[0] || null,
        completedEvents: [],
      };
    }
    const nowMs = nowTimestamp;
    let ongoing: ScheduleEvent | null = null;
    let upcoming: ScheduleEvent | null = null;
    const completed: ScheduleEvent[] = [];

    dayEvents.forEach(e => {
      const startMs = new Date(e.dtstart).getTime();
      const endMs = new Date(e.dtend).getTime();

      if (nowMs >= startMs && nowMs <= endMs) {
        ongoing = e;
      } else if (nowMs < startMs) {
        if (!upcoming) upcoming = e;
      } else if (nowMs > endMs) {
        completed.push(e);
      }
    });

    return {
      ongoingEvent: ongoing,
      upcomingEvent: upcoming,
      completedEvents: completed,
    };
  }, [dayEvents, isCurrentDay, nowTimestamp]);

  // Total volume calculation
  const totalVolumeFormatted = useMemo(() => {
    let totalMinutes = 0;
    dayEvents.forEach(e => {
      const start = new Date(e.dtstart);
      const end = new Date(e.dtend);
      totalMinutes += Math.max(0, differenceInMinutes(end, start));
    });
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0 && mins === 0) return '0h';
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }, [dayEvents]);

  // Urgent homework for today's courses
  const urgentHomeworks = useMemo(() => {
    const todayTitles = new Set(dayEvents.map(e => e.cleanTitle.toLowerCase()));
    return homeworks.filter(h => {
      if (h.isDone) return false;
      const matchCourse = todayTitles.has(h.courseTitle.toLowerCase());
      const isDueSoon = h.dueDate && Math.abs(differenceInMinutes(parseISO(h.dueDate), new Date(nowTimestamp))) <= 48 * 60;
      return matchCourse || isDueSoon;
    });
  }, [dayEvents, homeworks, nowTimestamp]);

  // Check exams today
  const examsToday = useMemo(() => {
    return dayEvents.filter(
      e => e.category === 'EXAM' || /\bds\b|\bexam|\bpartiel|\bévaluation/i.test(`${e.summary} ${e.cleanTitle}`)
    );
  }, [dayEvents]);

  if (dayEvents.length === 0) {
    return null; // Handled directly in timeline view empty state
  }

  const activeFocusEvent = ongoingEvent || upcomingEvent;
  const allDoneToday = isCurrentDay && !ongoingEvent && !upcomingEvent && completedEvents.length > 0;

  return (
    <div
      className="w-full border rounded-xs transition-colors shadow-tactile-sm overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
    >
      {/* 1. Header Bar (Spacious Masthead) */}
      <div
        className="px-5 sm:px-7 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{
          background: 'var(--surface-2)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-2 text-xs sm:text-sm font-mono font-black uppercase tracking-wider px-3 py-1.5 rounded-xs border border-[var(--border-2)] bg-[var(--surface)] text-[var(--text)] shrink-0 shadow-tactile-xs">
            {ongoingEvent ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <Clock className="w-4 h-4 text-amber-500" />
            )}
            <span>{ongoingEvent ? 'COURS EN DIRECT' : 'PROCHAIN COURS'}</span>
          </span>

          <span className="text-sm sm:text-base font-mono font-bold text-[var(--muted)] capitalize truncate">
            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
          </span>
        </div>

        {/* Totals & progress */}
        <div className="flex items-center gap-2.5 font-mono text-xs sm:text-sm ml-auto shrink-0">
          <span className="px-3.5 py-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface-3)] font-black text-[var(--text)] flex items-center gap-2">
            <span>{dayEvents.length} cours</span>
            <span className="opacity-40">·</span>
            <span className="text-[var(--muted)] font-bold">{totalVolumeFormatted}</span>
          </span>
          {isCurrentDay && completedEvents.length > 0 && (
            <span className="px-3.5 py-1.5 rounded-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black">
              {completedEvents.length}/{dayEvents.length} faits
            </span>
          )}
        </div>
      </div>

      {/* 2. Carte du cours en question (Hero Spotlight avec espace très généreux) */}
      {activeFocusEvent && (
        <div className="p-4 sm:p-6 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <CourseCard
            event={activeFocusEvent}
            onClick={() => onSelectEvent?.(activeFocusEvent)}
            hideInlineTime={false}
            hero={true}
          />
        </div>
      )}

      {/* 3. Journée terminée banner */}
      {allDoneToday && (
        <div
          className="border-t px-5 sm:px-7 py-4.5 flex items-center gap-3 text-sm font-mono"
          style={{
            background: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.25)',
            color: '#15803D',
          }}
        >
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <span className="font-black">JOURNÉE ACHEVÉE</span>
          <span className="opacity-80 text-xs sm:text-sm font-sans">
            — Tous les cours d&apos;aujourd&apos;hui sont terminés. Bon repos !
          </span>
        </div>
      )}

      {/* 4. Alertes Évaluations ou Devoirs (si présents) */}
      {(examsToday.length > 0 || urgentHomeworks.length > 0) && (
        <div
          className="border-t px-5 sm:px-7 py-3 flex flex-wrap items-center gap-3 text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          {examsToday.length > 0 && (
            <button
              onClick={onOpenExamRadar}
              className="btn-tactile inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-mono font-black border cursor-pointer"
              style={{
                background: 'var(--exam-bg)',
                borderColor: 'var(--exam-bar)',
                color: 'var(--exam-text)',
              }}
            >
              <AlertTriangle size={14} className="text-red-500" />
              <span>{examsToday.length} ÉVALUATION{examsToday.length > 1 ? 'S' : ''} AUJOURD&apos;HUI</span>
            </button>
          )}

          {urgentHomeworks.length > 0 && (
            <button
              onClick={onOpenHomework}
              className="btn-tactile inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-mono font-black border cursor-pointer ml-auto"
              style={{
                background: 'var(--projet-bg)',
                borderColor: 'var(--projet-bar)',
                color: 'var(--projet-text)',
              }}
            >
              <BookOpen size={14} className="text-purple-500" />
              <span>{urgentHomeworks.length} DEVOIR{urgentHomeworks.length > 1 ? 'S' : ''} À RENDRE</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
