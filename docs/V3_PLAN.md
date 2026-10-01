# V3_PLAN.md — Aura Campus V3 Architecture, Audit & Execution Plan

> **Date :** Octobre 2026  
> **Auteur :** Staff Frontend Engineer & Lead Product Designer  
> **Objectif :** Réalisation intégrale de la V3 d'Aura Campus — Gazette Structurée / Anti-Lisse Industriel, Cockpit Académique Haute Performance.

---

## 1. Cartographie Complète du Repository (État Initial V2)

### 1.1 Architecture & Arborescence Initiale

```
.
├── app/
│   ├── api/schedule/route.ts      # Proxy API ADE avec allowlist anti-SSRF & headers SWR
│   ├── favicon.ico
│   ├── globals.css                # CSS variables, tokens v2, classes cat-*, ombres tactiles
│   ├── layout.tsx                 # Root layout, Bricolage Grotesque + Geist Mono
│   ├── manifest.ts                # Web Manifest PWA, raccourcis, icônes
│   └── page.tsx                   # Page principale monolithique (798 lignes)
├── components/
│   ├── ui/                        # Button, IconButton, Badge, Dialog, Segmented (partiel)
│   ├── AnalyticsModal.tsx         # Volume horaire, répartition CM/TD/TP/EXAM (350 lignes)
│   ├── CourseCard.tsx             # Carte de cours, hero, standard, badge (315 lignes)
│   ├── CourseDetailModal.tsx      # Modal détail, export .ics/gcal, campus (466 lignes)
│   ├── DailyBriefingCard.tsx      # Cockpit journalier (244 lignes)
│   ├── DateSelector.tsx           # Barre de sélection de dates & strip 6 jours (246 lignes)
│   ├── ExamRadarModal.tsx         # Radar examens par urgence (288 lignes)
│   ├── Header.tsx                 # Masthead, navigation, sélecteurs, actions (587 lignes)
│   ├── HomeworkModal.tsx          # Gestionnaire devoirs & tâches (325 lignes)
│   ├── ListView.tsx               # Vue liste chronologique (129 lignes)
│   ├── LiveTicker.tsx             # Ticker défilant (190 lignes, non conforme a11y)
│   ├── MobileActionSheet.tsx      # Bottom sheet mobile rapide (323 lignes)
│   ├── MobileBottomNav.tsx        # Barre 5 boutons bas d'écran (167 lignes)
│   ├── OfflineBanner.tsx          # Notification réseau (81 lignes)
│   ├── PullToRefresh.tsx          # Geste pull-to-refresh mobile tactile (157 lignes)
│   ├── PwaInstallBanner.tsx       # Bannière install PWA (182 lignes)
│   ├── PwaInstallSheet.tsx        # Guide d'installation iOS/Android (296 lignes)
│   ├── RecentPills.tsx            # Pilules de favoris & démos (126 lignes)
│   ├── ScheduleLiveBanner.tsx     # Barre cours en cours & jauge (272 lignes)
│   ├── ScheduleStats.tsx          # Statistiques rapides (134 lignes)
│   ├── SearchBar.tsx              # Recherche & filtres CM/TD/TP (326 lignes)
│   ├── ShortcutsModal.tsx         # Récapitulatif raccourcis clavier (116 lignes)
│   ├── ThemeSwitcher.tsx          # Bascule thème (25 lignes)
│   ├── TimelineView.tsx           # Vue jour chronologique avec pauses (324 lignes)
│   ├── UrlModalInput.tsx          # Sélecteur URL ADE & presets (368 lignes)
│   └── WeekView.tsx               # Grille semaine 64px/h (705 lignes)
├── features/
│   └── command-palette/
│       └── CommandPalette.tsx     # Palette ⌘K type Raycast (457 lignes)
├── hooks/
│   ├── useFocusTrap.ts            # Piège de focus a11y (105 lignes)
│   ├── useHomework.ts             # Hook devoirs avec double stockage (158 lignes)
│   ├── usePwa.ts                  # Détection PWA, SW update, install (245 lignes)
│   ├── useSchedule.ts             # Orchestrateur central emploi du temps (592 lignes)
│   ├── useSwipe.ts                # Détection balayages tactiles (60 lignes)
│   └── useTheme.ts                # Hook mode clair/sombre/auto (75 lignes)
├── lib/
│   ├── ade-fetcher.ts             # Résolution URL ADE & démos (145 lignes)
│   ├── ade-parser.ts              # Parser iCalendar, cleaning, démos (920 lignes)
│   ├── calendarExport.ts          # Génération RFC 5545 .ics & share (99 lignes)
│   ├── campus.ts                  # Décodage Lens en dur (65 lignes)
│   ├── haptics.ts                 # Vibrations tactiles (57 lignes)
│   ├── highlight.tsx              # Surlignage jaune des recherches (40 lignes)
│   ├── idb.ts                     # IndexedDB v1 stores & migration (192 lignes)
│   └── theme.ts                   # Helpers catégories (105 lignes)
└── public/
    ├── icons/                     # Icônes PWA 192, 512, maskable, svg
    ├── offline.html               # Page de secours hors-ligne
    └── sw.js                      # Service Worker manuel v4
```

