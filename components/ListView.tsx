'use client';

import React, { useMemo } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { CourseCard } from './CourseCard';
import { format, isSameDay, getISOWeek, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';

interface ListViewProps {
  events: ScheduleEvent[];
  onSelectEvent: (event: ScheduleEvent) => void;
  searchQuery?: string;
  onFilterTeacher?: (teacher: string) => void;
  onFilterRoom?: (room: string) => void;
  pendingByCourse?: Record<string, number>;
  onAddHomework?: (courseTitle: string) => void;
}

interface DayGroup {
  date: Date;
  dateStr: string;
  weekNumber: number;
  totalHoursLabel: string;
  items: ScheduleEvent[];
}

export function ListView({
  events,
  onSelectEvent,
  searchQuery = '',
  onFilterTeacher,
  onFilterRoom,
  pendingByCourse = {},
  onAddHomework,
}: ListViewProps) {
  const groupedEvents = useMemo(() => {
    const groups: DayGroup[] = [];

    // Sort all events chronologically first
    const sorted = [...events].sort(
      (a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime()
    );

    sorted.forEach(event => {
      const eventDate = new Date(event.dtstart);
      const existing = groups.find(g => isSameDay(g.date, eventDate));
      if (existing) {
        existing.items.push(event);
      } else {
        groups.push({
          date: eventDate,
          dateStr: format(eventDate, 'yyyy-MM-dd'),
          weekNumber: getISOWeek(eventDate),
          totalHoursLabel: '',
          items: [event],
        });
      }
    });

    // Compute total duration per day group
    groups.forEach(g => {
      let totalMins = 0;
      g.items.forEach(item => {
        const s = new Date(item.dtstart);
        const e = new Date(item.dtend);
        totalMins += Math.max(0, differenceInMinutes(e, s));
      });
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      g.totalHoursLabel = `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : '00'}`;
    });

    return groups;
  }, [events]);

  if (events.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-start gap-3 p-6 sm:p-8 border my-3 rounded-xs shadow-tactile-sm"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border-2)',
          borderLeft: '4px solid var(--accent)',
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 shrink-0 text-[var(--accent)]" strokeWidth={2} />
          <span className="text-sm sm:text-base font-extrabold" style={{ color: 'var(--text)' }}>
            Aucun cours trouvé dans la liste
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted)]">
          Modifiez vos filtres ou vérifiez que votre flux ADE est convenablement configuré.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full my-3 border rounded-xs shadow-tactile-sm overflow-hidden"
      style={{
        borderColor: 'var(--border-2)',
        background: 'var(--surface)',
      }}
    >
      {groupedEvents.map((group) => {
        const isCurrentDay = isSameDay(group.date, new Date());
        const formattedDate = format(group.date, 'EEEE d MMMM yyyy', { locale: fr });

        return (
          <section
            key={group.dateStr}
            className="border-b last:border-b-0"
            style={{
              borderColor: 'var(--border)',
              // Performance optimization for semester virtualization:
              contentVisibility: 'auto',
              containIntrinsicSize: '1px 320px',
            }}
          >
            {/* ── En-tête de jour STICKY en Geist Mono Caps ── */}
            <div
              className="sticky top-[60px] z-20 px-4 sm:px-6 py-2.5 sm:py-3 border-b flex flex-wrap items-center justify-between gap-2.5 font-mono select-none"
              style={{
                background: isCurrentDay ? 'var(--accent-dim)' : 'var(--surface-2)',
                borderColor: isCurrentDay ? 'var(--accent)' : 'var(--border)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Jour & Date */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-xs shrink-0"
                  style={{ background: isCurrentDay ? 'var(--accent)' : 'var(--border-strong)' }}
                />
                <h3
                  className="text-xs sm:text-sm font-black uppercase tracking-[0.06em] truncate"
                  style={{
                    color: isCurrentDay ? 'var(--accent)' : 'var(--text)',
                  }}
                >
                  {formattedDate}
                </h3>

                {isCurrentDay && (
                  <span
                    className="text-[10px] font-mono font-black px-2 py-0.5 rounded-xs uppercase tracking-wider text-white shrink-0"
                    style={{ background: 'var(--accent)' }}
                  >
                    Aujourd&apos;hui
                  </span>
                )}
              </div>

              {/* Métriques horaires de la journée */}
              <div className="flex items-center gap-2.5 text-xs ml-auto shrink-0">
                <span className="flex items-center gap-1 font-bold text-[var(--muted)]">
                  <Clock size={12} className="text-[var(--accent)]" />
                  <span className="tabular-nums">{group.totalHoursLabel}</span>
                </span>
                <span className="text-[var(--border-2)]">·</span>
                <span className="px-2 py-0.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] font-black text-[var(--text)] tabular-nums">
                  {group.items.length} cours
                </span>
                <span className="text-[var(--border-2)] hidden sm:inline">·</span>
                <span className="text-[var(--muted-2)] font-bold text-[11px] hidden sm:inline">
                  SEM. {group.weekNumber}
                </span>
              </div>
            </div>

            {/* ── Cartes de cours de la journée ── */}
            <div className="p-3.5 sm:p-5 space-y-3">
              {group.items.map(event => (
                <div key={event.id}>
                  <CourseCard
                    event={event}
                    onClick={() => onSelectEvent(event)}
                    searchQuery={searchQuery}
                    onFilterTeacher={onFilterTeacher}
                    onFilterRoom={onFilterRoom}
                    pendingHomeworkCount={pendingByCourse[event.cleanTitle] || 0}
                    onAddHomework={onAddHomework}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
