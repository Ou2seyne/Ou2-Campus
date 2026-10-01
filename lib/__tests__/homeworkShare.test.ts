import { describe, it, expect } from 'vitest';
import { encodeHomeworkShare, decodeHomeworkShare } from '@/lib/homeworkShare';
import { HomeworkItem } from '@/types/schedule';

describe('Homework Sharing via LZ-String', () => {
  it('encodes and decodes homework items correctly', () => {
    const dummyItems: HomeworkItem[] = [
      {
        id: 'hw-1',
        courseTitle: 'Algorithmique & Graphes',
        text: 'Rendre le TP 3 sur les arbres binaires',
        dueDate: '2026-10-15',
        isDone: false,
        createdAt: 123456789,
      },
      {
        id: 'hw-2',
        courseTitle: 'Bases de Données',
        text: 'Préparer les requêtes SQL du projet',
        isDone: false,
        createdAt: 123456799,
      },
    ];

    const encoded = encodeHomeworkShare(dummyItems);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeHomeworkShare(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.items).toHaveLength(2);
    expect(decoded?.items[0].courseTitle).toBe('Algorithmique & Graphes');
    expect(decoded?.items[0].text).toBe('Rendre le TP 3 sur les arbres binaires');
    expect(decoded?.items[0].dueDate).toBe('2026-10-15');
    expect(decoded?.items[1].courseTitle).toBe('Bases de Données');
  });

  it('returns null for corrupt strings', () => {
    expect(decodeHomeworkShare('invalid_data_XYZ!@#')).toBeNull();
  });
});