---

## 2. Audit Critique : Dette, A11y, CLS & Duplications

### 2.1 Composants Monolithiques (> 300 lignes)
- `lib/ade-parser.ts` (920 lignes) : Mélange de parsing iCalendar brut, logique métier de nettoyage de texte, extraction regex de salles et génération de jeux de données fictifs. À scinder proprement.
- `app/page.tsx` (798 lignes) : Trop de responsabilités (shortcuts, deep links, gestion des 8 modales, synchronisation du temps, orchestration de rendu).
- `components/WeekView.tsx` (705 lignes) : Contient l'algorithme de cluster, le calcul des 4 densités, les rendus conditionnels des colonnes et la gestion du scroll.
- `hooks/useSchedule.ts` (592 lignes) : Combine la gestion des filtres, la sélection de date, l'accès au réseau, la mise en cache et le fallback.
- `components/Header.tsx` (587 lignes) : Mixe logo, édition, horloge, barre de recherche desktop, dropdown de sources, raccourcis et boutons de modales.
- `components/CourseDetailModal.tsx` (466 lignes) : Gère affichage, carte géographique, exports calendriers multiples et création contextuelle de devoirs.
- `features/command-palette/CommandPalette.tsx` (457 lignes) : Gère recherche floue, navigation clavier et sous-menus d'actions.
- `components/UrlModalInput.tsx` (368 lignes), `components/AnalyticsModal.tsx` (350 lignes), `components/SearchBar.tsx` (326 lignes), `components/HomeworkModal.tsx` (325 lignes), `components/TimelineView.tsx` (324 lignes), `components/MobileActionSheet.tsx` (323 lignes), `components/CourseCard.tsx` (315 lignes).

### 2.2 Duplications de Code & Styles Ad-Hoc
- Inconsistance des boutons : Présence de styles inline et de classes utilitaires variées (`bg-[var(--surface)]`, `border border-[var(--border-2)]`, `shadow-tactile-xs`) au lieu de réutiliser uniformément `components/ui/Button` ou `IconButton`.
- Multiples implémentations de modales : Certaines modales réinventent l'overlay, l'en-tête, le bouton de fermeture ou le container au lieu d'encapsuler `components/ui/Dialog`.
- Logique de badges et de couleurs dupliquée : Styles de badges réécrits en dur dans plusieurs composants au lieu de passer par le composant unifié `Badge` et `Stamp`.

### 2.3 Problèmes d'Accessibilité (a11y)
- LiveTicker défilant (`animate-marquee`) : Défilement automatique non conforme aux critères WCAG 2.2 (pas de pause clavier facile, distrayant). Remplacement exigé par une bannière contextuelle statique dismissible avec `aria-live="polite"`.
- Raccourcis clavier mono-touche (`J`, `S`, `L`, `T`, `R`, `F`, `G`) : Risque d'activation accidentelle sans mécanisme de désactivation (critère WCAG 2.1.4 Character Key Shortcuts). Nécessité d'ajouter un paramètre pour activer/désactiver les touches simples.
- Contrastes des tokens : Certains textes secondaires (`--muted-2`) descendent en-dessous de 4.5:1 sur fond clair/sombre. Nécessite une passe de vérification stricte.
- Focus trap et restauration de focus : Tous les overlays doivent garantir le piégeage strict du focus, l'aria-modal, la touche Escape et la restauration du focus sur l'élément déclencheur.

### 2.4 Sources de CLS & Jank
- Flash du thème à l'ouverture : Aucun script inline bloquant dans `<head>` pour appliquer immédiatement `dark` / `color-scheme` avant le premier rendu React.
- Absence de skeletons proportionnés : Chargement affichant un vide ou un loader générique au lieu de squelettes aux dimensions réelles.
- Responsive de la vue semaine sous 640px : Colonnes écrasées ou glissement horizontal saccadé sur mobile. Nécessite un affichage 1 jour pleine largeur + mini-strip hebdomadaire pour les smartphones.
- `ListView` non virtualisée : Risque de lag majeur avec un semestre de 500+ cours.

