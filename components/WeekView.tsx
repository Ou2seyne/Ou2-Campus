'use client';

import React, { useMemo } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { getCategoryTheme } from '@/lib/theme';
import { startOfWeek, addDays, isSameDay, format, getISOWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Coffee, Sun, Sunset, AlertTriangle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface WeekViewProps {
  selectedDate: Date;
  events: ScheduleEvent[];
  onSelectEvent: (event: ScheduleEvent) => void;
  onSelectDate: (date: Date) => void;
}

interface PositionedEvent {
  event: ScheduleEvent;
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
  isOngoing: boolean;
}

const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;
const HOUR_HEIGHT = 64; // 64px per hour (32px per 30-min slot)

/**
 * Computes pixel positioning and handles concurrent/overlapping events in a day column.
 */
function computeEventLayout(
  dayEvents: ScheduleEvent[],
  startHour: number,
  hourHeight: number
): PositionedEvent[] {
  if (dayEvents.length === 0) return [];

  const now = new Date();
  const pxPerMin = hourHeight / 60;

  const items = dayEvents.map(event => {
    const s = new Date(event.dtstart);
    const e = new Date(event.dtend);
    const startMin = (s.getHours() - startHour) * 60 + s.getMinutes();
    const durationMin = Math.max(30, event.durationMinutes || (e.getTime() - s.getTime()) / 60000);
    const endMin = startMin + durationMin;
    const isOngoing = now >= s && now <= e;

    return {
      event,
      startMin,
      endMin,
      durationMin,
      isOngoing,
      colIndex: 0,
      totalCols: 1,
    };
  });

  // Sort by start time asc, duration desc
  items.sort((a, b) => a.startMin - b.startMin || b.durationMin - a.durationMin);

  // Group overlapping events into clusters
  const clusters: typeof items[] = [];
  let currentCluster: typeof items = [];
  let clusterEnd = -1;

  for (const item of items) {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEnd = item.endMin;
    } else if (item.startMin < clusterEnd) {
      currentCluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.endMin);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = item.endMin;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Assign columns within each cluster
  for (const cluster of clusters) {
    const columns: typeof items[] = [];

    for (const item of cluster) {
      let placed = false;
      for (let colIdx = 0; colIdx < columns.length; colIdx++) {
        const lastInCol = columns[colIdx][columns[colIdx].length - 1];
        if (lastInCol.endMin <= item.startMin) {
          columns[colIdx].push(item);
          item.colIndex = colIdx;
          placed = true;
          break;
        }
      }
      if (!placed) {
        item.colIndex = columns.length;
        columns.push([item]);
      }
    }

    const totalCols = columns.length;
    for (const item of cluster) {
      item.totalCols = totalCols;
    }
  }

  return items.map(item => {
    const top = Math.max(0, item.startMin * pxPerMin);
    // 4px gap so back-to-back classes have distinct visual separation
    const height = Math.max(48, item.durationMin * pxPerMin - 4);
    const widthPercent = 100 / item.totalCols;
    const leftPercent = item.colIndex * widthPercent;

    return {
      event: item.event,
      top,
      height,
      leftPercent,
      widthPercent,
      isOngoing: item.isOngoing,
    };
  });
}

export function WeekView({ selectedDate, events, onSelectEvent, onSelectDate }: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = useMemo(
    () => Array.from({ length: 6 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekNumber = getISOWeek(selectedDate);

  // Weekly stats
  const weekEvents = useMemo(() => {
    const end = addDays(weekStart, 6);
    return events.filter(e => {
      const d = new Date(e.dtstart);
      return d >= weekStart && d <= end;
    });
  }, [events, weekStart]);

  const weekTotalMinutes = weekEvents.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const weekTotalHours = Math.floor(weekTotalMinutes / 60);
  const weekRemMinutes = weekTotalMinutes % 60;
  const weekHoursLabel = `${weekTotalHours}h${weekRemMinutes > 0 ? weekRemMinutes.toString().padStart(2, '0') : ''}`;

  const weekExamsCount = weekEvents.filter(
    e => e.category === 'EXAM' || /\bds\b|\bexam|\bpartiel|\bévaluation/i.test(`${e.summary} ${e.cleanTitle}`)
  ).length;

  // Determine time scale bounds (default 08:00 - 20:00 like ADE, or expanded if early/late classes exist)
  const { startHour, endHour, totalHours } = useMemo(() => {
    let minH = DEFAULT_START_HOUR;
    let maxH = DEFAULT_END_HOUR;

    for (const e of weekEvents) {
      const s = new Date(e.dtstart);
      const end = new Date(e.dtend);
      minH = Math.min(minH, s.getHours());
      maxH = Math.max(maxH, end.getHours() + (end.getMinutes() > 0 ? 1 : 0));
    }

    return {
      startHour: minH,
      endHour: maxH,
      totalHours: maxH - minH,
    };
  }, [weekEvents]);

  // Hours array for rendering the left axis
  const hours = useMemo(
    () => Array.from({ length: totalHours }).map((_, i) => startHour + i),
    [startHour, totalHours]
  );

  const gridTotalHeight = totalHours * HOUR_HEIGHT;

  // Current time position for live indicator
  const now = new Date();
  const nowHour = now.getHours();
  const nowMin = now.getMinutes();
  const isNowInGrid = nowHour >= startHour && nowHour < endHour;
  const nowTop = isNowInGrid ? ((nowHour - startHour) * 60 + nowMin) * (HOUR_HEIGHT / 60) : null;

  return (
    <div
      className="w-full border shadow-tactile-sm my-3 overflow-hidden rounded-xs"
      style={{
        borderColor: 'var(--border-2)',
        background: 'var(--surface)',
      }}
    >
      {/* ── 1. En-tête : Semaine & Métriques ── */}
      <div
        className="px-5 sm:px-8 py-4 sm:py-5 border-b flex flex-wrap items-center justify-between gap-4 text-xs select-none"
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-2 font-mono text-xs sm:text-sm font-black uppercase tracking-wider px-3 py-1.5 rounded-xs border border-[var(--border-2)] bg-[var(--surface)] text-[var(--text)] shrink-0 shadow-tactile-xs">
            <CalendarIcon className="w-4 h-4 text-[var(--accent)]" />
            <span>SEMAINE {weekNumber}</span>
          </span>

          <span className="font-sans font-extrabold text-base sm:text-lg text-[var(--text)] capitalize truncate tracking-tight">
            {format(days[0], 'd MMMM', { locale: fr })} – {format(days[5], 'd MMMM yyyy', { locale: fr })}
          </span>
        </div>

        {/* Métriques de la semaine */}
        <div className="flex items-center gap-3 font-mono text-xs sm:text-sm ml-auto shrink-0">
          <span className="px-3 py-1 rounded-xs border border-[var(--border)] bg-[var(--surface)] font-black text-[var(--text)]">
            {weekEvents.length} cours
          </span>
          <span className="text-[var(--border-2)]">·</span>
          <span className="text-[var(--muted)] font-bold">
            {weekHoursLabel} au total
          </span>

          {weekExamsCount > 0 && (
            <>
              <span className="text-[var(--border-2)]">·</span>
              <span
                className="inline-flex items-center gap-1.5 font-mono text-xs font-black px-2.5 py-1 rounded-xs border"
                style={{
                  background: 'var(--exam-bg)',
                  borderColor: 'var(--exam-bar)',
                  color: 'var(--exam-text)',
                }}
              >
                <AlertTriangle size={13} className="text-red-500" />
                <span>{weekExamsCount} évaluation{weekExamsCount > 1 ? 's' : ''}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── 2. Grille Timetable avec Heure Constante sur la gauche ── */}
      <div className="overflow-x-auto relative">
        <div className="min-w-[1050px] lg:min-w-full flex flex-col">
          {/* Ligne d'en-tête collante (Jours de la semaine) */}
          <div
            className="flex border-b select-none"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border-2)',
            }}
          >
            {/* Coin supérieur gauche (au-dessus de la colonne heure) */}
            <div
              className="w-16 sm:w-20 shrink-0 border-r flex flex-col items-center justify-center p-3 sticky left-0 z-50 shadow-[2px_0_6px_rgba(0,0,0,0.06)]"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <Clock className="w-4 h-4 text-[var(--accent)] mb-1" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[var(--muted)]">
                HEURE
              </span>
            </div>

            {/* En-têtes des jours */}
            <div className="flex-1 flex divide-x divide-[var(--border)]">
              {days.map((day, idx) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const dayEvents = weekEvents.filter(e => isSameDay(new Date(e.dtstart), day));
                const totalMinutes = dayEvents.reduce((acc, curr) => acc + curr.durationMinutes, 0);
                const totalHours = Math.floor(totalMinutes / 60);
                const remMinutes = totalMinutes % 60;
                const dayHoursLabel = totalMinutes > 0
                  ? `${totalHours}h${remMinutes > 0 ? remMinutes.toString().padStart(2, '0') : ''}`
                  : null;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      haptic.tap();
                      onSelectDate(day);
                    }}
                    className="flex-1 p-3 sm:p-4 border-b-2 text-left cursor-pointer transition-colors group select-none relative"
                    style={{
                      borderColor: isSelected ? 'var(--accent)' : 'transparent',
                      background: isToday ? 'var(--accent-dim)' : isSelected ? 'var(--surface-3)' : 'transparent',
                    }}
                    title="Cliquer pour afficher ce jour en vue détaillée"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div>
                        <span
                          className="text-xs font-extrabold uppercase tracking-widest block font-mono"
                          style={{
                            color: isToday ? 'var(--accent)' : 'var(--muted)',
                          }}
                        >
                          {format(day, 'EEEE', { locale: fr }).substring(0, 3)}.
                        </span>
                        <span
                          className="text-2xl sm:text-3xl font-black tabular-nums leading-none font-mono tracking-tight mt-0.5 block"
                          style={{
                            color: isToday ? 'var(--accent)' : 'var(--text)',
                          }}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {isToday ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded-xs uppercase tracking-wider text-white"
                            style={{ background: 'var(--accent)' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Aujourd&apos;hui
                          </span>
                        ) : (
                          <span
                            className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-xs border"
                            style={{
                              background: dayEvents.length > 0 ? 'var(--surface)' : 'transparent',
                              borderColor: 'var(--border)',
                              color: dayEvents.length > 0 ? 'var(--text)' : 'var(--muted-2)',
                            }}
                          >
                            {dayEvents.length > 0 ? `${dayEvents.length} cours` : 'Libre'}
                          </span>
                        )}

                        {dayHoursLabel && (
                          <span className="text-[11px] font-mono text-[var(--muted)] font-bold">
                            {dayHoursLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corps de la grille avec Heure Constante et Colonnes de Cours */}
          <div className="flex relative" style={{ height: `${gridTotalHeight}px` }}>
            {/* ── Colonne des Heures Constante (Fixée à gauche lors du scroll horizontal) ── */}
            <div
              className="w-16 sm:w-20 shrink-0 sticky left-0 z-30 select-none border-r flex flex-col shadow-[2px_0_8px_rgba(0,0,0,0.12)]"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              {hours.map(hour => (
                <div
                  key={hour}
                  className="relative flex flex-col justify-between"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  {/* Créneau pile (:00) */}
                  <div
                    className="h-1/2 relative border-t flex items-start justify-end pr-2 pt-1"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="font-mono text-xs font-black tabular-nums tracking-tight text-[var(--text)]">
                      {hour.toString().padStart(2, '0')}h00
                    </span>
                  </div>

                  {/* Créneau demi-heure (:30) */}
                  <div
                    className="h-1/2 relative border-t border-dashed flex items-start justify-end pr-2 pt-1"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="font-mono text-[10px] font-bold tabular-nums tracking-tight text-[var(--muted)]">
                      {hour.toString().padStart(2, '0')}h30
                    </span>
                  </div>
                </div>
              ))}

              {/* Ligne finale de fin (ex: 20h00) */}
              <div
                className="h-6 relative border-t flex items-start justify-end pr-2 pt-1"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="font-mono text-xs font-black tabular-nums tracking-tight text-[var(--text)]">
                  {endHour.toString().padStart(2, '0')}h00
                </span>
              </div>
            </div>

            {/* ── Colonnes des 6 Jours ── */}
            <div className="flex-1 flex divide-x divide-[var(--border)] relative">
              {days.map((day, idx) => {
                const isToday = isSameDay(day, new Date());
                const dayEvents = weekEvents
                  .filter(e => isSameDay(new Date(e.dtstart), day))
                  .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());

                const positionedEvents = computeEventLayout(dayEvents, startHour, HOUR_HEIGHT);

                const morningEvents = dayEvents.filter(e => new Date(e.dtstart).getHours() < 13);
                const afternoonEvents = dayEvents.filter(e => new Date(e.dtstart).getHours() >= 13);

                return (
                  <div
                    key={idx}
                    className="flex-1 relative transition-colors"
                    style={{
                      background: isToday ? 'var(--accent-dim)' : 'transparent',
                    }}
                  >
                    {/* Grille d'arrière-plan (lignes horaires & demi-heures) */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col">
                      {hours.map(hour => (
                        <div
                          key={hour}
                          className="relative border-t flex flex-col justify-between"
                          style={{
                            height: `${HOUR_HEIGHT}px`,
                            borderColor: 'var(--border)',
                          }}
                        >
                          <div
                            className="w-full border-t border-dashed"
                            style={{
                              marginTop: `${HOUR_HEIGHT / 2}px`,
                              borderColor: 'var(--border)',
                              opacity: 0.5,
                            }}
                          />
                        </div>
                      ))}
                      {/* Ligne finale fermante */}
                      <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                    </div>

                    {/* Laser Ligne "MAINTENANT" si c'est aujourd'hui */}
                    {isToday && nowTop !== null && (
                      <div
                        className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                        style={{ top: `${nowTop}px` }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />
                        <div className="flex-1 h-[2px] bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                        <span className="font-mono text-[10px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-xs ml-1 shadow-sm">
                          {format(now, 'HH:mm')}
                        </span>
                      </div>
                    )}

                    {/* Indicateur de journée entièrement libre */}
                    {dayEvents.length === 0 && (
                      <div
                        className="absolute left-3 right-3 p-4 rounded-xs border border-dashed flex flex-col items-center justify-center text-center select-none"
                        style={{
                          top: `${3 * HOUR_HEIGHT}px`,
                          height: `${2 * HOUR_HEIGHT}px`,
                          borderColor: 'var(--border-2)',
                          background: 'var(--surface-2)',
                        }}
                      >
                        <Coffee className="w-7 h-7 text-[var(--muted-2)] mb-2" strokeWidth={1.5} />
                        <span className="text-sm font-bold font-mono text-[var(--muted)]">Journée libre</span>
                        <span className="text-xs text-[var(--muted-2)] mt-0.5">Aucun cours au planning</span>
                      </div>
                    )}

                    {/* Indicateur matinée libre */}
                    {morningEvents.length === 0 && afternoonEvents.length > 0 && (
                      <div
                        className="absolute left-2 right-2 p-2.5 rounded-xs border border-dashed flex items-center justify-center gap-2 text-xs font-mono select-none"
                        style={{
                          top: `${(10 - startHour) * HOUR_HEIGHT}px`,
                          borderColor: 'var(--border-2)',
                          background: 'var(--surface-2)',
                          color: 'var(--muted)',
                        }}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold">Matinée libre</span>
                      </div>
                    )}

                    {/* Indicateur après-midi libre */}
                    {morningEvents.length > 0 && afternoonEvents.length === 0 && (
                      <div
                        className="absolute left-2 right-2 p-2.5 rounded-xs border border-dashed flex items-center justify-center gap-2 text-xs font-mono select-none"
                        style={{
                          top: `${(14.5 - startHour) * HOUR_HEIGHT}px`,
                          borderColor: 'var(--border-2)',
                          background: 'var(--surface-2)',
                          color: 'var(--muted)',
                        }}
                      >
                        <Sunset className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold">Après-midi libre</span>
                      </div>
                    )}

                    {/* ── Cartes de cours positionnées à leur heure réelle ── */}
                    {positionedEvents.map(({ event, top, height, leftPercent, widthPercent, isOngoing }) => {
                      const theme = getCategoryTheme(event.category);
                      const startDate = new Date(event.dtstart);
                      const endDate = new Date(event.dtend);
                      const startTime = format(startDate, 'HH:mm');
                      const endTime = format(endDate, 'HH:mm');
                      const cardH = height - 4;

                      // Thresholds (px)
                      const isMicro   = cardH < 36;   // single strip line
                      const isTiny    = cardH < 56;   // time + title 1 line
                      const isCompact = cardH < 88;   // time + title, no room

                      // Precise pixel budget for title in full mode
                      const HEADER_H = 20; // time row
                      const FOOTER_H = 20; // room row + border
                      const GAP      = 8;  // padding+gaps
                      const titleBudget = Math.max(0, cardH - HEADER_H - FOOTER_H - GAP);
                      // Each line of text: font-size 12px * line-height 1.35 ≈ 16px
                      const maxLines = Math.max(1, Math.floor(titleBudget / 16));

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            haptic.tap();
                            onSelectEvent(event);
                          }}
                          className={[
                            'absolute z-10 text-left rounded-xs border cursor-pointer select-none',
                            'transition-all duration-120 btn-tactile shadow-tactile-xs group overflow-hidden',
                            theme.catClass,
                            event.category === 'TP' ? (theme.pattern ?? '') : '',
                          ].filter(Boolean).join(' ')}
                          style={{
                            top: `${top + 2}px`,
                            height: `${cardH}px`,
                            left: `calc(${leftPercent}% + 3px)`,
                            width: `calc(${widthPercent}% - 6px)`,
                            borderColor: isOngoing ? 'var(--live-bar)' : 'var(--border-2)',
                            borderLeftWidth: '3px',
                            borderLeftColor: theme.barColor,
                            ...(isOngoing ? {
                              outline: `2px solid var(--live-bar)`,
                              outlineOffset: '-1px',
                            } : {}),
                          }}
                          title={`${event.cleanTitle} · ${startTime}–${endTime} · ${event.room || event.location || '?'}`}
                        >
                          {isMicro ? (
                            /* ── Micro : une bande, juste le titre ── */
                            <div className="h-full flex items-center px-1.5 gap-1 overflow-hidden">
                              <span
                                className="text-[9px] font-bold font-sans leading-none truncate flex-1"
                                style={{ color: 'var(--text)' }}
                              >
                                {event.cleanTitle}
                              </span>
                            </div>

                          ) : isTiny ? (
                            /* ── Tiny : heure + titre 1 ligne ── */
                            <div className="h-full flex items-center px-2 gap-1.5 overflow-hidden">
                              <span
                                className="text-[10px] font-black font-mono tabular-nums shrink-0"
                                style={{ color: isOngoing ? 'var(--live-text)' : 'var(--text)', opacity: 0.8 }}
                              >
                                {startTime}
                              </span>
                              <span
                                className="text-[11px] font-bold font-sans leading-none truncate flex-1"
                                style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
                              >
                                {event.cleanTitle}
                              </span>
                              <span className={`shrink-0 text-[8px] font-black px-1 rounded-xs font-mono uppercase leading-4 ${theme.badgeClass}`}>
                                {theme.shortLabel}
                              </span>
                            </div>

                          ) : isCompact ? (
                            /* ── Compact : heure+badge / titre 2 lignes ── */
                            <div className="h-full flex flex-col justify-start px-2 pt-1.5 pb-1 gap-1 overflow-hidden">
                              <div className="flex items-center justify-between gap-1 shrink-0">
                                <span
                                  className="text-[10px] font-mono font-black tabular-nums flex items-center gap-1 leading-none"
                                  style={{ color: isOngoing ? 'var(--live-text)' : 'var(--text)' }}
                                >
                                  {isOngoing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0" />}
                                  {startTime}–{endTime}
                                </span>
                                <span className={`shrink-0 text-[8px] font-extrabold px-1.5 rounded-xs font-mono uppercase leading-4 ${theme.badgeClass}`}>
                                  {theme.shortLabel}
                                </span>
                              </div>
                              <p
                                className="text-[11px] font-extrabold leading-[1.3] font-sans overflow-hidden text-[var(--text)]"
                                style={{
                                  letterSpacing: '-0.01em',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {event.cleanTitle}
                              </p>
                            </div>

                          ) : (
                            /* ── Complet : header | titre flex-1 | footer salle ── */
                            <div className="h-full flex flex-col px-2.5 overflow-hidden" style={{ paddingTop: '6px', paddingBottom: '4px', gap: '4px' }}>
                              {/* Header */}
                              <div className="flex items-center justify-between gap-1 shrink-0" style={{ height: `${HEADER_H}px` }}>
                                <span
                                  className="text-[11px] font-mono font-black tabular-nums flex items-center gap-1 leading-none"
                                  style={{ color: isOngoing ? 'var(--live-text)' : 'var(--text)' }}
                                >
                                  <Clock size={10} className="opacity-40 shrink-0" />
                                  {startTime}–{endTime}
                                  {isOngoing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {event.category === 'EXAM' && (
                                    <span className="stamp-exam text-[8px] px-1 py-px">DS</span>
                                  )}
                                  <span className={`text-[8px] font-extrabold px-1.5 rounded-xs font-mono uppercase leading-4 ${theme.badgeClass}`}>
                                    {theme.shortLabel}
                                  </span>
                                </div>
                              </div>

                              {/* Titre — hauteur calculée avec max-lines CSS vars */}
                              <div
                                className="overflow-hidden flex-1"
                                style={{ maxHeight: `${titleBudget}px` }}
                              >
                                <p
                                  className="text-[12px] font-extrabold font-sans text-[var(--text)] overflow-hidden"
                                  style={{
                                    letterSpacing: '-0.015em',
                                    lineHeight: '1.35',
                                    display: '-webkit-box',
                                    WebkitLineClamp: maxLines,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {event.cleanTitle}
                                </p>
                              </div>

                              {/* Footer salle */}
                              <div
                                className="flex items-center gap-1 shrink-0 border-t border-[var(--border)]/25"
                                style={{ height: `${FOOTER_H}px`, paddingTop: '3px' }}
                              >
                                <MapPin className="w-2.5 h-2.5 text-[var(--accent)] shrink-0" strokeWidth={2.5} />
                                <span className="text-[10px] font-bold font-mono truncate text-[var(--muted)] flex-1">
                                  {event.room || event.location || '—'}
                                </span>
                                {event.subGroup && (
                                  <span
                                    className="ml-auto text-[8px] font-bold font-mono px-1 rounded-xs border shrink-0 leading-4"
                                    style={{
                                      background: 'var(--surface-3)',
                                      borderColor: 'var(--border)',
                                      color: 'var(--text-2)',
                                    }}
                                  >
                                    {event.subGroup}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
