'use client';

import React from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { CourseCard } from './CourseCard';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface ListViewProps {
  events: ScheduleEvent[];
  onSelectEvent: (event: ScheduleEvent) => void;
  searchQuery?: string;
  onFilterTeacher?: (teacher: string) => void;
  onFilterRoom?: (room: string) => void;
}

export function ListView({
  events,
  onSelectEvent,
  searchQuery = '',
  onFilterTeacher,
  onFilterRoom,
}: ListViewProps) {
  const groupedEvents = React.useMemo(() => {
    const groups: { date: Date; dateStr: string; items: ScheduleEvent[] }[] = [];
    events.forEach(event => {
      const eventDate = new Date(event.dtstart);
      const existing  = groups.find(g => isSameDay(g.date, eventDate));
      if (existing) {
        existing.items.push(event);
      } else {
        groups.push({
          date: eventDate,
          dateStr: format(eventDate, 'yyyy-MM-dd'),
          items: [event],
        });
      }
    });
    return groups;
  }, [events]);

  if (events.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-start gap-3 p-6 border my-2"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--muted)',
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span className="text-sm font-600" style={{ fontWeight: 600, color: 'var(--text)' }}>
            Aucun cours trouvé
          </span>
        </div>
        <p className="text-xs">
          Modifiez les filtres ou vérifiez que votre emploi du temps est bien chargé.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full my-2 border shadow-tactile-sm" style={{ borderColor: 'var(--border-2)', background: 'var(--surface)' }}>
      {groupedEvents.map(group => {
        const isToday         = isSameDay(group.date, new Date());
        const formattedHeader = format(group.date, 'EEEE d MMMM yyyy', { locale: fr });

        return (
          <div key={group.dateStr}>
            {/* En-tête de groupe (Spacieux) */}
            <div
              className="flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 border-b border-t"
              style={{
                background: isToday ? 'var(--accent-dim)' : 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <span
                className="text-base sm:text-lg md:text-xl font-black capitalize tracking-tight"
                style={{
                  color: isToday ? 'var(--accent)' : 'var(--text)',
                }}
              >
                {formattedHeader}
              </span>
              {isToday && (
                <span
                  className="text-xs font-black px-2.5 py-0.5 rounded-xs uppercase tracking-wider font-mono text-white"
                  style={{
                    background: 'var(--accent)',
                  }}
                >
                  aujourd&apos;hui
                </span>
              )}
              <span
                className="text-xs sm:text-sm md:text-base ml-auto tabular-nums font-mono font-bold text-[var(--muted)]"
              >
                {group.items.length} cours
              </span>
            </div>

            {/* Cours du groupe */}
            <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
              {group.items.map(event => (
                <div
                  key={event.id}
                  className="rounded-xs"
                >
                  <CourseCard
                    event={event}
                    onClick={() => onSelectEvent(event)}
                    searchQuery={searchQuery}
                    onFilterTeacher={onFilterTeacher}
                    onFilterRoom={onFilterRoom}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
