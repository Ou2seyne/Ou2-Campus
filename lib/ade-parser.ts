import ical, { VEvent } from 'node-ical';
import { CourseCategory, ScheduleEvent } from '@/types/schedule';

/**
 * Determines the category of a course based on its summary, description, and raw categories
 */
export function detectCategory(summary: string, description: string, rawCategories?: string[]): CourseCategory {
  const sum = (summary || '').toUpperCase();
  const desc = (description || '').toUpperCase();
  const cats = (rawCategories || []).join(' ').toUpperCase();
  const allText = `${sum} ${desc} ${cats}`;

  // 1. Examen / Contrôle / Partiel / Soutenance
  if (
    allText.includes('EXAM') ||
    allText.includes('CONTRÔLE') ||
    allText.includes('CONTROLE') ||
    allText.includes('PARTIEL') ||
    allText.includes('ÉVALUATION') ||
    allText.includes('EVALUATION') ||
    allText.includes('ÉPREUVE') ||
    allText.includes('EPREUVE') ||
    allText.includes('SOUTENANCE') ||
    /\bDS\b/.test(sum) ||
    cats.includes('EXAM')
  ) {
    return 'EXAM';
  }

  // 2. Direct checks on summary
  if (/\bCM\b|\(CM\)|\[CM\]|COURS MAGISTRAL/i.test(sum)) return 'CM';
  if (/\bTP\b|\(TP\)|\[TP\]|TRAVAUX PRATIQUES/i.test(sum)) return 'TP';
  if (/\bTD\b|\(TD\)|\[TD\]|TRAVAUX DIRIGÉS|TRAVAUX DIRIGES/i.test(sum)) return 'TD';
  if (/PROJET|ATELIER|WORKSHOP|HACKATHON/i.test(sum)) return 'PROJET';

  // 3. Check for specific line types in description
  if (/\b(?:L1|L2|L3|M1|M2|INFO|MATHS)[^\n]*\bCM\b/i.test(desc)) return 'CM';
  if (/\b(?:L1|L2|L3|M1|M2|INFO|MATHS)[^\n]*\bTP\b/i.test(desc)) return 'TP';
  if (/\b(?:L1|L2|L3|M1|M2|INFO|MATHS)[^\n]*\bTD\b/i.test(desc)) return 'TD';

  // 4. Amphithéâtre keyword
  if (sum.includes('AMPHI') || desc.includes('AMPHI')) return 'CM';

  // 5. Raw categories fallback
  if (cats.includes('CM')) return 'CM';
  if (cats.includes('TP')) return 'TP';
  if (cats.includes('TD')) return 'TD';

  return 'TD';
}

/**
 * Extracts and cleans the course title and UE code from summary
 */
export function extractCleanTitleAndCode(rawSummary: string): { cleanTitle: string; code?: string } {
  const title = (rawSummary || 'Cours sans titre').trim();

  // Try extracting UE code like [INF301], UE-301, INF301 :, etc.
  let code: string | undefined;
  const codeMatch = title.match(/(?:UE[\s-_]?|CODE[\s-_]?)?([A-Z]{2,5}[\s-_]?\d{2,4}[A-Z]?)/i);
  if (codeMatch) {
    code = codeMatch[1].replace(/[\s-_]/g, '').toUpperCase();
  }

  // Clean brackets and parentheses like [INFO-301], (CM), - TD
  let clean = title
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s*[-–—:]\s*(CM|TD|TP|EXAM|DS|PROJET)\b/gi, '')
    .replace(/\b(CM|TD|TP|EXAM|DS|PROJET)\s*[-–—:]\s*/gi, '')
    .replace(/\((CM|TD|TP|EXAM|DS|PROJET)\)/gi, '')
    .replace(/\[(CM|TD|TP|EXAM|DS|PROJET)\]/gi, '')
    .replace(/\b(CM|TD|TP)\b/gi, '')
    .trim();

  // Remove leading UE code if it duplicates
  if (code) {
    clean = clean.replace(new RegExp(`^${code}\\s*[-–—:]?\\s*`, 'i'), '').trim();
  }

  // Clean trailing group tags like "GR2-2", "GR2", "Gr 2-1" from title
  clean = clean.replace(/\s*[-–—:]?\s*(?:GR|Gr)\s*\d+([-_.]\d+)?\b/gi, '').trim();

  // Clean trailing punctuation
  clean = clean.replace(/[-–—:]$/, '').trim();

  return {
    cleanTitle: clean.length > 0 ? clean : title,
    code,
  };
}

