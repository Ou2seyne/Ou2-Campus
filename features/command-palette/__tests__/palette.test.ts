import { describe, it, expect } from 'vitest';
import type { ScheduleEvent } from '@/types/schedule';

describe('Command Palette & Navigation Logic', () => {
  const sampleEvents: ScheduleEvent[] = [
    {
      id: 'event-1',
      summary: 'Algorithmique TD2',
      cleanTitle: 'Algorithmique',
      description: 'TD Algorithmique avancée',
      location: 'Faculté des Sciences',
      room: 'D004',
      teacher: 'M. Dupont',
      dtstart: new Date(Date.now() + 3600000).toISOString(),
      dtend: new Date(Date.now() + 7200000).toISOString(),
      durationMinutes: 60,
      category: 'TD',
      groups: ['L1 Maths-Info', 'TD2', 'TP 2-2'],
    },
    {
      id: 'event-2',
      summary: 'Contrôle Continu Mathématiques',
      cleanTitle: 'Mathématiques Discrètes',
      description: 'DS Examen écrit',
      location: 'Grand Amphi',
      room: 'Amphi Souriau',
      teacher: 'Mme Martin',
      dtstart: new Date(Date.now() + 86400000 * 2).toISOString(),
      dtend: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
      durationMinutes: 120,
      category: 'EXAM',
      groups: ['L1 Maths-Info'],
    },
  ];

  it('filters actions when prefix > is supplied', () => {
    const actions = [
      { id: '1', label: 'Vue Jour', shortcut: 'J' },
      { id: '2', label: 'Vue Semaine', shortcut: 'S' },
      { id: '3', label: 'Radar des examens', shortcut: '>examen' },
    ];

    const filterWithPrefix = (q: string) => {
      const term = q.replace(/^>/, '').toLowerCase();
      return actions.filter((a) => a.label.toLowerCase().includes(term) || a.shortcut.includes(term));
    };

    expect(filterWithPrefix('>exam').length).toBe(1);
    expect(filterWithPrefix('>exam')[0].id).toBe('3');
    expect(filterWithPrefix('>semaine').length).toBe(1);
    expect(filterWithPrefix('>semaine')[0].id).toBe('2');
  });

  it('matches courses by title, room, or teacher', () => {
    const search = (q: string) => {
      const term = q.toLowerCase();
      return sampleEvents.filter(
        (e) =>
          e.cleanTitle.toLowerCase().includes(term) ||
          (e.room || '').toLowerCase().includes(term) ||
          e.teacher.toLowerCase().includes(term)
      );
    };

    expect(search('algo').length).toBe(1);
    expect(search('d004').length).toBe(1);
    expect(search('dupont').length).toBe(1);
    expect(search('souriau').length).toBe(1);
    expect(search('inconnu').length).toBe(0);
  });
});