### 2.5 Incohérences Document vs Code
- `lib/campus.ts` contenait des expressions rationnelles codées en dur au lieu d'une architecture pilotée par les données (`lib/campus.data.ts`).
- Absence de la page interne `/_ui` de démonstration des tokens et composants.
- Données persistées réparties entre localStorage et IndexedDB sans garantie que IndexedDB soit l'unique source de vérité.

---

## 3. Nouvelle Arborescence Feature-Based V3

```
features/
├── schedule/                      # Cœur fonctionnel de l'emploi du temps
│   ├── components/
│   │   ├── CourseCard.tsx         # Carte de cours universelle (4 densités, TP hachuré, copy room)
│   │   ├── CourseDetailModal.tsx  # Fiche détaillée, décodeur campus, export gcal/ics, devoirs
│   │   ├── DailyBriefingCard.tsx  # Une de journal avec grand compteur Display Geist Mono
│   │   ├── DateSelector.tsx       # Sélecteur date, segmented jour/semaine/liste, mini-strip
│   │   ├── TimelineView.tsx       # Vue jour, ligne MAINTENANT rouge, scanline, détection pauses
│   │   ├── WeekView.tsx           # Grille 64px/h, clusters computeEventLayout, responsive <640px
│   │   ├── ListView.tsx           # Vue liste chronologique virtualisée avec react-window
│   │   ├── ScheduleLiveBanner.tsx # Bannière cours en direct, jauge de progression
│   │   ├── ContextBanner.tsx      # Bannière statique contextuelle remplaçant le LiveTicker
│   │   ├── FreeSlotPlannerModal.tsx# Planificateur de révisions dans les créneaux libres pré-DS
│   │   └── ScheduleComparatorModal.tsx # Comparateur simple de deux plannings/groupes
│   ├── hooks/
│   │   └── useSchedule.ts         # Hook d'accès aux données du planning
│   └── types/
├── homework/                      # Module devoirs & travail personnel
│   ├── components/
│   │   └── HomeworkModal.tsx      # Modale devoirs, liaison cours, swipe complete, partage lz-string
│   ├── hooks/
│   │   └── useHomework.ts         # IndexedDB unique source de vérité
│   └── utils/
│       └── homeworkShare.ts       # Compression / décompression URL lz-string
├── exams/                         # Module radar des examens
│   └── components/
│       └── ExamRadarModal.tsx     # Tiers d'urgence (J0-3 / J4-10 / >10), compte à rebours, export
├── analytics/                     # Métriques et graphiques académiques
│   └── components/
│       └── AnalyticsModal.tsx     # Graphiques SVG maison (barres, répartition CM/TD/TP/EXAM)
├── sources/                       # Gestion des sources ADE et groupes
│   └── components/
│       ├── UrlModalInput.tsx      # Modale sources ADE, validation, presets, aide pas-à-pas
│       └── RecentPills.tsx        # Pilules de sources rapides & sélecteur de groupe (2-2 / Tous)
├── palette/                       # Command Palette Raycast / Linear
│   └── components/
│       └── CommandPalette.tsx     # ⌘K / Ctrl+K, fuzzy search, préfixe >, raccourcis
components/
├── ui/                            # Design System UI Kit complet
│   ├── Button.tsx                 # .btn-tactile, états default/primary/ghost/danger
│   ├── IconButton.tsx             # Cible tactile ≥44px, label a11y
│   ├── Badge.tsx                  # Badges de catégories CM/TD/TP/EXAM/PROJET
│   ├── Stamp.tsx                  # Tampons éditoriaux .stamp-badge, .stamp-exam (-1° rotation)
│   ├── Kbd.tsx                    # Touches clavier Geist Mono tabular-nums
│   ├── Segmented.tsx              # Sélecteur segmenté avec glider Framer Motion
│   ├── Tabs.tsx                   # Système d'onglets accessibles WAI-ARIA
│   ├── Input.tsx                  # Champ texte / SearchField avec focus ring accent
│   ├── Switch.tsx                 # Interrupteur accessible
│   ├── Checkbox.tsx               # Case à cocher tactile animée
│   ├── Dialog.tsx                 # Dialogue centré desktop, 3px top border, focus trap, escape
│   ├── BottomSheet.tsx            # Feuille tiroir mobile, grabber, swipe-down >70px
│   ├── Toast.tsx                  # HUD toast 1.2s et notifications système
│   ├── Tooltip.tsx                # Infobulle accessible
│   ├── Skeleton.tsx               # Squelettes aux dimensions exactes du contenu
│   ├── EmptyState.tsx             # États vides avec ton éditorial
│   ├── ErrorState.tsx             # États d'erreur avec bouton « Réessayer »
│   └── Spinner.tsx                # Indicateur rotatif géométrique
├── layout/
│   ├── Header.tsx                 # Masthead 60px, édition, horloge, recherche ⌘K, raccourcis
│   ├── MobileBottomNav.tsx        # Navigation basse 5 items, safe areas
│   ├── MobileActionSheet.tsx      # Tiroir d'actions rapides mobile
│   └── OfflineBanner.tsx          # Bannière réseau & retour en ligne
lib/
├── idb.ts                         # Unique source de vérité IndexedDB + migration localStorage
├── campus.data.ts                 # Base de données structurée du campus Lens & amphis
├── campus.ts                      # Décodeur campus exploitant campus.data.ts
├── ade-parser.ts                  # Parser RFC 5545 iCalendar robuste
├── ade-fetcher.ts                 # Fetcher ADE sécurisé avec timeout & retry
├── calendarExport.ts              # Génération RFC 5545 .ics & share
├── haptics.ts                     # Moteur de retour haptique
├── highlight.tsx                  # Surlignage de texte
└── theme.ts                       # Définitions de thèmes de catégories
hooks/
├── useFocusTrap.ts                # Traitement du focus et WAI-ARIA modal
├── useSwipe.ts                    # Balayages tactiles
├── useTheme.ts                    # Gestion du thème clair/sombre/auto
└── usePwa.ts                      # Cycle de vie PWA, Service Worker, install
app/
├── _ui/page.tsx                   # Page de démo interne de tous les tokens et composants
├── api/schedule/route.ts          # Proxy ADE avec validation Zod, SSRF guard & SWR
├── globals.css                    # Tokens CSS consolidés, double filet, tampons, trames
├── layout.tsx                     # Fonts Bricolage + Geist Mono, script inline anti-flash
├── manifest.ts                    # Web App Manifest PWA complet
└── page.tsx                       # Orchestration épurée du cockpit Aura Campus
```