/**
 * Parses teacher name and groups from ADE description
 */
export function extractDetailsFromDescription(rawDesc: string): {
  teacher: string;
  groups: string[];
  notes: string;
} {
  if (!rawDesc) {
    return { teacher: '', groups: [], notes: '' };
  }

  const lines = rawDesc
    .split(/\r?\n|\\n/)
    .map(l => l.trim())
    .filter(Boolean);

  let teacher = '';
  const groups: string[] = [];
  const notesLines: string[] = [];

  for (const line of lines) {
    // Ignore ADE timestamp annotations
    if (/^\(?Exporté le|Modifié le|Créé le|Mis à jour/i.test(line)) {
      continue;
    }

    // Teacher detection
    if (/^(?:Enseignant|Professeur|Intervenant|Intervenants|Prof|Tuteur)\s*[:=]\s*(.*)$/i.test(line)) {
      teacher = line.replace(/^(?:Enseignant|Professeur|Intervenant|Intervenants|Prof|Tuteur)\s*[:=]\s*/i, '').trim();
      continue;
    }

    // French honorifics: M. DUPONT, Mme MARTIN, Pr. TURING
    if (/^(?:M\.|Mme|Dr\.|Pr\.|Prof\.)\s+[A-ZÀ-ÿ\s-]+/i.test(line) && !teacher) {
      teacher = line;
      continue;
    }

    // Typical ADE pattern: A single line with Teacher name (e.g. "Jabbour Said", "Dell'Ambrogio Ivo", "TURING Alan")
    // Ensure it's not a group code (like L1 MATHS..., TD1, TP2-1) or date/keyword
    const isGroupLine = /^(?:INFO|M1|M2|L1|L2|L3|BUT|DUT|LP|ING|TD|TP|GR|SEMESTRE|PROMO)[-\s_0-9]/i.test(line) ||
      line.includes('TOUS LES GROUPES') ||
      line.includes('MATHS') ||
      line.includes('INFO');

    if (
      !isGroupLine &&
      !teacher &&
      /^[A-ZÀ-ÿ][a-zA-ZÀ-ÿ'’-]+(?:\s+[A-ZÀ-ÿ][a-zA-ZÀ-ÿ'’-]+)+$/.test(line)
    ) {
      teacher = line;
      continue;
    }

    // Groups detection
    if (/^(?:Groupe|Groupes|Promo|Promotion|Section|TD|TP|Filière)\s*[:=]\s*(.*)$/i.test(line)) {
      const g = line.replace(/^(?:Groupe|Groupes|Promo|Promotion|Section|TD|TP|Filière)\s*[:=]\s*/i, '').trim();
      const parts = g.split(/,\s*/).map(p => p.trim()).filter(Boolean);
      groups.push(...parts);
      continue;
    }

    if (isGroupLine) {
      groups.push(line);
      continue;
    }

    // Other helpful notes
    notesLines.push(line);
  }

  return {
    teacher: teacher.trim(),
    groups,
    notes: notesLines.join('\n'),
  };
}

/**
 * Extracts room and building from location string
 */
export function extractLocationDetails(rawLocation: string): {
  location: string;
  room?: string;
  building?: string;
} {
  const loc = (rawLocation || 'Salle non précisée').trim();

  // Pattern: "Salle 204 (Bât. Turing)" or "Amphi A - Bâtiment Sophie Germain"
  const bracketMatch = loc.match(/^(.*?)\s*\((.*?)\)$/);
  if (bracketMatch) {
    return {
      location: loc,
      room: bracketMatch[1].trim(),
      building: bracketMatch[2].trim(),
    };
  }

  const dashMatch = loc.match(/^(.*?)\s*[-–—]\s*(Bât.*|Site.*|Campus.*)$/i);
  if (dashMatch) {
    return {
      location: loc,
      room: dashMatch[1].trim(),
      building: dashMatch[2].trim(),
    };
  }

  return {
    location: loc,
    room: loc,
  };
}

function extractString(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'val' in value) {
    return String((value as { val: unknown }).val || '');
  }
  return String(value);
}

function extractCategories(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(extractString);
  }
  return [extractString(value)];
}

