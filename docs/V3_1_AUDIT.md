# V3_1_AUDIT.md — Audit d'État Réel de la V3 d'Aura Campus

> **Date d'exécution :** 1er octobre 2026  
> **Règle absolue :** Preuve avant affirmation. Tout fait consigné ci-dessous découle d'une mesure ou d'une inspection directe du code source.

---

## 1. Questions Fondamentales du Lot 0

### 1.1 La vue Liste utilise-t-elle `react-window`, `content-visibility`, ou les deux ? Où ?
- **Constat vérifié :** `components/ListView.tsx` utilise **exclusivement** la propriété CSS `content-visibility: auto` couplée à `containIntrinsicSize: '1px 320px'` (lignes 119–120).
- **Emplacement précis :** Ligne 119 dans `components/ListView.tsx` sur les conteneurs `<section>` correspondant à chaque journée :
  ```tsx
  style={{
    borderColor: 'var(--border)',
    contentVisibility: 'auto',
    containIntrinsicSize: '1px 320px',
  }}
  ```
- **Présence de `react-window` :** Le paquet `"react-window": "^2.3.3"` et ses types `"@types/react-window": "^1.8.8"` sont bien présents dans `package.json`, mais **aucun import ni usage** de `react-window` n'existe dans le codebase (`grep -rn "react-window" components/ app/ features/` ne retourne aucun résultat).
- **Impact & Incohérence doc :** `docs/V3_DECISIONS.md` (section 4) et `docs/V3_PLAN.md` affirmaient à tort : *« Emploi d'une liste virtualisée réactive (react-window) »*. Cette affirmation était erronée.

---

### 1.2 `page.tsx` et `WeekView.tsx` ont-ils réellement été découpés ? Donne leur nombre de lignes actuel.
- **Mesure exacte (`wc -l`) :**
  - `app/page.tsx` : **905 lignes**
  - `components/WeekView.tsx` : **889 lignes**
- **Constat :** **Non, ils n'ont pas été découpés.** Les deux fichiers demeurent des composants monolithiques massifs excédant très largement le seuil recommandé de 300 lignes.
- **Détails de `WeekView.tsx` :** Contient en un seul bloc l'algorithme `computeEventLayout`, les sous-composants `WeekCardCompact`, `WeekCardFull`, la gestion du swipe mobile, et le calcul de la grille horaire.

---

### 1.3 Quels imports `@/components/...` (ancien emplacement) subsistent alors que le code est censé être dans `features/...` ?
- **Constat d'arborescence :** Dans `features/`, seuls `command-palette/` contient du code effectif. Les dossiers `features/analytics`, `features/exams`, `features/focus-mode`, `features/homework`, `features/schedule`, `features/sources` sont des répertoires **vides** (à l'exception de tests isolés dans `features/schedule/__tests__/views.test.ts`).
- **Imports `@/components/...` subsistants dans `app/page.tsx` :**
  ```tsx
  import { Header } from '@/components/Header';
  import { ScheduleLiveBanner } from '@/components/ScheduleLiveBanner';
  import { SearchBar } from '@/components/SearchBar';
  import { DateSelector } from '@/components/DateSelector';
  import { TimelineView } from '@/components/TimelineView';
  import { WeekView } from '@/components/WeekView';
  import { ListView } from '@/components/ListView';
  import { CourseDetailModal } from '@/components/CourseDetailModal';
  import { ExamRadarModal } from '@/components/ExamRadarModal';
  import { HomeworkModal } from '@/components/HomeworkModal';
  import { MobileBottomNav } from '@/components/MobileBottomNav';
  import { MobileActionSheet } from '@/components/MobileActionSheet';
  import { OfflineBanner } from '@/components/OfflineBanner';
  import { PwaInstallBanner } from '@/components/PwaInstallBanner';
  import { PwaInstallSheet } from '@/components/PwaInstallSheet';
  import { PullToRefresh } from '@/components/PullToRefresh';
  import { DailyBriefingCard } from '@/components/DailyBriefingCard';
  import { ContextBanner } from '@/components/ContextBanner';
  // Modales lazy-loaded
  const AnalyticsModal = dynamic(() => import('@/components/AnalyticsModal').then(m => m.AnalyticsModal), { ssr: false });
  const RevisionPlannerModal = dynamic(() => import('@/components/RevisionPlannerModal').then(m => m.RevisionPlannerModal), { ssr: false });
  const ScheduleComparatorModal = dynamic(() => import('@/components/ScheduleComparatorModal').then(m => m.ScheduleComparatorModal), { ssr: false });
  const ShortcutsModal = dynamic(() => import('@/components/ShortcutsModal').then(m => m.ShortcutsModal), { ssr: false });
  const UrlModalInput = dynamic(() => import('@/components/UrlModalInput').then(m => m.UrlModalInput), { ssr: false });
  ```
  **Total :** 23 composants critiques sont encore importés depuis `@/components/...` au lieu de `features/...`.

