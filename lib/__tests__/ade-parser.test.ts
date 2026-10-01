import { describe, it, expect } from 'vitest';
import {
  detectCategory,
  extractCleanTitleAndCode,
  extractDetailsFromDescription,
  parseIcsContent,
} from '@/lib/ade-parser';

describe('ADE & RFC 5545 Parser Test Suite', () => {
  describe('detectCategory', () => {
    it('detects EXAM from keywords in summary or description', () => {
      expect(detectCategory('Partiel Algorithmique', '')).toBe('EXAM');
      expect(detectCategory('Contrôle Continu MOMI', '')).toBe('EXAM');
      expect(detectCategory('Calculus 1 DS', '')).toBe('EXAM');
      expect(detectCategory('Bases de Données', 'Épreuve terminale écrite')).toBe('EXAM');
      expect(detectCategory('Projet Web', 'Soutenance de fin de semestre')).toBe('EXAM');
    });

    it('detects CM from summary or description', () => {
      expect(detectCategory('Algorithmique CM', '')).toBe('CM');
      expect(detectCategory('[CM] Introduction au C++', '')).toBe('CM');
      expect(detectCategory('Amphi Souriau Physique', '')).toBe('CM');
      expect(detectCategory('Mathématiques', 'L1 MATHS CM Amphi Barbeaux')).toBe('CM');
    });

    it('detects TP from summary or description', () => {
      expect(detectCategory('Réseaux et Télécoms TP', '')).toBe('TP');
      expect(detectCategory('(TP) Systèmes d\'exploitation', '')).toBe('TP');
      expect(detectCategory('Programmation Web', 'L3 INFO TP Salle D102')).toBe('TP');
    });

    it('detects TD from summary or default', () => {
      expect(detectCategory('Algèbre Linéaire TD', '')).toBe('TD');
      expect(detectCategory('MOMI', 'L1 MATHS TD Salle D004')).toBe('TD');
      expect(detectCategory('Séance de révision', '')).toBe('TD');
    });
  });

  describe('extractCleanTitleAndCode', () => {
    it('strips category tags and extracts course code', () => {
      const res = extractCleanTitleAndCode('[INFO301] Algorithmique & Graphes - CM');
      expect(res.cleanTitle).toBe('Algorithmique & Graphes');
      expect(res.code).toBe('INFO301');
    });

    it('removes trailing subgroup numbers from title', () => {
      const res = extractCleanTitleAndCode('Bases de Données TD Gr 2-2');
      expect(res.cleanTitle).toBe('Bases de Données');
    });
  });

  describe('extractDetailsFromDescription', () => {
    it('extracts teacher name and groups', () => {
      const desc = `Professeur : DUPONT Jean\nGroupe : L1-INFO-GR2, L1-INFO-ALL\nNotes : Amener sa calculatrice`;
      const res = extractDetailsFromDescription(desc);
      expect(res.teacher).toContain('DUPONT');
      expect(res.groups).toContain('L1-INFO-GR2');
      expect(res.notes).toContain('Amener sa calculatrice');
    });
  });

  describe('parseIcsContent', () => {
    it('parses real RFC 5545 VCALENDAR feed string correctly', () => {
      const sampleIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ADE Campus//FR',
        'BEGIN:VEVENT',
        'UID:ade-event-101@univ-artois.fr',
        'DTSTART:20261015T083000Z',
        'DTEND:20261015T103000Z',
        'SUMMARY:Algorithmique & Structures - CM',
        'LOCATION:Amphi Barbeaux',
        'DESCRIPTION:Enseignant: Martin Pierre\\nGroupe: L2 INFO',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:ade-event-102@univ-artois.fr',
        'DTSTART:20261015T104500Z',
        'DTEND:20261015T124500Z',
        'SUMMARY:Programmation C++ - TP',
        'LOCATION:D104',
        'DESCRIPTION:Enseignant: Bernard Claire\\nGroupe: L2 INFO GR2',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const events = parseIcsContent(sampleIcs);
      expect(events).toHaveLength(2);

      const first = events[0];
      expect(first.cleanTitle).toContain('Algorithmique');
      expect(first.category).toBe('CM');
      expect(first.durationMinutes).toBe(120);
      expect(first.room).toBe('Amphi Barbeaux');

      const second = events[1];
      expect(second.cleanTitle).toContain('Programmation C++');
      expect(second.category).toBe('TP');
      expect(second.room).toBe('D104');
    });
  });
});
