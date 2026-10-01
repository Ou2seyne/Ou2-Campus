# DESIGN.md — Aura Campus · Référence Maître Design Web & Spécifications UI/UX

> **Statut :** Document normatif absolu · Version 3.0 Web & Mobile (Mise à jour intégrale V3)  
> **Plateforme :** Application Web Universelle (Desktop, Laptops, Tablettes tactiles, Navigateurs mobiles, PWA installable & iOS Safari)  
> **Stack UI :** Next.js 16 (App Router), Turbopack, React 19, TypeScript strict, Tailwind CSS v4, Framer Motion, date-fns (FR), Lucide React  
> **Typographies :** Bricolage Grotesque (Display & Titres), Geist Mono (Données techniques, Horaires, Salles, Stats, kbd)  
> **Architecture Données :** Local-First avec IndexedDB v1 (`aura-campus-db`), Proxy Serveur sans CORS avec Anti-SSRF  
> **Cible Métier Pilote :** L1 Maths-Info TD2 / TP 2-2 – Université d'Artois, Faculté des Sciences de Lens  

---

## Sommaire Général

1. [Vision Produit, Cibles Web & Proposition de Valeur](#1-vision-produit-cibles-web--proposition-de-valeur)
2. [Design System & Spécifications UI (« Gazette Structurée V3.0 »)](#2-design-system--spécifications-ui-gazette-structurée-v30)
3. [Architecture Détaillée des Composants & Vues de Consultation](#3-architecture-détaillée-des-composants--vues-de-consultation)
4. [Centre de Commande, Navigation & Palette `⌘K`](#4-centre-de-commande-navigation--palette-k)
5. [Expérience Mobile-First & PWA Installable](#5-expérience-mobile-first--pwa-installable)
6. [Modules Métier & Outils Académiques V3](#6-modules-métier--outils-académiques-v3)
7. [Gestion des États, Deep Linking & Résilience](#7-gestion-des-états-deep-linking--résilience)
8. [Feuille de Route & Spécifications Normatives Inaltérables](#8-feuille-de-route--spécifications-normatives-inaltérables)

---

## 1. Vision Produit, Cibles Web & Proposition de Valeur

### 1.1 Résumé Exécutif & Différenciation Concurrentielle
**Aura Campus** est un cockpit académique haute performance conçu pour la consultation, l'organisation et l'optimisation des emplois du temps universitaires issus du logiciel institutionnel **ADE Campus**.

**La Cible Esthétique V3 :**
Une gazette imprimée de luxe rencontre un cockpit Linear/Raycast. Dense, typographique, précis, jamais générique : pas de dégradés pastels, pas de blobs, pas de glassmorphism mou, pas de cartes flottantes à ombres diffuses.

1. **Identité « Gazette Structurée / Anti-Lisse Industriel » :** Une interface dense et rythmée où la couleur, les bordures franches 1px, les ombres dures sans flou à 90°, les rayons ≤ 4px et la typographie encodent directement l'information.
2. **Encodage CM / TD / TP / EXAM par barre + fond + motif :** Les Travaux Pratiques intègrent un motif hachuré 45° en CSS pur pour l'accessibilité aux daltoniens.
3. **Typographie binaire stricte :** `Bricolage Grotesque` pour l'éditorial et les titres, `Geist Mono` pour toutes les données numériques, horaires, codes cours, touches kbd et statistiques. Aucune 3e famille de police, aucune serif.
4. **Productivité intégrée en un seul écran :** Radar d'examens avec tiers d'urgence (J0–J-3 / J-4–J-10 / >J-10), planificateur de révisions sur les créneaux libres, partage P2P de devoirs par liens compressés `lz-string`, comparateur de plannings, et export Gazette imprimable A4 en noir et blanc.

---

### 1.2 Personas Cibles & Parcours Utilisateur

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      PERSONAS CIBLES AURA CAMPUS V3                                │
├──────────────────────────────────┬──────────────────────────────────┬──────────────────────────────┤
│ 1. Lucas (Étudiant Mobile Web)   │ 2. Camille (Laptop & Clavier)    │ 3. Alexandre (Power User PC) │
│ "Quel est mon amphi dans 5 min?" │ "Planifier la semaine et devoirs"│ "Optimiser révisions & promo"│
│ Écran : Smartphone 375–430px     │ Écran : MacBook/Laptop 13–15"    │ Écran : Desktop 1080p à 4K   │
│ Mode : Vue Jour, Scanline Live   │ Mode : Vue Semaine, Palette ⌘K   │ Mode : Comparateur, Gazette  │
└──────────────────────────────────┴──────────────────────────────────┴──────────────────────────────┘
```

#### Persona 1 : Lucas — L'étudiant en déplacement (Smartphone & PWA)
- **Objectifs :** Consulter son prochain cours en < 2 secondes, voir la salle décodée, copier le numéro de salle en un tapotement, glisser pour changer de jour.
- **Expérience V3 :** Header compact 60px avec badge réseau et horloge live, `DailyBriefingCard` sous forme de une de journal avec grand compteur Display Geist Mono, timeline avec ligne rouge « MAINTENANT », scanline radar sur le cours actif, bandeau pause déjeuner ambre, vue semaine adaptée en 1 jour plein écran + mini-strip 6 jours interactif, swipe tactile horizontal et haptique.

#### Persona 2 : Camille — La planificatrice rigoureuse (Laptop 13–15")
- **Objectifs :** Visualiser la semaine complète sans scroll forcé, planifier ses révisions dans les créneaux libres, noter ses devoirs.
- **Expérience V3 :** Grille semaine 6 colonnes avec axe horaire 56–64px (`HOUR_HEIGHT = 64`), clustering `computeEventLayout` pour les chevauchements, 4 niveaux de densité de carte, palette `⌘K` avec recherche floue et préfixe `>` pour les actions, planificateur de révision automatisé avant les DS.

#### Persona 3 : Alexandre — L'étudiant délégué & organisateur (Desktop Multi-écrans)
- **Objectifs :** Comparer les plannings de sous-groupes (2-2 vs 2-1) pour trouver des créneaux libres communs, analyser la charge semestrielle, imprimer le planning A4.
- **Expérience V3 :** `ScheduleComparatorModal` avec détection automatique des pauses méridiennes communes, `AnalyticsModal` avec graphiques SVG vectoriels de charge hebdomadaire, raccourcis clavier universels avec HUD toast de 1,2s, mode impression `@media print` en noir et blanc pur.

---

## 2. Design System & Spécifications UI (« Gazette Structurée V3.0 »)

### 2.1 Philosophie Formelle : "L'Anti-Lisse Industriel"
- **Bordures physiques nettes :** Séparateurs francs de 1px (`var(--border)` et `var(--border-2)`), double filet signature (1px + 3px avec espace physique) sous le masthead et entre sections majeures (`.filet-double`).
- **Texture de fond Gazette :** Trame de points papier très légère en clair (`radial-gradient(circle, var(--border) 0.75px, transparent 0.75px)` espacée de 24×24px) et grain quasi-invisible en sombre.
- **Boutons tactiles mécaniques (`.btn-tactile`) :** Ombres dures à 90° sans flou (`box-shadow: 2px 2px 0px 0px var(--border-2)`). Enfoncement physique à l'activation (`transform: translate(1.5px, 1.5px); box-shadow: none`). Cibles tactiles ≥ 44×44px.
- **Tampons éditoriaux (`.stamp-badge`, `.stamp-exam`) :** Rotation fixe subtile de -1° (`transform: rotate(-1deg)`), double bordure mécanique, lettres capitales Geist Mono.
- **Rayons de courbure stricts :** Strictement bornés à `rounded-xs` (2px, `--r-1`) ou `rounded-sm` (4px, `--r-2`). Aucun arrondi supérieur à 4px.

---

### 2.2 Palette de Couleurs & Tokens Sémantiques

L'application prend en charge trois modes : **Clair (Papier journal chaud)**, **Sombre (Obsidienne & Ardoise dense)**, et **Contraste Élevé (`prefers-contrast: more`)**.

#### Tableau 1 : Tokens de Surfaces, Textes et Bordures

| Token CSS | Thème Clair (Light) | Thème Sombre (Dark) | Rôle Fonctionnel & Ergonomie | Contraste WCAG |
| :--- | :--- | :--- | :--- | :--- |
| `--bg` | `#F5F3EE` | `#0F0F0E` | Fond global de la gazette | Base |
| `--surface` | `#FFFFFF` | `#1A1917` | Fond des cartes principales et modales | 16.5:1 sur texte |
| `--surface-2` | `#EEECE8` | `#232220` | Fond secondaire (zones d'en-tête, inputs, kbd) | AAA |
| `--surface-3` | `#E6E3DC` | `#2D2C29` | Fond tertiaire pour états inactifs et séparateurs | AA |
| `--text` | `#0D0D0C` | `#F0EFEB` | Titres, horaires principaux, chiffres clés | AAA (> 18:1) |
| `--text-2` | `#2E2D2B` | `#C6C4BF` | Texte secondaire, intitulés complémentaires | AAA (> 11:1) |
| `--muted` | `#5A5956` | `#9B9A97` | Métadonnées (enseignants, durées, pagination) | AA (≥ 4.8:1) |
| `--muted-2` | `#9B9A97` | `#6B6A67` | Lignes directrices, raccourcis non survolés | Graphique (3:1) |
| `--border` | `#D8D5CE` | `#302F2C` | Bordures de division standard (grille, cartes) | Structurel |
| `--border-2` | `#BAB7AF` | `#413F3B` | Bordures actives et contours d'ombres dures | Structurel fort |
| `--accent` | `#0052CC` | `#4B8BF5` | Accentuation interactive principale | AA (≥ 4.7:1) |
| `--accent-hover` | `#003FA3` | `#72A7F8` | État de survol de l'accent primaire | AA |
| `--accent-dim` | `rgba(0,82,204,0.12)` | `rgba(75,139,245,0.14)` | Fond teinté de sélection | Décoratif |

#### Tableau 2 : Tokens du Mode Contraste Élevé (`@media (prefers-contrast: more)`)
- Bordures : Noires pures (`#000000`) en clair, blanches pures (`#FFFFFF`) en sombre.
- Focus-Visible : Anneau d'accentuation épais de 3px franc avec décalage de 2px.
- Trames décoratives : Désactivées au profit d'un aplat pur afin d'éliminer tout bruit visuel.
- Contrastes mesurés : Entre 7:1 (AAA) et 21:1 sur l'intégralité des surfaces.

---

### 2.3 Matrice Catégorielle d'Enseignement

| Catégorie | Rôle Métier | Thème Clair (Barre / Fond / Survol) | Thème Sombre (Barre / Fond / Survol) | Signature Visuelle V3 |
| :--- | :--- | :--- | :--- | :--- |
| **CM** | Cours Magistral | `--cm-bar: #3730A3`<br>`--cm-bg: #EEF0FD` | `--cm-bar: #818CF8`<br>`--cm-bg: #1A1A35` | Indigo solennel. Badge franc contrasté. |
| **TD** | Travaux Dirigés | `--td-bar: #B45309`<br>`--td-bg: #FEF3C7` | `--td-bar: #F59E0B`<br>`--td-bg: #2A1F08` | Ocre ambre chaleureux. |
| **TP** | Travaux Pratiques | `--tp-bar: #15803D`<br>`--tp-bg: #DCFCE7` | `--tp-bar: #4ADE80`<br>`--tp-bg: #0A1F10` | Vert sapin + motif hachuré géométrique 45° (`.pattern-tp`). |
| **EXAM** | DS, Contrôle, Partiel | `--exam-bar: #B91C1C`<br>`--exam-bg: #FEE2E2` | `--exam-bar: #F87171`<br>`--exam-bg: #200A0A` | Rouge carmin. Tampon `.stamp-exam` à rotation -1°. |
| **PROJET** | Workshop, Soutenance | `--projet-bar: #7C3AED`<br>`--projet-bg: #EDE9FE` | `--projet-bar: #A78BFA`<br>`--projet-bg: #180E2E` | Violet contemporain. |
| **AUTRE** | Tutorat, Conférence | `--autre-bar: #475569`<br>`--autre-bg: #E2E8F0` | `--autre-bar: #94A3B8`<br>`--autre-bg: #1A2130` | Ardoise neutre fonctionnelle. |
| **LIVE** | Cours en cours | `--live-bar: #15803D`<br>`--live-bg: #DCFCE7` | `--live-bar: #4ADE80`<br>`--live-bg: #0A1F10` | Scanline radar verte, outline live et jauge temporelle. |

---

### 2.4 Typographie Responsive & Règles de Clamping

1. **`Bricolage Grotesque` (`var(--font-sans)`) :** Titres, masthead, noms de cours, boutons et explications textuelles.
2. **`Geist Mono` (`var(--font-mono)`) :** Chiffres, horaires, codes matières, numéros de salles, touches kbd et statistiques. Configurée obligatoirement avec `font-variant-numeric: tabular-nums` pour figer la largeur des colonnes lors des décomptes.
3. **Numérotation Éditoriale :** Mention de chapeau de type `ÉDITION DU MARDI 30 SEPTEMBRE · SEM. 40` en Geist Mono majuscules avec `letter-spacing: 0.08em`.
4. **Règle Absolue de Clamping React :** Tout clamping de texte multi-lignes doit utiliser les propriétés camelCase standard :
   `style={{ WebkitLineClamp: maxLines, WebkitBoxOrient: 'vertical', display: '-webkit-box' }}`. L'usage de préfixes kebab-case est strictement proscrit.

---

### 2.5 Motion, Micro-Interactions & Élévations Tactiles

- **Durées et Courbes :** Transitions rapides de 120ms (`--dur-fast`) à 180ms (`--dur-base`) avec easing sec `cubic-bezier(0.16, 1, 0.3, 1)`. Déplacement maximal ≤ 12px. Aucun effet de rebond élastique (bounce) ni de zoom disproportionné au survol.
- **Réduction de Mouvement (`prefers-reduced-motion: reduce`) :** Durées d'animation et de transition ramenées instantanément à `0.01ms`.
- **Élévations par Ombres Dures à 90° :**
  - `--el-0` : `none`
  - `--el-1` (`.shadow-tactile-xs`) : `1.5px 1.5px 0px 0px var(--border-2)`
  - `--el-2` (`.shadow-tactile-sm`) : `2px 2px 0px 0px var(--border-2)`
  - `--el-3` (`.shadow-tactile`) : `3px 3px 0px 0px var(--border-2)`
  - `--el-dark` (`.shadow-tactile-dark`) : `2.5px 2.5px 0px 0px var(--text)`
  - `--el-accent` (`.shadow-tactile-accent`) : `2.5px 2.5px 0px 0px var(--accent)`

---

## 3. Architecture Détaillée des Composants & Vues de Consultation

```
ZONAGE DE L'APPLICATION V3
┌──────────────────────────────────────────────────────────────────────────────┐
│ [ContextBanner] Statut statique accessible (DS proche · Données du jour)     │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Double Filet] 1px + 3px signature éditoriale                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Sticky Header 60px] Masthead · Édition & Sem. · Horloge live · ⌘K · Actions │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Bannière Réseau] Indicateur offline / synchronisation                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ [SearchBar] Filtres CM/TD/TP/EXAM · Matin/Aprem · Groupe 2-2/2-1/Tous        │
├──────────────────────────────────────────────────────────────────────────────┤
│ [DateSelector] Nav. ← Auj. → · Segmented Jour/Semaine/Liste · Mini-strip 6j │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Zone Principale de Contenu]                                                 │
│                                                                              │
│  ► Vue Jour    : DailyBriefingCard (Grand Compteur) + TimelineView           │
│  ► Vue Semaine : Responsive 3 tiers (1j+strip <640px / 3 col / 6 col)        │
│  ► Vue Liste   : Virtualisée avec totaux d'heures et content-visibility     │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Navigation Basse Mobile] Jour · Semaine · Devoirs · Contrôles · Plus        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.1 Vue Jour (`TimelineView` & `DailyBriefingCard`)
1. **DailyBriefingCard (Une de Journal) :**
   - Grand affichage Display en Geist Mono tabular-nums : temps avant la prochaine séance ou temps restant avant la fin.
   - Prochain cours avec salle décodée, nom de l'enseignant, volume d'heures du jour et devoirs à rendre.
   - Barre de progression linéaire de la journée.
2. **Fil Chronologique & Repère Live :**
   - Ligne rouge vif « MAINTENANT » insérée à la minute exacte entre deux séances.
   - Scanline animée sur le cours en cours.
3. **Détecteur Intelligent de Pauses :**
   - Pauses ≥ 20 minutes signalées.
   - Créneau 11h30–14h00 : bandeau spécifique **Pause Déjeuner** avec icône couverts (`Utensils`).
   - Si la pause a lieu au moment présent : bandeau d'alerte ambré dynamique indiquant le temps restant avant la reprise.

---

### 3.2 Vue Semaine Adaptative (`WeekView`)
1. **Responsive Explicite à 3 Niveaux :**
   - **Desktop (≥ 1024px) :** Grille intégrale de 6 colonnes synchronisées (Lundi au Samedi).
   - **Tablette (640px – 1023px) :** Grille de 3 colonnes avec commutateur segmenté (Lun–Mer / Jeu–Sam).
   - **Mobile (< 640px) :** Affichage d'**un seul jour en pleine largeur** surmonté d'un mini-strip de navigation de 6 jours avec indicateurs de charge et geste de balayage horizontal (swipe). Élimine tout écrasement illisible à 375px.
2. **Axe Horaire & Échelle Proportionnelle :**
   - Hauteur horaire normalisée : `HOUR_HEIGHT = 64px` (32px par demi-heure).
   - Axe gauche de 56px (`08:00` à `20:00`).
3. **Résolution des Chevauchements (`computeEventLayout`) :**
   - Détection des clusters d'événements simultanés, attribution des colonnes virtuelles et calcul proportionnel en pourcentage avec marges physiques de 6px.
4. **4 Niveaux de Densité de Carte :**
   - `micro` (< 36px) : Ligne condensée bold 9px.
   - `tiny` (< 56px) : Heure de début + titre 1 ligne + badge.
   - `compact` (< 88px) : Horaires + badge + titre clamped à 3 lignes.
   - `full` (≥ 88px) : En-tête 20px, zone titre avec calcul mathématique du budget de lignes (`titleBudget / 16`), pied de carte 20px avec salle et icône.

---

### 3.3 CourseCard (Partout)
- **États Standard :** Fond de carte teinté selon catégorie, bordure gauche 4px franche.
- **État Passé :** Opacité réduite à 0.65, saturation 0.8 pour focaliser l'attention sur les séances à venir.
- **État En Cours :** Contour vert live, scanline radar et badge `EN COURS · X MIN RESTANTES`.
- **État Survol :** Fond accentué (`var(--surface-2)` ou fond de catégorie renforcé), élévation tactile.
- **Focus Clavier :** Contour accent 2px avec offset 2px.
- **Copie Immédiate de la Salle :** Clic sur la salle copiant le texte dans le presse-papier avec confirmation visuelle pendant 2,0 secondes (`Copié !`).

---

## 4. Centre de Commande, Navigation & Palette `⌘K`

### 4.1 Palette de Commandes Universelle (`CommandPalette`)
- Déclenchement : Raccourci universel `Cmd+K` (macOS) ou `Ctrl+K` (Windows/Linux), y compris lorsque le focus réside dans un champ de saisie.
- **Recherche Floue :** Indexation instantanée des cours, salles, professeurs et modules.
- **Mode Actions (`>`) :** Préfixer la requête par `>` isole les actions du système :
  - `> jour`, `> semaine`, `> liste` : Changement de vue.
  - `> aujourd'hui` : Retour à la date du jour.
  - `> examens`, `> devoirs`, `> révisions`, `> comparateur`, `> stats` : Ouverture directe des modales.
  - `> thème` : Alternance clair/sombre.
  - `> rafraîchir` : Synchronisation réseau immédiate.
  - `> source` : Modification du flux ADE.
- **Historique Récent :** Conservation des dernières requêtes pour un accès en 1 clic.
- **Navigation Clavier :** Flèches haut/bas, touche Entrée pour valider, Échap pour clore.

---

### 4.2 Système de Raccourcis Clavier & Conformité WCAG 2.1.4

| Touche | Action Déclenchée | Contexte |
| :--- | :--- | :--- |
| `Cmd+K` / `Ctrl+K` | Ouvrir la Palette de Commandes | Partout |
| `J` | Basculer en **Vue Jour** | Hors saisie |
| `S` | Basculer en **Vue Semaine** | Hors saisie |
| `L` | Basculer en **Vue Liste** | Hors saisie |
| `T` | Revenir à **Aujourd'hui** | Hors saisie |
| `R` | Forcer la synchronisation ADE | Hors saisie |
| `F` | Activer le **Mode Focus Amphi** | Hors saisie |
| `G` | Sélecteur rapide de date | Hors saisie |
| `/` | Focus sur la barre de recherche | Hors saisie |
| `?` | Ouvrir la modale des raccourcis | Hors saisie |
| `Échap` | Fermer toute boîte de dialogue ou tiroir actif | Partout |

**Option de Désactivation WCAG 2.1.4 :**  
Dans la modale des raccourcis (`ShortcutsModal`), un commutateur permet de désactiver les raccourcis à touche unique (`J`, `S`, `L`, etc.) afin de garantir une accessibilité parfaite aux étudiants utilisant des logiciels de dictée vocale.

---

## 5. Expérience Mobile-First & PWA Installable

1. **Navigation Basse Mobile (`MobileBottomNav`) :**
   - 5 onglets tactiles : *Jour*, *Semaine*, *Devoirs*, *Contrôles*, *Plus*.
   - Prise en compte de la zone sécurisée basse (`env(safe-area-inset-bottom)`).
   - Badges numériques signalant les devoirs non faits et les examens imminents.
2. **Feuille d'Actions Mobile (`MobileActionSheet`) :**
   - Tiroir glissant depuis le bas avec poignée (grabber) et fermeture par balayage vers le bas (> 70px).
3. **Installation PWA Guidée :**
   - Interception de l'événement `beforeinstallprompt` après engagement utilisateur.
   - Feuille d'instructions illustrée pour Safari iOS (« Sur l'écran d'accueil »).
   - Mémorisation de l'état refusé pour ne pas solliciter abusivement l'étudiant.
4. **Service Worker Résilient :**
   - Ouverture et fonctionnement 100 % hors-ligne même sans connectivité.
   - Notification toast discrète en cas de mise à jour disponible avec activation `skipWaiting`.

---

## 6. Modules Métier & Outils Académiques V3

### 6.1 Fiche Détaillée de Cours (`CourseDetailModal`) & Décodeur Campus
- Moteur géographique basé sur un dictionnaire structuré (`lib/campus.data.ts`) pour la Faculté des Sciences de Lens :
  - *Amphis Souriau, Barbeaux, Grand Amphi* -> Bâtiment Sciences, Rez-de-chaussée.
  - *Salles D001 à D300* -> Bâtiment D (Maths & Info) avec étage décodé.
  - *Salles C001 à C200* -> Bâtiment C (Chimie & Physique).
  - *Salles E001 à E200* -> Bâtiment E (Biologie & Géologie).
  - Fallback explicite en cas de salle non répertoriée.
- Actions : Export Google Agenda, téléchargement `.ics` standardisé RFC 5545, Web Share natif, création directe de devoirs contextuels.

### 6.2 Radar d'Examens (`ExamRadarModal`)
- Tiers d'urgence catégorisés :
  - **Critique (J0 à J-3) :** Tampon rouge clignotant, priorité absolue.
  - **Modéré (J-4 à J-10) :** Badge ambre ocre.
  - **Lointain (> J-10) :** Badge ardoise neutre.
- Bouton direct pour ouvrir le Planificateur de Révision sur les créneaux libres.

### 6.3 Gestionnaire de Devoirs & Partage P2P (`HomeworkModal`)
- Association de chaque tâche à une matière existante du semestre ou en tâche libre.
- **Partage P2P par lien compressé :** Sérialisation compressée de devoirs via `lz-string` injectée dans le paramètre d'URL `?hwShare=...`. Permet aux délégués de partager des exercices par un lien direct sans serveur tiers.
- Gestes mobiles : Balayage horizontal pour marquer comme terminé (swipe-to-complete) avec vibration haptique.

### 6.4 Planificateur de Révision Pré-DS (`RevisionPlannerModal`)
- Analyse automatique de l'emploi du temps entre 09:00 et 19:00 sur les 7 jours précédant un contrôle continu.
- Détection des créneaux libres ≥ 1h30 (hors pauses déjeuner).
- Création en 1 clic de sessions de révision enregistrées automatiquement dans les devoirs.

### 6.5 Comparateur de Plannings (`ScheduleComparatorModal`)
- Comparaison côte-à-côte de deux flux (ex. Groupe 2-2 vs Groupe 2-1).
- Détection algorithmique des plages horaires libres communes (pauses midi communes, après-midis partagés pour le travail en groupe).

### 6.6 Tableau de Bord Analytique (`AnalyticsModal`)
- Graphiques SVG vectoriels purs sans bibliothèque externe :
  - Volume quotidien d'heures d'enseignement.
  - Répartition volumétrique CM / TD / TP / EXAM.
  - Top 5 des matières les plus denses.

### 6.7 Mode Impression Gazette Universitaire (`@media print`)
- Feuille de style dédiée pour un rendu A4 noir sur blanc élégant. Masquage automatique des barres de navigation et des boutons interactifs.

---

## 7. Gestion des États, Deep Linking & Résilience

### 7.1 Deep Links Normalisés
L'état de l'application est reflété dans l'URL pour permettre le partage de vues et la mise en favori :
- `?view=day|week|list` : Sélection de la vue active.
- `?date=YYYY-MM-DD` : Date de consultation ciblée.
- `?modal=radar|homework|analytics|revisions|comparator|shortcuts|url` : Ouverture directe de la boîte de dialogue demandée.
- `?hwShare=<chaine_lz>` : Importation directe d'un pack de devoirs partagé.

### 7.2 États de Chargement, Erreur et Vacance
- **Écran de Chargement Squelette :**
  Structure squelette haute fidélité reproduisant exactement le masthead, la carte de briefing et les cartes de cours avec leur gouttière horaire. Zéro décalage de mise en page (CLS = 0).
- **États d'Erreur :**
  Ton éditorial, concis et actionnable. Aucune exclamation infantile type « Oups ». Bouton physique de réessai immédiat et alternative de modification d'URL.
- **États Vides (Vacances / Journées Libres) :**
  Encadré tactile avec icône thématique (`Coffee`, `Sunset`) informant posément de la reprise des cours.

---

## 8. Feuille de Route & Spécifications Normatives Inaltérables

### 8.1 Règles Inaltérables d'Implémentation
1. **Zéro `any` en TypeScript :** Typage exhaustif de bout en bout.
2. **Aucune 3e famille de police :** Strictement `Bricolage Grotesque` et `Geist Mono`.
3. **Cibles tactiles ≥ 44px :** Vérifié sur l'ensemble des boutons, sélecteurs et entrées de liste.
4. **Zéro ombre floue :** Seules les ombres tactiles dures sans flou à 90° sont autorisées.
5. **Rayon de courbure maximal :** 4px (`rounded-sm`).

---

> **Aura Campus · Gazette Structurée V3.0**  
> *L'alliance sans compromis de l'art éditorial, de la rigueur typographique et de la réactivité locale.*