---

### 1.4 Combien de tests existent, et lesquels couvrent `computeEventLayout`, la migration IndexedDB, le parser et les dates ?
- **Nombre total de tests existants :** **21 tests** répartis sur 6 fichiers :
  1. `lib/__tests__/smoke.test.ts` : 1 test (smoke test)
  2. `features/command-palette/__tests__/palette.test.ts` : 2 tests (requête et filtrage palette)
  3. `lib/__tests__/wcag-contrast.test.ts` : 6 tests (validation ratios hex de base)
  4. `lib/__tests__/homeworkShare.test.ts` : 2 tests (encodage/décodage LZ-String)
  5. `features/schedule/__tests__/views.test.ts` : 2 tests (décodage géographique campus de Lens uniquement)
  6. `lib/__tests__/ade-parser.test.ts` : 8 tests (lignes dépliées, détection catégories CM/TD/TP/EXAM/PROJET, split groupes)
- **Couverture détaillée demandée :**
  - `computeEventLayout` : **0 test** (layout non isolé, logé au sein de `WeekView.tsx`).
  - Migration IndexedDB (`migrateFromLocalStorage`) : **0 test** (non couverte par un mock localStorage).
  - Parser ADE (`ade-parser.ts`) : **8 tests** (couvre le parsing iCal de base).
  - Calcul et arithmétique de dates : **0 test dédié** (uniquement présent de manière accessoire dans le parser).

---

### 1.5 Playwright est-il installé ? Y a-t-il des snapshots ?
- **Playwright installé :** **NON.** Ni `@playwright/test` ni ses dépendances ne sont présents dans `package.json` ou `node_modules`.
- **Fichier de configuration :** **AUCUN.** Aucun `playwright.config.ts` n'existe dans le dépôt.
- **Snapshots visuels :** **0 snapshot.** Aucun dossier de snapshots de référence n'a été créé ou commité.
- **Impact & Incohérence doc :** Le gate de la Phase 4 dans `docs/V3_PLAN.md` mentionnait *« snapshots visuels Playwright des 3 vues en clair/sombre à 375, 768, 1280px »*. C'était une affirmation fausse dans le document.

---

## 2. Tableaux de Suivi

### 2.1 Comptage des tests par module (avant V3.1)
| Module | Fichier de Test | Nombre de Tests | Statut |
| :--- | :--- | :--- | :--- |
| Smoke | `lib/__tests__/smoke.test.ts` | 1 | Passant |
| Command Palette | `features/command-palette/__tests__/palette.test.ts` | 2 | Passant |
| WCAG Contrastes | `lib/__tests__/wcag-contrast.test.ts` | 6 | Passant |
| Partage Devoirs | `lib/__tests__/homeworkShare.test.ts` | 2 | Passant |
| Décodeur Campus | `features/schedule/__tests__/views.test.ts` | 2 | Passant |
| Parser ADE | `lib/__tests__/ade-parser.test.ts` | 8 | Passant |
| **TOTAL INITIAL** | **6 fichiers** | **21 tests** | **Objectif V3.1 : ≥ 60 tests** |

*(Les sections « Tableau des Ratios de Contrastes Mesurés » et « Mesures de Performance Réelles (Lighthouse / Bundle) » seront complétées lors des lots 2 et 3 après exécution des scripts de mesure)*.