---

## 4. Matrice des Risques & Stratégies d'Atténuation

| Risque Identifié | Impact | Stratégie d'Atténuation V3 |
| :--- | :--- | :--- |
| **Flash lumineux au chargement (Theme FOUC)** | Élevé (Ergonomie) | Script inline `<script>` bloquant dans `<head>` lisant le localStorage et appliquant immédiatement `.dark` / `.light` et `color-scheme` avant le premier rendu HTML. |
| **Régression sur les deep links (`?view=`, `?modal=`, `?date=`)** | Critique (Fonctionnel) | Maintien scrupuleux des query params, synchronisation bidirectionnelle avec l'historique et tests unitaires de routage. |
| **Perte de données utilisateurs (localStorage vs IndexedDB)** | Critique (Données) | IndexedDB comme unique source de vérité, migration à sens unique avec détection de flag et conservation temporaire de sauvegarde. |
| **Blocage SSRF ou plantage serveur ADE** | Élevé (Disponibilité) | Allowlist stricte des TLDs universitaires, timeout à 12s, réponses d'erreur typées Zod et cache HTTP `stale-while-revalidate`. |
| **Débordement horizontal sur mobile (< 640px)** | Élevé (UI/UX) | En vue semaine sur smartphone : bascule automatique vers affichage 1 jour + mini-strip 6 jours au lieu d'une grille 6 colonnes microscopique. |
| **Conflits de raccourcis clavier avec les lecteurs d'écran** | Moyen (A11y) | Option utilisateur pour désactiver les raccourcis à touche unique (WCAG 2.1.4). |
| **Surcharge mémoire avec des gros fichiers iCal** | Moyen (Perf) | Optimisation de `ade-parser.ts`, mémoïsation stricte et parsing non-bloquant. |

---

## 5. Ordre d'Exécution Pas-à-Pas (Phases 1 à 8)