/**
 * Detects TD group and specific TP sub-group (e.g. 2-2 vs 2-1, 1-2 vs 1-1) in summaries, descriptions, and groups
 */
export function detectGroupAffiliation(
  summary: string,
  cleanTitle: string,
  description: string,
  groups: string[] = []
): { tdGroup?: string; subGroup?: string } {
  const all = `${summary}\n${cleanTitle}\n${description}\n${groups.join('\n')}`;
  // Strip promo headers that mention multiple subgroups together, e.g. "(TP2-1/TP2-2)" or "(TP1-1/TP1-2)"
  const allNoHeader = all.replace(/\(TP2-1\/TP2-2\)|\(TP1-1\/TP1-2\)/gi, '');

  let subGroup: string | undefined;
  let tdGroup: string | undefined;

  // 1. Check specific TP sub-groups first
  if (/\b(?:TP|GR)\s*GR?\s*2[-_.]?2\b|\bTP2-2\b|\bGR2-2\b|\bGr\s*2-2\b/i.test(allNoHeader)) {
    subGroup = '2-2';
    tdGroup = '2';
  } else if (/\b(?:TP|GR)\s*GR?\s*2[-_.]?1\b|\bTP2-1\b|\bGR2-1\b|\bGr\s*2-1\b/i.test(allNoHeader)) {
    subGroup = '2-1';
    tdGroup = '2';
  } else if (/\b(?:TP|GR)\s*GR?\s*1[-_.]?2\b|\bTP1-2\b|\bGR1-2\b|\bGr\s*1-2\b/i.test(allNoHeader)) {
    subGroup = '1-2';
    tdGroup = '1';
  } else if (/\b(?:TP|GR)\s*GR?\s*1[-_.]?1\b|\bTP1-1\b|\bGR1-1\b|\bGr\s*1-1\b/i.test(allNoHeader)) {
    subGroup = '1-1';
    tdGroup = '1';
  } else {
    // 2. Check TD group affiliation (without specific TP subgroup)
    const hasTD2 = /\bTD2\b|\bTD\s*GR2\b|\bGR2\b|\bGr\s*2\b|\bTD\s*2\b/i.test(all);
    const hasTD1 = /\bTD1\b|\bTD\s*GR1\b|\bGR1\b|\bGr\s*1\b|\bTD\s*1\b/i.test(all);

    if (hasTD2 && !hasTD1) {
      tdGroup = '2';
    } else if (hasTD1 && !hasTD2) {
      tdGroup = '1';
    }
  }

  return { tdGroup, subGroup };
}

/**
 * Backward-compatible helper for subGroup detection
 */
export function detectSubGroup(
  summary: string,
  cleanTitle: string,
  description: string,
  groups: string[] = []
): string | undefined {
  return detectGroupAffiliation(summary, cleanTitle, description, groups).subGroup;
}

/**
 * Parses raw ICS string into structured ScheduleEvents
 */
export function parseIcsContent(icsContent: string): ScheduleEvent[] {
  const parsedData = ical.sync.parseICS(icsContent);
  const events: ScheduleEvent[] = [];

  for (const key of Object.keys(parsedData)) {
    const item = parsedData[key];

    if (!item || item.type !== 'VEVENT') {
      continue;
    }

    const event = item as VEvent;
    if (!event.start || !event.end) {
      continue;
    }

    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    const rawSummary = extractString(event.summary) || 'Cours sans titre';
    const rawDesc = extractString(event.description);
    const rawLoc = extractString(event.location);
    const rawCategories = extractCategories(event.categories);

    const category = detectCategory(rawSummary, rawDesc, rawCategories);
    const { cleanTitle, code } = extractCleanTitleAndCode(rawSummary);
    const { teacher, groups, notes } = extractDetailsFromDescription(rawDesc);
    const { location, room, building } = extractLocationDetails(rawLoc);
    const { tdGroup, subGroup } = detectGroupAffiliation(rawSummary, cleanTitle, rawDesc, groups);

    events.push({
      id: extractString(event.uid) || `event-${Math.random().toString(36).substring(2, 9)}`,
      summary: rawSummary,
      cleanTitle,
      code,
      description: rawDesc,
      location,
      room,
      building,
      dtstart: start.toISOString(),
      dtend: end.toISOString(),
      durationMinutes,
      category,
      teacher,
      groups,
      subGroup,
      tdGroup,
      notes,
    });
  }

  // Sort events chronologically
  events.sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());

  return events;
}

