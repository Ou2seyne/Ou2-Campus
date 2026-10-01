# DESIGN.md — Aura Campus · Référence Maître Design Web & Spécifications UI/UX

> **Statut :** Document normatif absolu · Version 2.0 Web & Mobile (Mise à jour intégrale 100 %)  
> **Plateforme :** Application Web Universelle (Desktop, Laptops, Tablettes tactiles, Navigateurs mobiles, PWA & App Native iOS)  
> **Stack UI :** Next.js 16 (App Router), Turbopack, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, date-fns (FR), Lucide React  
> **Typographies :** Bricolage Grotesque (Display & Titres), Geist Mono (Données techniques, Horaires, Salles, Stats, kbd)  
> **Architecture Données :** Local-First avec IndexedDB v1 + Cache HTTP Stale-While-Revalidate, Proxy Serveur sans CORS  
> **Cible Métier Pilote :** L1 Maths-Info TD2 / TP 2-2 – Université d'Artois, Faculté des Sciences de Lens  

---

## Sommaire Général

1. [Vision Produit, Cibles Web & Proposition de Valeur](#1-vision-produit-cibles-web--proposition-de-valeur)
2. [Design System & Spécifications UI (« Gazette Structurée V2.0 »)](#2-design-system--spécifications-ui-gazette-structurée-v20)
3. [Architecture Détaillée des Composants & Vues de Consultation](#3-architecture-détaillée-des-composants--vues-de-consultation)
4. [Centre de Commande & Navigation Avancée](#4-centre-de-commande--navigation-avancée)
5. [Expérience Mobile-First, PWA & Application iOS](#5-expérience-mobile-first-pwa--application-ios)
6. [Modules Métier, Modales & Outils Académiques](#6-modules-métier-modales--outils-académiques)
7. [Architecture Données, Stockage Local-First & Performance](#7-architecture-données-stockage-local-first--performance)
8. [Feuille de Route Produit & Perspectives Futures](#8-feuille-de-route-produit--perspectives-futures)

---

## 1. Vision Produit, Cibles Web & Proposition de Valeur

### 1.1 Résumé Exécutif & Différenciation Concurrentielle
**Aura Campus** est un cockpit académique haute performance conçu pour la consultation, l'organisation et l'optimisation des emplois du temps universitaires issus du logiciel institutionnel **ADE Campus**.

Historiquement, l'interface standard d'ADE Campus souffre de lourds déficits ergonomiques :
- **Austérité et illisibilité sur navigateur :** Tableaux rigides, navigation calendaire laborieuse, scroll horizontal impraticable, absence totale de hiérarchie typographique moderne.
- **Pollution visuelle de cohortes partagées :** Les séances de différents sous-groupes (ex. TD1, TD2, TP 2-1, TP 2-2) se superposent dans le même flux, provoquant des faux chevauchements et une surcharge cognitive importante.
- **Absence d'outils de productivité :** Aucun suivi des devoirs relié aux cours, aucune visibilité anticipée des contrôles continus (DS/examens), aucun tableau de bord sur les volumes horaires semestriels.

**La Proposition de Valeur Aura Campus :**
Une expérience web et mobile de calibre professionnel (inspirée des standards de *Linear*, *Raycast* et de la presse d'information imprimée grand format) qui transforme un flux de données brutes iCalendar en un cockpit dynamique :
1. **Design « Gazette Structurée / Bold Editorial » :** Une interface dense, typographique et rythmée où la couleur, les bordures franches et les polices *encodent* directement la nature de l'information avant même la lecture du texte.
2. **Filtrage chirurgical du groupe d'études :** Ségrégation automatique des créneaux (par défaut ciblé sur **L1 Maths-Info TD2 / TP 2-2 – Université d'Artois, Faculté des Sciences de Lens**) éliminant à 100 % le bruit visuel des autres sous-groupes.
3. **Productivité intégrée en un seul écran :** Radar d'examens avec compte à rebours en jours, gestionnaire de devoirs contextuel par matière, métriques de charge hebdomadaire, détection intelligente des pauses méridiennes, et exports universels (Google Calendar, flux iCal standard, Web Share).
4. **Vitesse instantanée & Zéro Latence (Local-First) :** Démarrage en 0 ms grâce à un stockage local IndexedDB couplé au proxy serveur Next.js avec réhydratation en arrière-plan (Stale-While-Revalidate).

---

### 1.2 Personas Cibles & Parcours Utilisateur

```
+----------------------------------------------------------------------------------------------------+
|                                      PERSONAS CIBLES AURA CAMPUS                                   |
+----------------------------------+----------------------------------+------------------------------+
| 1. Lucas (Étudiant Mobile Web)   | 2. Camille (Laptop & Clavier)    | 3. Alexandre (Power User PC) |
| "Quel est mon amphi dans 5 min?" | "Planifier la semaine et devoirs"| "Optimiser révisions & promo"|
| Écran : Smartphone (Safari/Chrome| Écran : MacBook/Laptop 13-15"    | Écran : Double écran 24-27"  |
| Mode : Vue Jour, Scanline Live   | Mode : Vue Semaine, Raccourcis   | Mode : Vue Liste, Analytics  |
+----------------------------------+----------------------------------+------------------------------+
```

#### Persona 1 : Lucas — L'étudiant en déplacement (Smartphone & PWA)
- **Profil :** Étudiant de 1ère année de Licence Maths-Info, souvent dans les couloirs du campus avec son smartphone.
- **Contexte d'usage :** Consulte le site sur Safari iOS ou Chrome Android en connexion 4G/5G ou Wi-Fi universitaire instable.
- **Objectifs clés :**
  - Savoir en 2 secondes chrono où a lieu son prochain cours et combien de temps il lui reste pour s'y rendre.
  - Vérifier la durée exacte de la pause déjeuner et la salle du cours de l'après-midi.
  - Copier le numéro de salle en un tapotement pour l'envoyer à un camarade de promo.
- **Attentes UX :** Cibles tactiles d'au moins 44×44px, gestes de balayage horizontal (swipe) pour changer de jour, Pull-to-Refresh natif, retours haptiques aux clics (`lib/haptics.ts`), absence totale de sauts de mise en page (CLS = 0).

#### Persona 2 : Camille — La planificatrice rigoureuse (Laptop 13–15")
- **Profil :** Étudiante méthodique révisant à la bibliothèque universitaire ou chez elle le soir sur son ordinateur portable.
- **Contexte d'usage :** Navigateur en plein écran, utilisation conjointe du touchpad et du clavier physique.
- **Objectifs clés :**
  - Avoir une vue d'ensemble claire du planning de la semaine pour organiser ses séances de révision et son travail personnel.
  - Noter les devoirs et exercices demandés par les enseignants directement sur la matière concernée.
  - Surveiller le compte à rebours des contrôles continus (DS) pour anticiper ses fiches de révision.
- **Attentes UX :** Raccourcis clavier universels (`J`, `S`, `L`, `T`, `R`, `/`, `Cmd+K`, `?`), vue semaine complète tenant sur l'écran sans scroll interne vertical forcé, modales accessibles fermables par la touche `Escape`.

#### Persona 3 : Alexandre — L'étudiant délégué & organisateur de groupe (Desktop Multi-écrans)
- **Profil :** Représentant de promotion ou tuteur d'étudiants, travaillant sur un poste fixe avec grand écran (1080p / 1440p / 4K).
- **Contexte d'usage :** Fenêtre navigateur côte-à-côte avec des supports de cours, VS Code ou Discord.
- **Objectifs clés :**
  - Basculer en un clic entre le flux du Groupe 2-2, du Groupe 2-1 ou de l'ensemble de la promo pour comparer les plannings.
  - Analyser les volumes horaires réels par matière pour détecter les semaines de surcharge académique via la modale Analytics.
  - Exporter des événements spécifiques vers son agenda Google Calendar ou télécharger des fichiers `.ics` propres.
- **Attentes UX :** Densité d'affichage optimale sans espace blanc gaspillé, sélecteurs d'onglets ultra-réactifs, surlignage temps réel lors des recherches textuelles de salles ou de professeurs.

---

### 1.3 Principes Directeurs d'Ingénierie UI/UX

1. **Zéro Latence Perçue (0 ms) :** Chargement instantané des données depuis le cache local IndexedDB avant même la fin de la requête réseau.
2. **Encodage Visuel par la Couleur et la Forme :** Tout cours affiche son type d'enseignement (CM, TD, TP, Examen, Projet) par une bordure gauche de 3 à 4px, un badge coloré et un motif tactile.
3. **Accessibilité Universelle (WCAG AA & AAA) :** Tous les textes d'horaires et d'informations critiques respectent un contraste supérieur à 4.8:1 (AA) ou 7:1 (AAA). Les TP intègrent un motif hachuré 45° pour garantir la distinction aux personnes daltoniennes.
4. **Comportement Mécanique Tactile :** Les boutons s'enfoncent physiquement sous la pression (`translate(1.5px, 1.5px)` avec ombre dure sans flou).

---

## 2. Design System & Spécifications UI (« Gazette Structurée V2.0 »)

### 2.1 Philosophie Formelle : "L'Anti-Lisse Industriel"
À contre-courant des tendances web génériques (dégradés pastels mous, cartes flottantes aux ombres diffuses et bordures ultra-arrondies de 32px), Aura Campus applique les principes stricts d'une **Gazette Industrielle Moderne** :
- **Bordures physiques nettes :** Séparateurs francs de 1px (`var(--border)` et `var(--border-2)`) instaurant une structure de grille de journal rigoureuse.
- **Trame de fond Gazette :** Texture de points réguliers radiaux (`radial-gradient(circle, var(--border) 0.75px, transparent 0.75px)` avec espacement 24×24px).
- **Boutons tactiles mécaniques (`.btn-tactile`) :** Ombres portées dures à 90° sans flou (`box-shadow: 2px 2px 0px 0px var(--border-2)`). Au clic ou à l'état actif, l'élément s'enfonce physiquement (`transform: translate(1.5px, 1.5px); box-shadow: 0px 0px 0px 0px transparent`).
- **Textures fonctionnelles :** Les Travaux Pratiques (TP) disposent d'un motif hachuré géométrique en CSS pur (`.pattern-tp`), garantissant une distinction visuelle immédiate même pour les utilisateurs souffrant de déficiences chromatiques.
- **Rayon de courbure contrôlé :** Strictement borné à `rounded-xs` (2px, `--r-1`) ou `rounded-sm` (4px, `--r-2`). Zéro `rounded-3xl` ni formes de bulles molles.

---

### 2.2 Palette de Couleurs & Tokens Sémantiques

L'application intègre un système natif à double thème : **Light Mode (Papier Gazette chaud)** et **Dark Mode (Obsidienne & Ardoise dense)**.

#### Tableau 1 : Tokens de Surfaces, Textes et Bordures

| Token CSS | Thème Clair (Light) | Thème Sombre (Dark) | Rôle Fonctionnel & Ergonomie | Contraste WCAG |
| :--- | :--- | :--- | :--- | :--- |
| `--bg` | `#F5F3EE` | `#0F0F0E` | Fond de page global (trame papier journal en clair, nuit profonde en sombre). | Base |
| `--surface` | `#FFFFFF` | `#1A1917` | Fond des cartes principales, fenêtres modales et barres d'outils. | 16.5:1 sur texte |
| `--surface-2` | `#EEECE8` | `#232220` | Fond secondaire (zones d'en-tête de tableau, formulaires, kbd). | AAA |
| `--surface-3` | `#E6E3DC` | `#2D2C29` | Fond tertiaire pour états inactifs, survols neutres et séparateurs. | AA |
| `--text` | `#0D0D0C` | `#F0EFEB` | Texte de premier niveau (titres, horaires principaux, chiffres). | AAA (18.2:1) |
| `--text-2` | `#2E2D2B` | `#C6C4BF` | Texte secondaire (corps d'explication, intitulés complémentaires). | AAA (11.4:1) |
| `--muted` | `#5A5956` | `#9B9A97` | Métadonnées (enseignants, durées, mentions de pagination). | AA (4.8:1) |
| `--muted-2` | `#9B9A97` | `#6B6A67` | Lignes directrices, raccourcis non survolés, icônes décoratives. | Graphique (3:1) |
| `--border` | `#D8D5CE` | `#302F2C` | Bordures de division standard (séparateurs de cartes, grille). | Structurel |
| `--border-2` | `#BAB7AF` | `#413F3B` | Bordures actives et contours d'ombres dures tactiles (`shadow-tactile`). | Structurel fort |
| `--accent` | `#0052CC` | `#4B8BF5` | Couleur d'accentuation interactive (boutons primaires, liens, focus ring).| AA (5.2:1 / 4.7:1) |
| `--accent-hover` | `#003FA3` | `#72A7F8` | État de survol de l'accent primaire. | AA |
| `--accent-dim` | `rgba(0,82,204,0.12)` | `rgba(75,139,245,0.14)`| Fond teinté pour le jour sélectionné ou éléments actifs discrets. | Décoratif |

---

### 2.3 Matrice Catégorielle d'Enseignement

| Catégorie | Rôle Métier | Thème Clair (Barre / Fond / Survol) | Thème Sombre (Barre / Fond / Survol) | Rendu Visuel |
| :--- | :--- | :--- | :--- | :--- |
| **CM** | Cours Magistral (Amphi) | `--cm-bar: #3730A3`<br>`--cm-bg: #EEF0FD`<br>`--cm-bg-strong: #C7D0FA` | `--cm-bar: #818CF8`<br>`--cm-bg: #1A1A35`<br>`--cm-bg-strong: #2D2D60` | Indigo institutionnel solennel. Badge franc texte blanc contrasté. |
| **TD** | Travaux Dirigés (Salle) | `--td-bar: #B45309`<br>`--td-bg: #FEF3C7`<br>`--td-bg-strong: #FDE68A` | `--td-bar: #F59E0B`<br>`--td-bg: #2A1F08`<br>`--td-bg-strong: #3D2E0A` | Ocre ambre chaleureux. Distinction immédiate. |
| **TP** | Travaux Pratiques (Labo/Machines)| `--tp-bar: #15803D`<br>`--tp-bg: #DCFCE7`<br>`--tp-bg-strong: #BBF7D0` | `--tp-bar: #4ADE80`<br>`--tp-bg: #0A1F10`<br>`--tp-bg-strong: #0F3018` | Vert sapin équilibré + motif hachuré géométrique 45° (`.pattern-tp`). |
| **EXAM** | DS, Partiel, Contrôle continu | `--exam-bar: #B91C1C`<br>`--exam-bg: #FEE2E2`<br>`--exam-bg-strong: #FECACA` | `--exam-bar: #F87171`<br>`--exam-bg: #200A0A`<br>`--exam-bg-strong: #3D1010` | Rouge carmin d'alerte. Tampon industriel `.stamp-exam` en lettres capitales. |
| **PROJET** | Workshop, Rendu, Soutenance | `--projet-bar: #7C3AED`<br>`--projet-bg: #EDE9FE`<br>`--projet-bg-strong: #DDD6FE` | `--projet-bar: #A78BFA`<br>`--projet-bg: #180E2E`<br>`--projet-bg-strong: #2A1850` | Violet électrique contemporain. |
| **AUTRE** | Soutien, Conférence, Tutorat | `--autre-bar: #475569`<br>`--autre-bg: #E2E8F0`<br>`--autre-bg-strong: #CBD5E1` | `--autre-bar: #94A3B8`<br>`--autre-bg: #1A2130`<br>`--autre-bg-strong: #253040` | Ardoise neutre fonctionnelle. |
| **LIVE** | Séance en cours en ce moment | `--live-bar: #15803D`<br>`--live-bg: #DCFCE7`<br>`--live-pulse: #22C55E` | `--live-bar: #4ADE80`<br>`--live-bg: #0A1F10`<br>`--live-pulse: #4ADE80` | Cadre vert clignotant, scanline radar animée et jauge live. |

---

### 2.4 Typographie Responsive & Échelle Modulaire

1. **`Bricolage Grotesque` (`var(--font-sans)`) :** Titres, labels catégoriels, noms de matières, boutons et textes d'explication.
2. **`Geist Mono` (`var(--font-mono)`) :** Données numériques, horaires, durées, codes cours, numéros de salles, statistiques et touches clavier (`kbd`). Elle est configurée obligatoirement avec `font-variant-numeric: tabular-nums` afin d'éviter tout sautillement de mise en page lors des décomptes.

```
ÉCHELLE TYPOGRAPHIQUE RESPONSIVE
┌──────────────────────┬──────────────────────┬─────────────┬──────────────┬────────────────────────────┐
| Niveau               | Taille Desktop / Web | Taille Mob. | Line-Height  | Font-Weight & Police       |
├──────────────────────┼──────────────────────┼─────────────┼──────────────┼────────────────────────────┤
| Display (Compteurs)  | 2.25rem (36px)       | 1.75rem     | 1.05         | 800 · Geist Mono           |
| H1 (Titre page)      | 1.25rem (20px)       | 1.00rem     | 1.20         | 800 · Bricolage Grotesque  |
| H2 (Modales/Sections)| 1.125rem (18px)      | 1.00rem     | 1.25         | 700 · Bricolage Grotesque  |
| H3 (Titre carte)     | 1.125rem (18px)      | 1.00rem     | 1.25         | 800 · Bricolage Grotesque  |
| Body (Standard)      | 0.875rem (14px)      | 0.875rem    | 1.45         | 500/600 · Bricolage        |
| Caption (Salles/Prof)| 0.75rem (12px)       | 0.75rem     | 1.35         | 600/700 · Geist Mono       |
| Micro / Stamp        | 0.625rem (10px)      | 0.625rem    | 1.20         | 800 · Geist Mono (Caps)    |
└──────────────────────┴──────────────────────┴─────────────┴──────────────┴────────────────────────────┘
```

**Règles Inaltérables de Clamping de Texte :**
- Dans les composants React, tout clamping doit impérativement utiliser les propriétés camelCase valides :
  `WebkitLineClamp: maxLines` et `WebkitBoxOrient: 'vertical'`.
- Ne jamais injecter de noms préfixés en kebab-case (`'-webkit-line-clamp'`), sous peine d'erreur console et d'invalidation de la règle en `px` par React.

---

### 2.5 Grille, Layouts & Breakpoints Navigateur

```
BREAKPOINTS NORMALISÉS
┌────────────────────────┬─────────────────────┬──────────────────────────┬────────────────────────┐
| Nom du Breakpoint      | Plage de Largeur    | Largeur Container Max    | Disposition Principale |
├────────────────────────┼─────────────────────┼──────────────────────────┼────────────────────────┤
| Mobile Web             | < 640px             | 100% (Padding 16px)      | Pile verticale unique  |
| Tablette Web           | 640px – 1024px      | 100% (Padding 24px)      | Grille 3 colonnes sem. |
| Desktop Web            | 1024px – 1440px     | max-w-5xl (1024px)       | Grille 6 col. alignée  |
| Large Desktop Web      | > 1440px            | max-w-5xl centré         | Centré + marges aérées |
└────────────────────────┴─────────────────────┴──────────────────────────┴────────────────────────┘
```

**Gestion des Safe Areas Mobiles :**
- Prise en charge des encoches et barres d'accueil via `.pt-safe` (`env(safe-area-inset-top)`) et `.pb-safe` (`env(safe-area-inset-bottom)`).
- Dégagement bas de 96px (`pb-24`) sur mobile pour laisser libre accès à la barre de navigation basse (`MobileBottomNav`).

---

### 2.6 Système d'Élévation Tactile & Ombres Dures

Contrairement aux ombres douces floues (Drop Shadows standard), Aura Campus utilise des **ombres dures à 90° sans flou**, simulant un découpage physique mécanique :
- `--el-0` : `none`
- `--el-1` (`.shadow-tactile-xs`) : `1.5px 1.5px 0px 0px var(--border-2)`
- `--el-2` (`.shadow-tactile-sm`) : `2px 2px 0px 0px var(--border-2)`
- `--el-3` (`.shadow-tactile`) : `3px 3px 0px 0px var(--border-2)`
- `--el-dark` (`.shadow-tactile-dark`) : `2.5px 2.5px 0px 0px var(--text)`
- `--el-accent` (`.shadow-tactile-accent`) : `2.5px 2.5px 0px 0px var(--accent)`

---

## 3. Architecture Détaillée des Composants & Vues de Consultation

```
ZONAGE DE L'APPLICATION WEB & DESKTOP
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LiveTicker] Défilement continu : Prochains examens · Actualités campus      │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Sticky Header] Logo Calendrier · Nom flux · Horloge live · Actions rapides   │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Bannière Réseau] Offline / Reconnexion (si hors-ligne)                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ [RecentPills] Favoris enregistrés (L1 Maths, Démos) · + Ajouter             │
├──────────────────────────────────────────────────────────────────────────────┤
│ [SearchBar] Recherche globale · Onglets CM/TD/TP · Matin/Aprem · Gr. 2-2/Tous│
├──────────────────────────────────────────────────────────────────────────────┤
│ [DateSelector] Nav. ← Auj. → · Segmented Jour/Semaine/Liste · Strip 6 jours  │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Zone Principale de Contenu]                                                 │
│                                                                              │
│  ► En Vue Jour   : DailyBriefingCard (Cockpit) + TimelineView chronologique  │
│  ► En Vue Semaine: ScheduleLiveBanner (Compact) + WeekView (Axe fixe 8h-20h) │
│  ► En Vue Liste  : ListView groupée par jour avec totaux horaires            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Footer Web] Mentions légales Artois ADE · Raccourcis clavier physiques [JSL]│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.1 Vue Jour (`TimelineView` & `DailyBriefingCard`)

1. **DailyBriefingCard (Cockpit du Jour) :**
   - Synthétise en temps réel : cours en cours (avec temps restant), prochain cours (avec salle et professeur), volume total de cours de la journée, et nombre de devoirs à rendre.
   - Message d'accueil dynamique selon le moment de la journée (matin, après-midi, soirée).
2. **Fil Chronologique & Ligne Repère Live :**
   - Ligne rouge dynamique insérée à l'endroit exact de l'heure courante entre deux séances, avec pastille pulsante.
3. **Détecteur Intelligent de Pauses :**
   - Si l'intervalle libre entre deux cours consécutifs atteint ou dépasse 20 minutes :
     - Si le créneau est compris entre 11h30 et 14h00 : bandeau spécifique **Pause Déjeuner** avec durée exacte (ex. `Pause déjeuner • 1h15 (11h45 – 13h00)`).
     - Si la pause a lieu en ce moment : bandeau d'alerte ambré dynamique indiquant le temps restant avant la reprise et la salle du cours suivant.

---

### 3.2 Spécification Exhaustive de la Vue Semaine (`WeekView`)

La vue semaine a été entièrement repensée pour reproduire la clarté d'un panneau d'affichage académique sans nécessiter de défilement vertical interne au conteneur.

#### 1. Axe Horaire Fixe et Constante d'Échelle
- **Axe de gauche constant :** Colonne horaire fixe de 56px (`w-14 sm:w-16`) affichant les repères de `08:00` à `20:00` (ou ajustée automatiquement si des cours ont lieu plus tôt ou plus tard).
- **Hauteur horaire normalisée :** `HOUR_HEIGHT = 64px` (soit 32px par demi-heure, `pxPerMin = 64 / 60 ≈ 1.0667 px/min`).
- **Alignement strict :** Chaque créneau horaire est traversé par une ligne de grille horizontale subtile (`border-b border-[var(--border)]/35`) et un repère en pointillés pour la demi-heure.

#### 2. Algorithme de Détection et de Résolution des Chevauchements (`computeEventLayout`)
Lorsque plusieurs séances ont lieu sur la même plage horaire dans une même journée (ex. créneau partagé ou dédoublement de groupe) :
1. Tri des événements par heure de début croissante, puis par durée décroissante.
2. Regroupement en **clusters d'événements qui se chevauchent** (`startMin < clusterEnd`).
3. Allocation dynamique de colonnes (`colIndex` de `0` à `totalCols - 1`).
4. Calcul proportionnel du positionnement horizontal :
   - `widthPercent = 100 / totalCols`
   - `leftPercent = colIndex * widthPercent`
   - Décalage physique et marge de séparation de 6px (`left: calc(${leftPercent}% + 3px)`, `width: calc(${widthPercent}% - 6px)`).

#### 3. Architecture Adaptative à 4 Niveaux de Densité de Carte
Pour éviter tout débordement de texte quel que soit le créneau :
- **Niveau 1 : Micro (`cardH < 36px`) :** Une ligne unique condensée affichant le titre tronqué en typographie 9px bold.
- **Niveau 2 : Tiny (`cardH < 56px`) :** Heure de début en Geist Mono 10px + Titre sur 1 ligne + Badge court de matière.
- **Niveau 3 : Compact (`cardH < 88px`) :** Ligne d'en-tête (horaire complet `08:30–10:00` + badge) + Titre sur 3 lignes avec `WebkitLineClamp: 3`.
- **Niveau 4 : Complet (`cardH ≥ 88px`) :**
  - **En-tête fixe (20px) :** Horaires avec icône horloge, indicateur live pulsant vert si en cours, tampon `DS` si examen, badge catégorie.
  - **Zone Titre flex-1 avec budget pixel exact :**
    - Calcul mathématique : `titleBudget = Math.max(0, cardH - HEADER_H (20) - FOOTER_H (20) - GAP (8))`.
    - Nombre maximum de lignes calculé dynamiquement : `maxLines = Math.max(1, Math.floor(titleBudget / 16))`.
    - Style appliqué : `WebkitLineClamp: maxLines`, `WebkitBoxOrient: 'vertical'`, `overflow: 'hidden'`.
  - **Pied de carte fixe (20px) :** Icône `MapPin`, nom de la salle ou du bâtiment décodé, badge de sous-groupe (ex. `2-2`).

#### 4. Cartes Contextuelles Automatiques
- **Bandeau « Après-midi libre » :** Si une journée comporte des cours le matin mais aucun l'après-midi, un encadré tactile hachuré avec icône soleil couchant (`Sunset`) s'insère automatiquement depuis la fin du dernier cours jusqu'à 19:00.
- **Bandeau « Journée libre » :** Si le jour sélectionné n'a aucun cours, un bloc centré avec icône café (`Coffee`) occupe la hauteur de la colonne.
- **Indicateur temps réel :** Une ligne horizontale rouge vif avec pastille clignotante traverse la colonne du jour courant à la minute exacte.

---

### 3.3 Vue Liste (`ListView`)
- Regroupement des événements par date chronologique avec en-tête horizontal en Geist Mono (`EEEE d MMMM yyyy • X cours`).
- Surlignage temps réel en jaune de tous les termes correspondant à la recherche active (sur le titre de la matière, le nom du professeur ou le numéro de salle) via le composant `<HighlightText />`.

---

### 3.4 Live Ticker & Schedule Live Banner

1. **LiveTicker (Bandeau de Défilement Continu) :**
   - Composant de dépêche situé au sommet du site (`.animate-marquee`).
   - Fait défiler en continu les prochaines alertes critiques : prochain contrôle continu dans X jours, séance en cours, rappel de mise à jour.
   - S'arrête automatiquement au survol souris pour permettre la lecture calme.
2. **ScheduleLiveBanner :**
   - En vue semaine et jour, bandeau récapitulatif du cours en cours : jauge de progression temporelle animée, temps restant en minutes, bouton d'ouverture rapide de la fiche de salle.

---

## 4. Centre de Commande & Navigation Avancée

### 4.1 Palette de Commandes Universelle `Cmd+K` (`CommandPalette`)

Véritable centre névralgique de productivité de type *Raycast / Linear*, la palette de commandes est accessible à tout moment via le raccourci clavier universel `Cmd+K` (macOS) ou `Ctrl+K` (Windows/Linux) :
- **Recherche floue instantanée :** Indexation en mémoire de tous les cours du semestre, des enseignants, des salles et des actions applicatives.
- **Navigation au clavier sans souris :**
  - `Flèche Haut` / `Flèche Bas` : Parcours des résultats avec mise en surbrillance physique.
  - `Entrée` : Exécution immédiate de l'action ou ouverture du cours sélectionné.
  - `Échap` : Fermeture instantanée.
- **Actions rapides intégrées :**
  - Basculer vers Vue Jour, Semaine ou Liste
  - Revenir à Aujourd'hui
  - Ouvrir le Radar d'Examens
  - Ouvrir les Devoirs
  - Ouvrir les Statistiques
  - Basculer le Thème Sombre / Clair
  - Rafraîchir les données ADE

---

### 4.2 Système de Recherche Globale & Filtres Multi-axes (`SearchBar`)

- **Filtres de Catégories Glisseurs :** Onglets Tous, CM, TD, TP, Examens, Projets avec chariot d'arrière-plan tactile animé par Framer Motion (`layoutId="active-cat-glider"`).
- **Filtre Temporel :** Bascule instantanée entre *Matin* (cours avant 13h) et *Après-midi* (cours après 13h).
- **Sélecteur de Sous-groupe :** Permet d'isoler en 1 clic le groupe assigné (`2-2 ★`), le groupe alternatif (`2-1`) ou l'intégralité de la promotion (`Tous`).

---

### 4.3 Navigation Clavier Universelle

| Raccourci | Action Déclenchée | Contexte d'Activation |
| :--- | :--- | :--- |
| `Cmd+K` / `Ctrl+K` | Ouvrir la Palette de Commandes | Partout (hors champs texte) |
| `J` | Basculer en **Vue Jour** | Partout |
| `S` | Basculer en **Vue Semaine** | Partout |
| `L` | Basculer en **Vue Liste** | Partout |
| `←` / `→` | Naviguer vers le jour ou la semaine précédente / suivante | Partout |
| `T` | Revenir immédiatement à **Aujourd'hui** | Partout |
| `R` | Forcer le rafraîchissement immédiat du flux ADE | Partout |
| `/` | Donner le focus à la barre de recherche textuelle | Partout |
| `?` | Ouvrir la modale récapitulative des raccourcis | Partout |
| `Échap` (`Esc`) | Fermer toute modale, action sheet ou palette active | Partout |

**Affichage Tête Haute (HUD Toast) :**  
À chaque déclenchement d'un raccourci clavier, une pastille noire minimale (`.shadow-tactile-dark`) apparaît pendant 1,2 seconde en bas à droite de l'écran avec un point vert pulsant pour confirmer visuellement l'action (ex. `Vue Semaine [S]`).

---

## 5. Expérience Mobile-First, PWA & Application iOS

### 5.1 Barre de Navigation Basse Mobile (`MobileBottomNav`)
Sur écran tactile (< 640px), une barre de navigation fixe s'ancre au bas de l'écran avec 5 points d'ancrage ergonomiques :
1. **Aujourd'hui / Jour :** Si non actif, bascule en vue jour ; si déjà en vue jour, revient immédiatement au cours du jour présent.
2. **Semaine :** Bascule vers la vue semaine complète.
3. **Devoirs :** Ouvre la modale des devoirs avec pastille numérique du nombre de devoirs restants à accomplir.
4. **Contrôles :** Ouvre le Radar des examens avec badge rouge d'alerte si une évaluation est imminente.
5. **Plus / Menu :** Déclenche la feuille d'action mobile (`MobileActionSheet`).

---

### 5.2 Feuille d'Actions Mobile (`MobileActionSheet`)
Composant Bottom-Sheet tactile nativement optimisé pour l'utilisation à une seule main :
- Tiroir glissant depuis le bas de l'écran avec poignée tactile (`sheet-grabber`).
- Accès direct : Statistiques & volumes horaires, gestion des sources ADE, bascule thème clair/sombre, aide aux raccourcis et guide d'installation PWA.
- Fermeture par tapotement sur le backdrop ou balayage rapide vers le bas.

---

### 5.3 Gestuelle Native & Moteur Haptique Web

1. **Pull-to-Refresh (`PullToRefresh.tsx`) :**
   - Geste de tirage vers le bas depuis le sommet de la page sur mobile.
   - Feedback visuel avec indicateur rotatif et vibration haptique au seuil de déclenchement (70px).
   - Lance la resynchronisation complète du flux ADE sans recharger la page.
2. **Balayage Horizontal (`useSwipe.ts`) :**
   - Détection des swipes horizontaux gauche/droite pour faire défiler les jours ou les semaines.
3. **Moteur de Retour Haptique (`lib/haptics.ts`) :**
   - Utilise l'API native `navigator.vibrate` sur terminaux mobiles compatibles :
     - `tap()` : vibration sèche de 8ms pour les clics sur les boutons et onglets.
     - `light()` : 12ms pour les sélections de filtres.
     - `success()` : motif double impulsion `[10, 40, 15]` ms lors de la validation d'un devoir.
     - `warning()` : motif `[25, 50, 25]` ms pour les alertes d'examen ou d'erreur réseau.

---

### 5.4 Progressive Web App (PWA) & Manifeste V2
- Fichier manifeste standardisé (`app/manifest.ts`) : mode `standalone`, orientation portrait prioritaire, couleur de thème `#0052CC`, icônes maskable 192px et 512px.
- Raccourcis natifs d'application (App Shortcuts) sur l'écran d'accueil du téléphone : *Aujourd'hui*, *Semaine*, *Contrôles*, *Devoirs*.
- Composants `PwaInstallBanner` et `PwaInstallSheet` guidant l'utilisateur sur iOS Safari ("Sur l'icône de partage, puis 'Sur l'écran d'accueil'") et sur Android Chrome (invite native en 1 tap).

---

### 5.5 Wrapper d'Application Native iOS
Pour les utilisateurs préférant une application iOS native installable par fichier `.ipa` ou TestFlight :
- Projet Xcode complet dans `ios-app/` (`AuraCampus.xcodeproj` généré via `project.yml`).
- Script de compilation automatisé `build_ipa.sh` produisant un binaire signé prêt pour le déploiement.
- Conteneur WebKit optimisé sans bande blanche d'en-tête et synchronisé avec la Safe Area de l'iPhone.

---

## 6. Modules Métier, Modales & Outils Académiques

### 6.1 Fiche Détaillée de Cours (`CourseDetailModal`) & Décodeur Campus

1. **Moteur Géographique Faculté des Sciences de Lens (`lib/campus.ts`) :**
   - Analyse automatique du champ de salle pour identifier le lieu exact sur le campus :
     - *Grand Amphi / Amphi Souriau / Amphi Barbeaux* -> Bâtiment Sciences, Rez-de-chaussée.
     - *Salles D001 à D300* -> Bâtiment D (Mathématiques & Informatique), avec décodage de l'étage (D0xx = RDC, D1xx = 1er étage, D2xx = 2ème étage).
     - *Salles C001 à C200* -> Bâtiment C (Chimie & Physique).
     - *Salles E001 à E200* -> Bâtiment E (Biologie & Géologie).
2. **Actions Intégrées :**
   - **Ajouter à Google Agenda :** Lien d'export direct avec titre, dates UTC formatées, salle et description.
   - **Télécharger .ics :** Fichier calendrier standard conforme RFC 5545 (`lib/calendarExport.ts`).
   - **Partager :** Déclenchement de l'API native `navigator.share` (ou copie presse-papier automatique).
   - **Gestionnaire de devoirs contextuel :** Affichage des devoirs existants pour ce cours et ajout immédiat d'une tâche sans quitter la modale.

---

### 6.2 Radar des Examens (`ExamRadarModal`)
- Analyse sémantique continue des flux ADE recherchant les mots-clés : `DS`, `Examen`, `Partiel`, `Contrôle`, `Évaluation`.
- Classement par urgence calendaire :
  - *Critique (Aujourd'hui / J-1 à J-3) :* Tampon rouge clignotant.
  - *Modéré (J-4 à J-10) :* Badge ambre ocre.
  - *Lointain (> J-10) :* Badge ardoise neutre.
- Bouton direct pour ajouter une session de révision au gestionnaire de devoirs.

---

### 6.3 Gestionnaire de Devoirs & Tâches (`HomeworkModal`)
- Création de devoirs associés soit à une matière spécifique de l'emploi du temps, soit en tâche libre.
- Tri par statut (*À faire*, *Terminés*, *Tous*) avec date d'échéance facultative.
- Persistance double : stockage réactif dans IndexedDB (`lib/idb.ts`) et miroir dans `localStorage` pour compatibilité totale.

---

### 6.4 Tableau de Bord Analytique (`AnalyticsModal`)
- Calcul en temps réel du volume d'heures d'enseignement réelles.
- Répartition volumétrique et pourcentages : Cours Magistraux (CM), Travaux Dirigés (TD), Travaux Pratiques (TP), Examens.
- Top 5 des matières les plus lourdes du cursus universitaire.
- Commutateur d'analyse : *Semaine affichée* ou *Semestre complet*.

---

### 6.5 Gestionnaire de Sources ADE (`UrlModalInput`)
- Prise en charge des liens ADE directs au format `.shu` (propres aux universités françaises) et des flux universels `.ics`.
- Bibliothèque de démos pré-intégrées en 1 clic :
  - *L1 Maths-Info TD2 / TP 2-2 (Université d'Artois - Faculté des Sciences de Lens)*
  - *L1 Mathématiques Fondamentales*
  - *Licence 3 Informatique Générale*
  - *Master MIAGE*
  - *BUT Informatique Semestre 4*

---

## 7. Architecture Données, Stockage Local-First & Performance

### 7.1 Moteur Local-First IndexedDB (`lib/idb.ts`)

Pour garantir un chargement en 0 ms sans écran blanc même en cas de coupure du Wi-Fi universitaire, Aura Campus utilise une base IndexedDB typée (`aura-campus-db`, version 1) :
- **Store `schedule-cache` :** Clé `scheduleId`, valeur contenant les événements parsés et le timestamp `fetchedAt`.
- **Store `homework` :** Indexation par `courseTitle` et par statut d'accomplissement `isDone`.
- **Store `settings` :** Préférences utilisateur, thème et configuration de groupe.

**Cycle Stale-While-Revalidate :**
1. Au chargement de la page, les données du cache IndexedDB sont injectées immédiatement dans le state React (0 ms).
2. En arrière-plan, la requête réseau vers `/api/schedule` interroge le serveur ADE.
3. Si des modifications sont détectées, l'interface est mise à jour de manière transparente sans clignotement.

---

### 7.2 Proxy Serveur Next.js (`app/api/schedule/route.ts`)
- Élimination des blocages CORS imposés par les serveurs universitaires ADE.
- Conversion automatique des URLs de consultation `.shu` en flux de données iCalendar `.ics`.
- Parsing et nettoyage des chaînes de caractères (suppression des codes internes parasites, extraction des noms d'enseignants et des salles).

---

### 7.3 Performance Web & Budget Métriques
- **Cumulative Layout Shift (CLS) = 0 :** Dimensions fixes et budgets en pixels alloués à l'avance pour tous les blocs dynamiques.
- **Largest Contentful Paint (LCP) < 1.2s :** Données servies depuis le stockage local dès la première frame.
- **First Input Delay (FID) < 50ms :** Zéro calcul lourd bloquant sur le thread principal.
- **Réduction de mouvement (`prefers-reduced-motion`) :** Désactivation instantanée de toutes les animations (durée ramenée à 0.01ms) pour les utilisateurs sensibles.

---

### 7.4 Mode Impression Gazette Universitaire (`@media print`)
- Feuille de style dédiée à l'impression : suppression des en-têtes, de la barre d'outils et de la navigation basse.
- Fond blanc papier pur (`#FFFFFF`), texte noir contrasté (`#000000`), bordures grises d'imprimerie.
- Permet d'imprimer ou d'exporter en PDF propre le planning de la semaine sur une seule page A4.

---

## 8. Feuille de Route Produit & Perspectives Futures

1. **Plan Vectoriel Interactif SVG du Campus de Lens :**
   - Mini-carte intégrée dans la fiche de cours avec surlignage de l'aile du bâtiment (Sciences, D, C, E) et fléchage piéton depuis l'entrée.
2. **Synchronisation P2P Chiffrée des Devoirs (Local-First Sync) :**
   - Partage d'une liste de devoirs de TD entre délégués et étudiants via des liens compressés sans compte serveur.
3. **Calculateur de Charge de Révision Pré-DS :**
   - Suggestion automatique de créneaux de travail personnel dans les plages libres du planning en fonction des dates d'examens détectées.

---

> **Aura Campus · Gazette Structurée V2.0**  
> *L'alliance de la rigueur typographique, de la performance technique et du confort étudiant.*
