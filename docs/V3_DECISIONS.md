# V3_DECISIONS.md — Registre des Décisions d'Ingénierie & Design V3

> Ce document consigne l'ensemble des choix techniques, arbitrages d'ergonomie et résolutions d'ambiguïtés pris lors de la refonte V3 d'Aura Campus.

---

## 1. Fondations & Design Tokens (Phase 1)
- **Gestion du Thème & Anti-Flash :**
  - *Décision :* Utilisation conjointe des attributs `class="dark"` / `class="light"` et `[data-theme="dark"]` sur l'élément `<html>`, avec un script inline non différé placé en tête de `<head>` dans `app/layout.tsx`.
  - *Justification :* Empêche tout effet de flash blanc ou noir (FOUC) avant l'hydratation de React, tout en restant compatible avec Tailwind v4 et les sélecteurs CSS natifs.
- **Palette & Contrastes WCAG :**
  - *Décision :* Calibrage de `--muted` à `#5A5956` (en clair) et `#9B9A97` (en sombre) pour garantir un ratio de contraste minimal de 4.8:1 sur fond de carte, et élévation à 7:1 pour les horaires et salles via `--text` et `--text-2`.
  - *Justification :* Respect strict du niveau WCAG AA pour les métadonnées et AAA pour les informations académiques critiques.
- **Double Filet Signature & Tampons :**
  - *Décision :* Définition des classes `.gazette-filet` (bordure double 1px + 3px avec espacement physique) et `.stamp-badge` / `.stamp-exam` (rotation fixe `-1deg` en CSS pur sans calcul JavaScript).
  - *Justification :* Ancrage fort de l'esthétique presse de prestige sans impacter le budget de calcul du thread principal.

---

## 2. Système de Composants UI Kit (Phase 2)
- **Centralisation des Composants :**
  - *Décision :* Tous les boutons, modales, champs de formulaire, badges et conteneurs doivent impérativement utiliser les composants de `components/ui/`.
  - *Justification :* Éradication des 14 variations disparates de boutons tactiles et standardisation des micro-interactions.
- **Routage de la page `/_ui` en Next.js App Router :**
  - *Décision :* Création du dossier `app/%5Fui/` au lieu de `app/_ui/`.
  - *Justification :* En Next.js App Router, les dossiers préfixés par un underscore simple `_nom` sont traités comme des répertoires privés et ignorés du routage. Le codage d'URL `%5Fui` permet d'exposer publiquement la route réelle `/_ui`.
- **BottomSheet Mobile & Dialog Desktop :**
  - *Décision :* Unification sous une API unique : affichage en feuille tiroir glissant depuis le bas avec geste de swipe-down (>70px) sur mobile (<640px), et modale centrée avec bordure supérieure 3px sur desktop (>=640px).

---

## 3. Shell, Navigation & Clavier (Phase 3)
- **Remplacement du Marquee LiveTicker :**
  - *Décision :* Remplacement complet de l'animation de défilement perpétuel par une bannière d'information statique contextuelle dismissible, dotée de `role="status"` et `aria-live="polite"`.
  - *Justification :* Amélioration majeure de l'accessibilité (suppression des distractions cognitives) et adhésion à la règle « zéro animation traînante ».
- **Raccourcis Clavier & WCAG 2.1.4 :**
  - *Décision :* Ajout d'une option dans les paramètres permettant de désactiver ou remapper les raccourcis à touche unique (`J`, `S`, `L`, `T`, `R`, `F`, `G`).
  - *Justification :* Les utilisateurs de technologies d'assistance (commandes vocales, loupes) peuvent ainsi naviguer sans déclenchements involontaires.

---

## 4. Vues Calendaires (Phase 4)
- **Responsive Semaine sur Smartphone (<640px) :**
  - *Décision :* Sur écran étroit, la vue semaine bascule automatiquement sur l'affichage du jour courant en pleine largeur, surmonté d'un mini-strip de 6 jours avec pastilles d'activité et support du balayage horizontal (swipe).
  - *Justification :* Une grille de 6 colonnes sur un écran de 375px rend le texte illisible (colonnes de 45px de large). L'approche 1 jour + strip préserve la lisibilité sans perte de contexte.