/**
 * Generates an ultra-realistic demo schedule anchored on the current week
 * Useful for demo / test / offline / initial setup
 */
export function generateDemoSchedule(presetName: string = 'Licence 3 Informatique'): ScheduleEvent[] {
  const now = new Date();
  const events: ScheduleEvent[] = [];

  // Find Monday of the current week
  const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const isMath = presetName.toLowerCase().includes('math');

  const mathCourseTemplates = [
    // Lundi
    {
      dayOffset: 0,
      startHour: 10,
      startMin: 30,
      endHour: 12,
      endMin: 0,
      summary: 'CALC1 : TD Calculus 1 TD2 (TD)',
      cleanTitle: 'Calculus 1 - TD2',
      code: 'CALC1',
      category: 'TD' as CourseCategory,
      location: 'Salle E11 (Faculté des Sciences Lens)',
      room: 'Salle E11',
      building: 'Faculté Jean Perrin',
      teacher: 'Équipe Mathématiques',
      groups: ['L1 MATHS TD2 (TP2-1/TP2-2)'],
      description: 'Groupe : L1 MATHS TD2\nSalle : E11\nFormation : L1 MATHS-INFO',
    },
    {
      dayOffset: 0,
      startHour: 13,
      startMin: 30,
      endHour: 15,
      endMin: 30,
      summary: 'ALGO1 : TP Algorithmique et programmation 1 (TP)',
      cleanTitle: 'Algorithmique et programmation 1',
      code: 'ALGO1',
      category: 'TP' as CourseCategory,
      location: 'Salle D003 / D004 (Bât. Informatique)',
      room: 'Salle D003 / D004',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Informatique',
      groups: ['L1 MATHS TD2'],
      description: 'Groupe : L1 MATHS TD2\nSalles : D003 / D004\nTP noté de programmation',
    },
    {
      dayOffset: 0,
      startHour: 16,
      startMin: 0,
      endHour: 18,
      endMin: 0,
      summary: 'ALGO1 : TD Algorithmique et programmation 1 GR (TD)',
      cleanTitle: 'Algorithmique et programmation 1 (TD)',
      code: 'ALGO1',
      category: 'TD' as CourseCategory,
      location: 'Salle E7 (Faculté des Sciences Lens)',
      room: 'Salle E7',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Informatique',
      groups: ['L1 MATHS TD2'],
      description: 'Groupe : L1 MATHS TD2\nSalle : E7',
    },

    // Mardi
    {
      dayOffset: 1,
      startHour: 8,
      startMin: 30,
      endHour: 10,
      endMin: 0,
      summary: 'MATH1 : CM Nombres de réels et complexes (CM)',
      cleanTitle: 'Nombres de réels et complexes',
      code: 'MATH1',
      category: 'CM' as CourseCategory,
      location: 'Salle S23 (Faculté des Sciences Lens)',
      room: 'Salle S23',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Mathématiques',
      groups: ['L1 MATHS-INFO'],
      description: 'Groupe : Promo L1 Maths-Info\nSalle : S23',
    },
    {
      dayOffset: 1,
      startHour: 10,
      startMin: 15,
      endHour: 11,
      endMin: 30,
      summary: 'CALC1 : CM Calculus 1 (CM)',
      cleanTitle: 'Calculus 1',
      code: 'CALC1',
      category: 'CM' as CourseCategory,
      location: 'Salle S23 (Faculté des Sciences Lens)',
      room: 'Salle S23',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Calculus',
      groups: ['L1 MATHS-INFO'],
      description: 'Groupe : Promo L1 Maths-Info\nSalle : S23',
    },
    {
      dayOffset: 1,
      startHour: 11,
      startMin: 45,
      endHour: 13,
      endMin: 0,
      summary: 'CALC1 : CM Calculus 1 (CM)',
      cleanTitle: 'Calculus 1 (Suite)',
      code: 'CALC1',
      category: 'CM' as CourseCategory,
      location: 'Salle S23 (Faculté des Sciences Lens)',
      room: 'Salle S23',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Calculus',
      groups: ['L1 MATHS-INFO'],
      description: 'Groupe : Promo L1 Maths-Info\nSalle : S23',
    },
    {
      dayOffset: 1,
      startHour: 14,
      startMin: 15,
      endHour: 15,
      endMin: 45,
      summary: 'MOMI : TD MOMI TD2 (TD)',
      cleanTitle: 'MOMI - TD2',
      code: 'MOMI',
      category: 'TD' as CourseCategory,
      location: 'Salle G201 (Faculté des Sciences Lens)',
      room: 'Salle G201',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant MOMI',
      groups: ['L1 MATHS TD2'],
      description: 'Groupe : L1 MATHS TD2\nSalle : G201',
    },
    {
      dayOffset: 1,
      startHour: 16,
      startMin: 0,
      endHour: 17,
      endMin: 30,
      summary: 'MOMI : TD MOMI TD2 (TD)',
      cleanTitle: 'MOMI - TD2 (Suite)',
      code: 'MOMI',
      category: 'TD' as CourseCategory,
      location: 'Salle G201 (Faculté des Sciences Lens)',
      room: 'Salle G201',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant MOMI',
      groups: ['L1 MATHS TD2'],
      description: 'Groupe : L1 MATHS TD2\nSalle : G201',
    },

    // Mercredi
    {
      dayOffset: 2,
      startHour: 9,
      startMin: 0,
      endHour: 10,
      endMin: 30,
      summary: 'ALGO1 : CM Algorithmique et programmation 1 (CM)',
      cleanTitle: 'Algorithmique et programmation 1',
      code: 'ALGO1',
      category: 'CM' as CourseCategory,
      location: 'Amphi Y.Barbeaux (Faculté Jean Perrin)',
      room: 'Amphi Y.Barbeaux',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Algorithmique',
      groups: ['L1 MATHS-INFO'],
      description: 'Groupe : Promo L1 Maths-Info\nAmphi Y.Barbeaux',
    },
    {
      dayOffset: 2,
      startHour: 10,
      startMin: 45,
      endHour: 12,
      endMin: 15,
      summary: 'MATH1 : TD Nombres de réels et complexes TD2 (TD)',
      cleanTitle: 'Nombres de réels et complexes - TD2',
      code: 'MATH1',
      category: 'TD' as CourseCategory,
      location: 'Amphi Y.Barbeaux (Faculté Jean Perrin)',
      room: 'Amphi Y.Barbeaux',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Mathématiques',
      groups: ['L1 MATHS TD2'],
      description: 'Groupe : L1 MATHS TD2\nAmphi Y.Barbeaux',
    },
    {
      dayOffset: 2,
      startHour: 16,
      startMin: 0,
      endHour: 18,
      endMin: 0,
      summary: 'MATH-R : Renfort Maths Gr 1-2 (TD)',
      cleanTitle: 'Renfort Maths Gr 1-2',
      code: 'MATH-R',
      category: 'TD' as CourseCategory,
      location: 'Salle P100 (Faculté Jean Perrin)',
      room: 'Salle P100',
      building: 'Faculté Jean Perrin',
      teacher: 'Tuteurs / Enseignants',
      groups: ['L1 MATHS Gr 1-2'],
      description: 'Séance de renforcement en mathématiques',
    },

    // Jeudi
    {
      dayOffset: 3,
      startHour: 8,
      startMin: 30,
      endHour: 9,
      endMin: 45,
      summary: 'MOMI : CM MOMI (CM)',
      cleanTitle: 'MOMI (CM)',
      code: 'MOMI',
      category: 'CM' as CourseCategory,
      location: 'Amphi Y.Barbeaux (Faculté Jean Perrin)',
      room: 'Amphi Y.Barbeaux',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant MOMI',
      groups: ['L1 MATHS-INFO'],
      description: 'Groupe : Promo L1 Maths-Info\nAmphi Y.Barbeaux',
    },
    {
      dayOffset: 3,
      startHour: 10,
      startMin: 0,
      endHour: 11,
      endMin: 0,
      summary: 'MOMI : CM MOMI (CM)',
      cleanTitle: 'MOMI (CM Suite)',
      code: 'MOMI',
      category: 'CM' as CourseCategory,
      location: 'Amphi Y.Barbeaux (Faculté Jean Perrin)',
      room: 'Amphi Y.Barbeaux',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant MOMI',
      groups: ['L1 MATHS-INFO'],
      description: 'Groupe : Promo L1 Maths-Info\nAmphi Y.Barbeaux',
    },
    {
      dayOffset: 3,
      startHour: 11,
      startMin: 15,
      endHour: 12,
      endMin: 45,
      summary: 'CALC1 : TD Calculus 1 TD2 (TD)',
      cleanTitle: 'Calculus 1 - TD2',
      code: 'CALC1',
      category: 'TD' as CourseCategory,
      location: 'Salle E7 (Faculté des Sciences Lens)',
      room: 'Salle E7',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Calculus',
      groups: ['L1 MATHS TD2'],
      description: 'Groupe : L1 MATHS TD2\nSalle : E7',
    },

    // Vendredi
    {
      dayOffset: 4,
      startHour: 10,
      startMin: 45,
      endHour: 12,
      endMin: 15,
      summary: 'ANG1 : TD Anglais TD2 (TD)',
      cleanTitle: 'Anglais - TD2',
      code: 'ANG1',
      category: 'TD' as CourseCategory,
      location: 'Salle E9 (Faculté des Sciences Lens)',
      room: 'Salle E9',
      building: 'Faculté Jean Perrin',
      teacher: 'Enseignant Anglais',
      groups: ['L1 MATHS TD2'],
      description: 'Groupe : L1 MATHS TD2\nSalle : E9',
    },
    {
      dayOffset: 4,
      startHour: 13,
      startMin: 45,
      endHour: 15,
      endMin: 45,
      summary: 'MATH-R : Renfort Maths Gr 1-2-3-4-5 (TD)',
      cleanTitle: 'Renfort Maths Gr 1-2-3-4-5',
      code: 'MATH-R',
      category: 'TD' as CourseCategory,
      location: 'Salle P110 (Faculté Jean Perrin)',
      room: 'Salle P110',
      building: 'Faculté Jean Perrin',
      teacher: 'Tuteurs / Enseignants',
      groups: ['L1 MATHS Promo'],
      description: 'Séance de renforcement en mathématiques',
    },
  ];

  const infoCourseTemplates = [
    // Lundi
    {
      dayOffset: 0,
      startHour: 8,
      startMin: 30,
      endHour: 10,
      endMin: 30,
      summary: 'INF301 : Algorithmique Avancée & Graphes (CM)',
      cleanTitle: 'Algorithmique Avancée & Graphes',
      code: 'INF301',
      category: 'CM' as CourseCategory,
      location: 'Amphithéâtre Turing (Bât. Lovelace)',
      room: 'Amphi Turing',
      building: 'Bât. Lovelace',
      teacher: 'M. Alan TURING',
      groups: ['L3-INFO-Promo', 'L3-ALT'],
      description: 'Enseignant : M. Alan TURING\nGroupe : Promo L3\nChapitre 3 : Flots max et algorithmes de coupure minimale.',
    },
    {
      dayOffset: 0,
      startHour: 10,
      startMin: 45,
      endHour: 12,
      endMin: 45,
      summary: 'INF301 : Algorithmique Avancée - TD 1',
      cleanTitle: 'Algorithmique Avancée - TD',
      code: 'INF301',
      category: 'TD' as CourseCategory,
      location: 'Salle 204 (Bât. Ada)',
      room: 'Salle 204',
      building: 'Bât. Ada',
      teacher: 'Mme Ada LOVELACE',
      groups: ['L3-INFO-G1'],
      description: 'Enseignant : Mme Ada LOVELACE\nGroupe : G1\nExercices de TD sur la complexité et les graphes orientés.',
    },
    {
      dayOffset: 0,
      startHour: 14,
      startMin: 0,
      endHour: 17,
      endMin: 0,
      summary: 'DEV305 : Conception Web Moderne & React (TP)',
      cleanTitle: 'Conception Web Moderne & React',
      code: 'DEV305',
      category: 'TP' as CourseCategory,
      location: 'Labo Info 03 (Campus Nord)',
      room: 'Labo 03',
      building: 'Campus Nord',
      teacher: 'M. Linus TORVALDS',
      groups: ['L3-INFO-G1'],
      description: 'Enseignant : M. Linus TORVALDS\nGroupe : G1\nTP noté : Architecture Next.js App Router, Tailwind CSS et hooks.',
    },

    // Mardi
    {
      dayOffset: 1,
      startHour: 9,
      startMin: 0,
      endHour: 12,
      endMin: 0,
      summary: 'SYS302 : Systèmes Distribués & Cloud Computing (CM)',
      cleanTitle: 'Systèmes Distribués & Cloud Computing',
      code: 'SYS302',
      category: 'CM' as CourseCategory,
      location: 'Amphi Euler (Bât. Sciences)',
      room: 'Amphi Euler',
      building: 'Bât. Sciences',
      teacher: 'Mme Barbara LISKOV',
      groups: ['L3-INFO-Promo'],
      description: 'Enseignant : Mme Barbara LISKOV\nThème : Consensus distribué (Raft/Paxos) et microservices.',
    },
    {
      dayOffset: 1,
      startHour: 13,
      startMin: 30,
      endHour: 15,
      endMin: 30,
      summary: 'BDD304 : Optimisation Bases de Données (TD)',
      cleanTitle: 'Optimisation Bases de Données & NoSQL',
      code: 'BDD304',
      category: 'TD' as CourseCategory,
      location: 'Salle 108 (Bât. Shannon)',
      room: 'Salle 108',
      building: 'Bât. Shannon',
      teacher: 'M. Edgar CODD',
      groups: ['L3-INFO-G1'],
      description: 'Enseignant : M. Edgar CODD\nPlans d\'exécution SQL et indexation B-Tree.',
    },
    {
      dayOffset: 1,
      startHour: 15,
      startMin: 45,
      endHour: 17,
      endMin: 45,
      summary: 'ANG301 : Anglais Professionnel & Tech Pitch (TD)',
      cleanTitle: 'Anglais Professionnel & Tech Pitch',
      code: 'ANG301',
      category: 'TD' as CourseCategory,
      location: 'Salle 312 (Maison des Langues)',
      room: 'Salle 312',
      building: 'Maison des Langues',
      teacher: 'Mme Sarah CONNOR',
      groups: ['L3-INFO-G1'],
      description: 'Enseignant : Mme Sarah CONNOR\nOral presentation : Pitching your software engineering architecture.',
    },

    // Mercredi
    {
      dayOffset: 2,
      startHour: 8,
      startMin: 30,
      endHour: 11,
      endMin: 30,
      summary: 'SEC306 : Sécurité Réseaux & Cryptographie (TP)',
      cleanTitle: 'Sécurité Réseaux & Cryptographie',
      code: 'SEC306',
      category: 'TP' as CourseCategory,
      location: 'Labo Sécurité Cyber (Bât. Turing)',
      room: 'Labo Cyber',
      building: 'Bât. Turing',
      teacher: 'M. Ron RIVEST',
      groups: ['L3-INFO-G1'],
      description: 'Enseignant : M. Ron RIVEST\nTravaux pratiques sur TLS 1.3, certificats X.509 et attaques MITM.',
    },
    {
      dayOffset: 2,
      startHour: 13,
      startMin: 30,
      endHour: 17,
      endMin: 30,
      summary: 'PRJ309 : Projet Transversal - Sprint Review (PROJET)',
      cleanTitle: 'Projet Transversal - Sprint Review',
      code: 'PRJ309',
      category: 'PROJET' as CourseCategory,
      location: 'Espace Coworking Tech (Hub Étudiant)',
      room: 'Espace Coworking',
      building: 'Hub Étudiant',
      teacher: 'Équipe Pédagogique Agile',
      groups: ['L3-INFO-Promo'],
      description: 'Session de mentorat agile, démo produit et revue de sprint.',
    },

    // Jeudi
    {
      dayOffset: 3,
      startHour: 9,
      startMin: 0,
      endHour: 11,
      endMin: 0,
      summary: 'IA307 : Introduction au Machine Learning (CM)',
      cleanTitle: 'Introduction au Machine Learning',
      code: 'IA307',
      category: 'CM' as CourseCategory,
      location: 'Amphithéâtre Turing (Bât. Lovelace)',
      room: 'Amphi Turing',
      building: 'Bât. Lovelace',
      teacher: 'M. Yann LE CUN',
      groups: ['L3-INFO-Promo'],
      description: 'Enseignant : M. Yann LE CUN\nRégression linéaire, gradient descent et réseaux neuronaux.',
    },
    {
      dayOffset: 3,
      startHour: 11,
      startMin: 15,
      endHour: 13,
      endMin: 15,
      summary: 'IA307 : Machine Learning Pratique (TP)',
      cleanTitle: 'Machine Learning Pratique & PyTorch',
      code: 'IA307',
      category: 'TP' as CourseCategory,
      location: 'Labo Info 05 (Campus Nord)',
      room: 'Labo 05',
      building: 'Campus Nord',
      teacher: 'M. Yann LE CUN',
      groups: ['L3-INFO-G1'],
      description: 'Enseignant : M. Yann LE CUN\nNotebooks Python, PyTorch et classification d\'images.',
    },
    {
      dayOffset: 3,
      startHour: 14,
      startMin: 30,
      endHour: 16,
      endMin: 30,
      summary: 'DRO302 : Droit du Numérique & RGPD (CM)',
      cleanTitle: 'Droit du Numérique & RGPD',
      code: 'DRO302',
      category: 'CM' as CourseCategory,
      location: 'Amphi Jean Monnet',
      room: 'Amphi Monnet',
      building: 'Faculté de Droit',
      teacher: 'Me Julie DUPRÉ',
      groups: ['L3-INFO-Promo'],
      description: 'Enseignant : Me Julie DUPRÉ\nCadre légal européen de la protection des données personnelles.',
    },

    // Vendredi
    {
      dayOffset: 4,
      startHour: 8,
      startMin: 30,
      endHour: 10,
      endMin: 30,
      summary: 'EXAM : Contrôle Continu - Algorithmique Avancée',
      cleanTitle: 'Contrôle Continu - Algorithmique Avancée',
      code: 'INF301',
      category: 'EXAM' as CourseCategory,
      location: 'Grand Amphi Central',
      room: 'Grand Amphi',
      building: 'Bâtiment Principal',
      teacher: 'M. Alan TURING',
      groups: ['L3-INFO-Promo'],
      description: 'Évaluation semestrielle écrite (2h00). Calculatrice et documents interdits.',
    },
    {
      dayOffset: 4,
      startHour: 11,
      startMin: 0,
      endHour: 13,
      endMin: 0,
      summary: 'DEV305 : Soutenance Projet Web (SOUTENANCE)',
      cleanTitle: 'Soutenance de Projet Web',
      code: 'DEV305',
      category: 'EXAM' as CourseCategory,
      location: 'Salle des Actes (Bât. A)',
      room: 'Salle des Actes',
      building: 'Bât. A',
      teacher: 'Jury Universitaire',
      groups: ['L3-INFO-G1'],
      description: 'Démonstrations des projets devant le jury. 15 min de présentation + 10 min de questions.',
    },
    {
      dayOffset: 4,
      startHour: 14,
      startMin: 0,
      endHour: 16,
      endMin: 0,
      summary: 'VIE301 : Conférence Métiers & Insertion Pro (CONFÉRENCE)',
      cleanTitle: 'Conférence Métiers & Insertion Professionnelle',
      code: 'VIE301',
      category: 'CM' as CourseCategory,
      location: 'Auditorium Campus Tech',
      room: 'Auditorium Tech',
      building: 'Forum Universitaire',
      teacher: 'Alumni & Partenaires Entreprises',
      groups: ['L3-INFO-Promo'],
      description: 'Rencontre avec des alumni ingénieurs et directeurs techniques.',
    },
  ];

  const activeTemplates = isMath ? mathCourseTemplates : infoCourseTemplates;

  activeTemplates.forEach((tpl, idx) => {
    const start = new Date(monday);
    start.setDate(monday.getDate() + tpl.dayOffset);
    start.setHours(tpl.startHour, tpl.startMin, 0, 0);

    const end = new Date(monday);
    end.setDate(monday.getDate() + tpl.dayOffset);
    end.setHours(tpl.endHour, tpl.endMin, 0, 0);

    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    events.push({
      id: `demo-${idx + 1}-${start.getTime()}`,
      summary: tpl.summary,
      cleanTitle: tpl.cleanTitle,
      code: tpl.code,
      description: tpl.description,
      location: tpl.location,
      room: tpl.room,
      building: tpl.building,
      dtstart: start.toISOString(),
      dtend: end.toISOString(),
      durationMinutes,
      category: tpl.category,
      teacher: tpl.teacher,
      groups: [...tpl.groups, presetName],
    });
  });

  return events;
}
