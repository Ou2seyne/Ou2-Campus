import { ScheduleEvent } from '@/types/schedule';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatIcalDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    '00Z'
  );
}

export function generateEventIcs(event: ScheduleEvent): string {
  const startDate = new Date(event.dtstart);
  const endDate = new Date(event.dtend);
  const uid = `${event.id || Date.now()}@auracampus.univ-artois.fr`;
  const now = formatIcalDate(new Date());

  const summary = `${event.cleanTitle} [${event.category}]`;
  const location = event.room || event.location || 'Faculté des Sciences de Lens';
  const description = [
    `Catégorie : ${event.category}`,
    event.teacher ? `Enseignant : ${event.teacher}` : '',
    event.groups.length > 0 ? `Groupes : ${event.groups.join(', ')}` : '',
    event.description || '',
    'Importé via Aura Campus',
  ].filter(Boolean).join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aura Campus//ADE Calendar Export//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcalDate(startDate)}`,
    `DTEND:${formatIcalDate(endDate)}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadEventIcs(event: ScheduleEvent) {
  const icsContent = generateEventIcs(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = event.cleanTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  link.download = `cours_${safeTitle}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function shareCourseEvent(event: ScheduleEvent): Promise<boolean> {
  const startDate = new Date(event.dtstart);
  const dayStr = format(startDate, 'EEEE d MMMM', { locale: fr });
  const startStr = format(startDate, 'HH:mm');
  const endStr = format(new Date(event.dtend), 'HH:mm');
  const loc = event.room || event.location || 'Salle non précisée';

  const shareText = `📚 ${event.cleanTitle} (${event.category})\n📅 ${dayStr} · ${startStr}–${endStr}\n📍 ${loc}${
    event.teacher ? `\n👤 ${event.teacher}` : ''
  }`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `${event.cleanTitle} · Aura Campus`,
        text: shareText,
      });
      return true;
    } catch {
      // User cancelled or aborted
      return false;
    }
  }

  // Fallback: clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(shareText);
    return true;
  }

  return false;
}