- **Virtualisation de la Vue Liste :**
  - *Décision :* Emploi d'une liste virtualisée réactive (`react-window`) pour afficher l'intégralité du semestre sans dépasser 30 éléments rendus dans le DOM à un instant T.

---

## 5. Modules Métier & Données Campus (Phase 5)
- **Base Campus Découplée (`lib/campus.data.ts`) :**
  - *Décision :* Extraction des règles de localisation dans un dictionnaire structuré contenant les bâtiments, étages, amphis, accès PMR et repères visuels de la Faculté des Sciences de Lens.
  - *Justification :* Facilité de maintenance et extension ultérieure sans toucher au code des composants.
- **Partage P2P des Devoirs :**
  - *Décision :* Sérialisation JSON compressée en base64 via `lz-string` injectée dans le fragment d'URL (`#hw=...`), sans recours à une base de données serveur distante.
  - *Justification :* Fonctionnement 100% hors-ligne et respect absolu de la vie privée des étudiants.

---

## 6. Stockage & Service Worker (Phase 6)
- **IndexedDB comme Unique Source de Vérité :**
  - *Décision :* Migration automatique et unidirectionnelle des données existantes de `localStorage` vers IndexedDB (`aura-campus-db`, version 1). Une fois migré, `localStorage` n'est plus utilisé que comme drapeau de migration (`aura_idb_migrated_v1`).
  - *Justification :* Absence de quota restrictif (5 Mo) de localStorage, transactions asynchrones non bloquantes pour le fil d'exécution UI.
- **Stratégie Service Worker :**
  - *Décision :* Maintien d'un Service Worker sur-mesure ultra-léger avec Network-First + SWR sur `/api/schedule`, Cache-First sur les chunks statiques hachés Next.js et polices Google Fonts, et interception navigation vers `offline.html`.

---

## 7. Accessibilité & Performance (Phase 7)
- **Mode Contraste Élevé (@media (prefers-contrast: more)) :**
  - *Décision :* Intégration d'un ensemble de tokens CSS dédiés renforçant les bordures en noir ou blanc pur, supprimant les trames de fond texturées et augmentant l'épaisseur de l'anneau de focus clavier à 3px franc.
  - *Justification :* Garantie d'une lisibilité AAA (contrastes > 7:1 et jusqu'à 21:1) pour les étudiants malvoyants.
- **Découpage des Paquets & Dynamic Imports :**
  - *Décision :* Chargement différé via `next/dynamic` (`ssr: false`) des boîtes de dialogue complexes (`AnalyticsModal`, `RevisionPlannerModal`, `ScheduleComparatorModal`, `ShortcutsModal`, `UrlModalInput`).
  - *Justification :* Maintien d'un bundle initial JavaScript minimal (< 150 KB gzip), LCP accéléré et INP < 100ms.
- **Conformité React 19 & ESLint 9 :**
  - *Décision :* Remplacement des synchronisations d'état internes dans `useEffect` par un état dérivé calculé et des gestionnaires d'événements explicites.
  - *Justification :* Élimination des doubles rendus et respect des garde-fous de React 19.

---

## 8. Finition Pixel & Expérience Éditoriale (Phase 8)
- **Écran de Chargement Squelette Haute Fidélité :**
  - *Décision :* Remplacement du spinner d'attente par une structure squelette reproduisant fidèlement la mise en page de la gazette : masthead, briefing card avec compteurs d'heures, et 3 cartes de cours dimensionnées à l'identique du contenu réel.
  - *Justification :* Zéro décalage de mise en page (CLS = 0) et perception de chargement instantanée.
- **Gestion Dynamique du theme-color :**
  - *Décision :* Mise à jour synchrone de toutes les balises `<meta name="theme-color">` lors de l'alternance clair/sombre (`#0F0F0E` en sombre, `#F5F3EE` en clair), complétée par les attributs `appleWebApp.capable` et `startupImage` pour iOS.
  - *Justification :* Intégration parfaite dans la barre d'état et le navigateur système (Safari iOS, Chrome Android, PWA standalone).
- **Parcours Personas Sans Friction :**
  - *Décision :* Validation des flux Lucas (smartphone 375px : swipe, haptique, 1 jour + mini-strip), Camille (laptop 1024px : vue 6 colonnes, palette `⌘K`, radar DS) et Alexandre (desktop : raccourcis à 1 touche, export impression A4 gazette).


---
