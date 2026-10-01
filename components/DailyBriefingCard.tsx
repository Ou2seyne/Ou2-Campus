'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ScheduleEvent, HomeworkItem } from '@/types/schedule';
import { format, isToday, differenceInMinutes, parseISO, getISOWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  User,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { getCategoryTheme } from '@/lib/theme';
import { getLensCampusInfo } from '@/lib/campus';
import { haptic } from '@/lib/haptics';

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
  const [nowTimestamp, setNowTimestamp] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Sort events chronologically
  const dayEvents = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime()
    );
  }, [events]);

  const isCurrentDay = isToday(selectedDate);
  const weekNum = getISOWeek(selectedDate);

  // Find ongoing event, upcoming events, completed events
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

  // Urgent homework
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
    return null;
  }

  const activeFocusEvent = ongoingEvent || upcomingEvent;
  const allDoneToday = isCurrentDay && !ongoingEvent && !upcomingEvent && completedEvents.length > 0;

  // Countdown calculations for the big display counter
  let countdownLabel = 'DÉBUT';
  let countdownDisplay = '—';
  let countdownUnit = '';

  if (ongoingEvent) {
    const endMs = new Date(ongoingEvent.dtend).getTime();
    const remainingMins = Math.max(1, Math.round((endMs - nowTimestamp) / 60000));
    const hours = Math.floor(remainingMins / 60);
    const mins = remainingMins % 60;

    countdownLabel = 'FIN DU COURS DANS';
    if (hours > 0) {
      countdownDisplay = `${hours}h${mins.toString().padStart(2, '0')}`;
      countdownUnit = 'RESTANT';
    } else {
      countdownDisplay = `${mins}`;
      countdownUnit = 'MIN RESTANTES';
    }
  } else if (upcomingEvent && isCurrentDay) {
    const startMs = new Date(upcomingEvent.dtstart).getTime();
    const untilMins = Math.max(0, Math.round((startMs - nowTimestamp) / 60000));
    const hours = Math.floor(untilMins / 60);
    const mins = untilMins % 60;

    countdownLabel = 'PROCHAIN COURS DANS';
    if (hours > 0) {
      countdownDisplay = `${hours}h${mins.toString().padStart(2, '0')}`;
      countdownUnit = 'D\'ATTENTE';
    } else {
      countdownDisplay = `${mins}`;
      countdownUnit = 'MINUTES';
    }
  } else if (activeFocusEvent && !isCurrentDay) {
    const start = new Date(activeFocusEvent.dtstart);
    countdownLabel = 'PREMIER COURS DU JOUR';
    countdownDisplay = format(start, 'HH:mm');
    countdownUnit = 'DÉBUT';
  }

  // Decoded campus room
  const campusLocation = activeFocusEvent
    ? getLensCampusInfo(activeFocusEvent.room, activeFocusEvent.location)
    : null;

  const focusTheme = activeFocusEvent ? getCategoryTheme(activeFocusEvent.category) : null;

  return (
    <section
      aria-label="Une de journal quotidienne"
      className="w-full border rounded-xs transition-colors shadow-tactile-sm overflow-hidden my-3 relative"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
    >
      {/* ── 1. Masthead éditorial de la Gazette (Double Filet Signature) ── */}
      <div
        className="px-4 sm:px-6 py-2.5 sm:py-3 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono select-none"
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border)',
        }}
      >
        {/* En-tête typographique de presse */}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[var(--text)]">
          <span className="w-2 h-2 bg-[var(--accent)] rounded-xs shrink-0" />
          <span className="tracking-[0.08em]">
            ÉDITION DU {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }).toUpperCase()}
          </span>
          <span className="text-[var(--border-2)]">·</span>
          <span className="text-[var(--muted)] font-bold">SEM. {weekNum}</span>
        </div>

        {/* Volume & État du jour */}
        <div className="flex items-center gap-2 text-xs ml-auto">
          <span className="px-2.5 py-0.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] font-black text-[var(--text)]">
            {dayEvents.length} cours
          </span>
          <span className="text-[var(--muted)] font-bold">{totalVolumeFormatted}</span>
          {isCurrentDay && completedEvents.length > 0 && (
            <span className="px-2 py-0.5 rounded-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-[11px]">
              {completedEvents.length}/{dayEvents.length} faits
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Grand panneau de la Une : Compteur Display + Spotlight Cours ── */}
      {activeFocusEvent && (
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Bloc Compteur Display Géant (Col 1-5 sur desktop) */}
          <div
            className="md:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xs border select-none relative overflow-hidden"
            style={{
              background: ongoingEvent ? 'var(--live-bg)' : 'var(--surface-2)',
              borderColor: ongoingEvent ? 'var(--live-bar)' : 'var(--border-2)',
            }}
          >
            {ongoingEvent && <div className="scanline-live" aria-hidden="true" />}

            {/* Label de statut */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.08em] flex items-center gap-2"
                style={{ color: ongoingEvent ? 'var(--live-text)' : 'var(--muted)' }}
              >
                {ongoingEvent ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>EN COURS D&apos;INSTRUCTION</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} className="text-amber-500 shrink-0" />
                    <span>{countdownLabel}</span>
                  </>
                )}
              </span>

              {focusTheme && (
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-xs uppercase ${focusTheme.badgeClass}`}>
                  {focusTheme.shortLabel}
                </span>
              )}
            </div>

            {/* Grand Compteur Display en Geist Mono */}
            <div className="my-2 sm:my-3">
              <div className="flex items-baseline gap-2">
                <span
                  className="font-mono font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter tabular-nums leading-none"
                  style={{
                    color: ongoingEvent ? 'var(--live-text)' : 'var(--text)',
                  }}
                >
                  {countdownDisplay}
                </span>
                <span
                  className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase"
                  style={{ color: ongoingEvent ? 'var(--live-text)' : 'var(--muted)' }}
                >
                  {countdownUnit}
                </span>
              </div>

              {ongoingEvent && (
                <div className="w-full bg-[var(--border)] h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(5, Math.round(
                        ((nowTimestamp - new Date(ongoingEvent.dtstart).getTime()) /
                          (new Date(ongoingEvent.dtend).getTime() - new Date(ongoingEvent.dtstart).getTime())) * 100
                      )))}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Horaires précis en bas du bloc compteur */}
            <div className="pt-2 border-t border-[var(--border)]/40 flex items-center justify-between text-xs font-mono font-bold text-[var(--muted)]">
              <span>Début : {format(new Date(activeFocusEvent.dtstart), 'HH:mm')}</span>
              <span>Fin : {format(new Date(activeFocusEvent.dtend), 'HH:mm')}</span>
            </div>
          </div>

          {/* Bloc Détails Électroniques du Cours (Col 6-12) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              haptic.tap();
              onSelectEvent?.(activeFocusEvent);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectEvent?.(activeFocusEvent);
              }
            }}
            className="md:col-span-7 flex flex-col justify-between p-4 sm:p-5 rounded-xs border group cursor-pointer transition-all duration-120 btn-tactile shadow-tactile-xs"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-2)',
            }}
          >
            <div>
              {/* En-tête titre avec sous-groupe ou pastille */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-[var(--muted)]">
                  {format(new Date(activeFocusEvent.dtstart), 'HH:mm')} — {format(new Date(activeFocusEvent.dtend), 'HH:mm')}
                </span>
                <span className="text-xs font-mono text-[var(--muted-2)] font-bold">
                  ({activeFocusEvent.durationMinutes} min)
                </span>
                {activeFocusEvent.subGroup && (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-xs border bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)]">
                    {activeFocusEvent.subGroup}
                  </span>
                )}
                {activeFocusEvent.category === 'EXAM' && (
                  <span className="stamp-exam text-[10px] py-0.5">ÉVALUATION</span>
                )}
              </div>

              {/* Titre du cours principal */}
              <h2 className="text-lg sm:text-xl font-extrabold font-sans leading-snug tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                {activeFocusEvent.cleanTitle}
              </h2>
            </div>

            {/* Salle décodée du Campus + Professeur */}
            <div className="pt-4 mt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex flex-col gap-1">
                {/* Salle décodée façon cockpit */}
                <div className="inline-flex items-center gap-2 font-mono font-black text-[var(--text)] bg-[var(--surface-2)] px-2.5 py-1 rounded-xs border border-[var(--border-2)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" strokeWidth={2.5} />
                  <span>
                    {campusLocation?.badge || activeFocusEvent.room || activeFocusEvent.location || 'Salle non précisée'}
                  </span>
                </div>

                {/* Détails bâtiment / étage si disponible */}
                {campusLocation?.floor && (
                  <span className="text-[11px] font-mono text-[var(--muted)] pl-1">
                    {campusLocation.building} · {campusLocation.floor}
                  </span>
                )}
              </div>

              {/* Professeur et appel à l'action */}
              <div className="flex items-center gap-3 ml-auto">
                {activeFocusEvent.teacher && (
                  <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-[var(--muted)] text-xs">
                    <User size={14} strokeWidth={2} />
                    <span>{activeFocusEvent.teacher}</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-[var(--accent)] group-hover:translate-x-0.5 transition-transform">
                  <span>Détails</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Bandeau Journée Terminée (si tous les cours sont finis) ── */}
      {allDoneToday && (
        <div
          className="border-t px-5 sm:px-7 py-4 flex items-center justify-between gap-3 text-sm font-mono select-none"
          style={{
            background: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.25)',
            color: '#15803D',
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            <div>
              <span className="font-black block sm:inline">JOURNÉE ACHEVÉE</span>
              <span className="opacity-90 text-xs sm:text-sm font-sans sm:ml-2">
                — Tous les cours d&apos;aujourd&apos;hui sont terminés.
              </span>
            </div>
          </div>
          <span className="text-xs font-black uppercase px-2.5 py-1 rounded-xs border border-emerald-500/30 bg-emerald-500/10">
            {completedEvents.length}/{dayEvents.length} Terminé
          </span>
        </div>
      )}

      {/* ── 4. Barre d'Alertes Éditoriale : Examens & Devoirs ── */}
      {(examsToday.length > 0 || urgentHomeworks.length > 0) && (
        <div
          className="border-t px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-[var(--muted)]">
              ALERTES DU JOUR
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap ml-auto">
            {examsToday.length > 0 && (
              <button
                type="button"
                onClick={onOpenExamRadar}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-mono font-black border cursor-pointer"
                style={{
                  background: 'var(--exam-bg)',
                  borderColor: 'var(--exam-bar)',
                  color: 'var(--exam-text)',
                }}
              >
                <AlertTriangle size={13} className="text-red-500" />
                <span>{examsToday.length} ÉVALUATION{examsToday.length > 1 ? 'S' : ''} AUJOURD&apos;HUI</span>
              </button>
            )}

            {urgentHomeworks.length > 0 && (
              <button
                type="button"
                onClick={onOpenHomework}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-mono font-black border cursor-pointer"
                style={{
                  background: 'var(--projet-bg)',
                  borderColor: 'var(--projet-bar)',
                  color: 'var(--projet-text)',
                }}
              >
                <BookOpen size={13} className="text-purple-500" />
                <span>{urgentHomeworks.length} DEVOIR{urgentHomeworks.length > 1 ? 'S' : ''} À RENDRE</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