1. **PHASE 1 : FONDATIONS & DESIGN TOKENS V3**
   - Mise à jour de `app/globals.css` avec la totalité des variables CSS (`:root` + `[data-theme=dark]`).
   - Ajout du double filet signature (1px + 3px), de la trame de points papier, des tampons `.stamp-badge` / `.stamp-exam` à rotation −1°.
   - Intégration du script anti-flash dans `app/layout.tsx`.
   - Script de vérification automatisé des contrastes WCAG.
   - Création de la page interne `app/_ui/page.tsx`.
   - Gate : `tsc --noEmit`, `eslint`, `next build`, tests. Commit `feat(v3): phase 1 – tokens & foundations`.

2. **PHASE 2 : UI KIT (`components/ui`)**
   - Création et enrichissement de tous les composants atomiques : Button, IconButton, Badge, Stamp, Kbd, Segmented, Tabs, Input, Switch, Checkbox, Dialog, BottomSheet, Toast, Tooltip, Skeleton, EmptyState, ErrorState, Spinner.
   - Documentation interactive dans `app/_ui/page.tsx` avec tous leurs états.
   - Gate : validation tests, build et lint. Commit `feat(v3): phase 2 – ui kit components`.

3. **PHASE 3 : SHELL, NAVIGATION & HEADER**
   - Remplacement de `LiveTicker` par `ContextBanner` statique, accessible et dismissible.
   - Restructuration du Header (masthead 60px, horloge, recherche `⌘K`, accès rapides).
   - Intégration de `MobileBottomNav` et `MobileActionSheet`.
   - Command Palette avec recherche floue et actions préfixées `>`.
   - Gestion des raccourcis clavier avec HUD et switch de désactivation des touches uniques.
   - Gate : navigation clavier, build et tests. Commit `feat(v3): phase 3 – shell & navigation`.

4. **PHASE 4 : VUES (JOUR, SEMAINE, LISTE, COURSECARD)**
   - Refonte de `DailyBriefingCard` en format « une de journal » avec grand compteur Display Geist Mono.
   - Perfectionnement de `TimelineView` avec ligne rouge « MAINTENANT », scanline radar et détection de pauses.
   - `WeekView` adaptative : 6 colonnes desktop, 3 colonnes tablette, 1 jour + mini-strip mobile (<640px).
   - `ListView` virtualisée pour le semestre entier.
   - `CourseCard` avec états standard, passé, en cours, TP hachuré et copie de salle.
   - Gate : validation des 3 vues, tests, lint. Commit `feat(v3): phase 4 – calendar views`.

5. **PHASE 5 : MODULES MÉTIER & NOUVEAUTÉS**
   - `CourseDetailModal` connecté à `lib/campus.data.ts`.
   - `ExamRadarModal` avec tiers d'urgence et sessions de révision.
   - `HomeworkModal` avec synchronisation lz-string et filtres optimistes.
   - `AnalyticsModal` avec graphiques SVG personnalisés.
   - Nouveautés : Amphi Focus Mode (`F`), planificateur de révisions pré-DS, partage de devoirs compressé, comparateur de plannings, impression Gazette A4.
   - Gate : tests fonctionnels des modules, build, lint. Commit `feat(v3): phase 5 – domain modules`.

6. **PHASE 6 : DONNÉES, PROXY & PWA**
   - IndexedDB comme source unique de vérité avec migration sécurisée.
   - Proxy `/api/schedule` durci avec Zod, validation d'hôtes et retry.
   - Parser iCalendar RFC 5545 robuste avec suite de tests Vitest.
   - Service worker optimisé, synchronisation SWR, offline complet et flux de mise à jour utilisateur.
   - Gate : tests hors-ligne, build, lint. Commit `feat(v3): phase 6 – data & pwa`.

7. **PHASE 7 : ACCESSIBILITÉ & TESTS**
   - Conformité WCAG 2.2 AA / AAA sur horaires et salles.
   - Suites de tests Vitest complètes (parser, dates, layout, storage).
   - Audits de performance et suppression de tout jank.
   - Gate : 100% tests au vert, build, lint. Commit `feat(v3): phase 7 – a11y & tests`.

8. **PHASE 8 : POLISH FINAL, DOCUMENTATION & RAPPORT**
   - Finitions pixel, alignements 4px, révision des états vides et d'erreurs au ton éditorial.
   - Mise à jour de `DESIGN.md` en v3.0, rédaction de `ARCHITECTURE.md` et actualisation de `README.md`.
   - Rapport final avant/après.
   - Commit `feat(v3): phase 8 – final polish & documentation`.
