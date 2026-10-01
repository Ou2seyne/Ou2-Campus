import { CourseCategory } from '@/types/schedule';

export interface CategoryTheme {
  /** Classe CSS utilitaire pour la barre + fond (cat-cm, cat-td, …) */
  catClass: string;
  /** Classe CSS pour le badge texte (badge-cm, …) */
  badgeClass: string;
  /** Classe CSS pour le dot indicateur */
  dotClass: string;
  /** Couleur CSS var de la barre latérale */
  barColor: string;
  /** Couleur CSS var du fond */
  bgColor: string;
  /** Label long */
  label: string;
  /** Label court affiché dans l'UI */
  shortLabel: string;
  /** Motif texturé (TP uniquement) */
  pattern?: string;
}

export const CATEGORY_THEMES: Record<CourseCategory, CategoryTheme> = {
  CM: {
    catClass:   'cat-cm',
    badgeClass: 'badge-cm',
    dotClass:   'dot-cm',
    barColor:   'var(--cm-bar)',
    bgColor:    'var(--cm-bg)',
    label:      'Cours Magistral',
    shortLabel: 'CM',
  },
  TD: {
    catClass:   'cat-td',
    badgeClass: 'badge-td',
    dotClass:   'dot-td',
    barColor:   'var(--td-bar)',
    bgColor:    'var(--td-bg)',
    label:      'Travaux Dirigés',
    shortLabel: 'TD',
  },
  TP: {
    catClass:   'cat-tp',
    badgeClass: 'badge-tp',
    dotClass:   'dot-tp',
    barColor:   'var(--tp-bar)',
    bgColor:    'var(--tp-bg)',
    label:      'Travaux Pratiques',
    shortLabel: 'TP',
    pattern:    'pattern-tp',
  },
  EXAM: {
    catClass:   'cat-exam',
    badgeClass: 'badge-exam',
    dotClass:   'dot-exam',
    barColor:   'var(--exam-bar)',
    bgColor:    'var(--exam-bg)',
    label:      'Examen / Contrôle',
    shortLabel: 'EXAM',
  },
  PROJET: {
    catClass:   'cat-projet',
    badgeClass: 'badge-projet',
    dotClass:   'dot-projet',
    barColor:   'var(--projet-bar)',
    bgColor:    'var(--projet-bg)',
    label:      'Projet / Workshop',
    shortLabel: 'PROJET',
  },
  AUTRE: {
    catClass:   'cat-autre',
    badgeClass: 'badge-autre',
    dotClass:   'dot-autre',
    barColor:   'var(--autre-bar)',
    bgColor:    'var(--autre-bg)',
    label:      'Autre',
    shortLabel: 'AUTRE',
  },
};

export function getCategoryTheme(category: CourseCategory): CategoryTheme {
  return CATEGORY_THEMES[category] ?? CATEGORY_THEMES.AUTRE;
}

/* Compatibilité rétro — les anciens composants qui n'ont pas encore
   été migrés peuvent appeler getCategoryTheme et accéder aux
   propriétés qu'ils connaissent via des alias. */
export function getLegacyThemeProps(category: CourseCategory) {
  const t = getCategoryTheme(category);
  return {
    bg:          t.catClass,
    text:        '',          // couleur portée par les CSS vars via catClass
    border:      '',
    badgeBg:     '',
    pillBg:      t.badgeClass,
    accentDot:   t.dotClass,
    label:       t.label,
    shortLabel:  t.shortLabel,
    catClass:    t.catClass,
    badgeClass:  t.badgeClass,
    dotClass:    t.dotClass,
    barColor:    t.barColor,
    bgColor:     t.bgColor,
    pattern:     t.pattern,
  };
}
