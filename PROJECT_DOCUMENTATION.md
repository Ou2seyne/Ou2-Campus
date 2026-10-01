# 🌟 Aura Campus — Documentation Complète du Projet & Système UI

> **Guide d'architecture technique, système de design et manuel utilisateur.**  
> Projet développé pour la consultation moderne, fluide et intelligente des emplois du temps universitaires **ADE Campus** (avec ciblage spécifique **L1 Maths-Info TD2 / Sous-groupe TP 2-2 – Université d'Artois, Faculté des Sciences de Lens**).

---

## 📑 Sommaire
1. [Vision & Problématique Résolue](#1-vision--problématique-résolue)
2. [Stack Technologique](#2-stack-technologique)
3. [Architecture Globale & Structure des Fichiers](#3-architecture-globale--structure-des-fichiers)
4. [Moteur de Synchronisation ADE & Parsing](#4-moteur-de-synchronisation-ade--parsing)
5. [Système de Filtrage Intelligent (Groupe 2-2)](#5-système-de-filtrage-intelligent-groupe-2-2)
6. [Design System « Organic Pill & Bubble »](#6-design-system--organic-pill--bubble-)
7. [Fonctionnalités Étudiantes Avancées](#7-fonctionnalités-étudiantes-avancées)
8. [Composants UI Détaillés](#8-composants-ui-détaillés)
9. [Persistance Locale & Sécurité Hydratation Next.js](#9-persistance-locale--sécurité-hydratation-nextjs)
10. [Guide de Déploiement & Commandes](#10-guide-de-déploiement--commandes)

---

## 1. Vision & Problématique Résolue

### Le Problème ADE Campus Classique
L'interface historique d'ADE Campus présente de lourds inconvénients au quotidien pour un étudiant :
- **Interface austère et datée** : non optimisée pour smartphone, navigation rigide, scroll horizontal difficile.
- **Pollution d'affichage des groupes** : les cours de tous les sous-groupes (TD1, TD2, TP 2-1, TP 2-2) se superposent souvent, générant des fausses alarmes de chevauchement.
- **Absence de fonctionnalités de productivité** : aucun compte à rebours avant les examens (DS), aucun gestionnaire de devoirs lié aux cours, aucune statistique sur le volume horaire réel.

### La Solution Aura Campus
Une application web progressive ultrarapide dotée d'une ergonomie moderne :
- **Esthétique « Organic Soft Pill »** inspirée de Bento UI, Linear et Raycast.
- **Filtrage automatique pour le Groupe 2-2** : seules les séances vous concernant réellement s'affichent par défaut.
- **Double moteur Thème Clair / Thème Sombre** avec 4 palettes pastel interchangeables (Matcha, Lavande, Sunset, Océan).
- **Exam Radar** : détection automatique des contrôles continus, partiels et DS avec compte à rebours.
- **Gestionnaire de devoirs & To-Do** directement intégré aux cours du planning.
- **Statistiques & Volumes horaires** : répartition CM / TD / TP et matière la plus chargée.

---

## 2. Stack Technologique

| Domaine | Technologie | Rôle & Justification |
| :--- | :--- | :--- |
| **Framework Web** | **Next.js 16 (App Router)** | Performance Turbo, Server Components pour le proxy API et SSR rapide. |
| **Moteur Runtime** | **Turbopack & React 19** | Compilation ultra-rapide (< 500 ms) et architecture composants réactive. |
| **Langage** | **TypeScript 5** | Typage strict pour les structures d'événements iCal, thèmes et devoirs. |
| **Styling CSS** | **Tailwind CSS v4** | Utilisation de la nouvelle architecture CSS-first avec directives `@custom-variant dark`. |
| **Animations** | **Framer Motion** | Transitions fluides des popups, accordéons, feedback tactile des pilules et modales. |
| **Iconographie** | **Lucide React** | Icônes vectorielles légères et cohérentes. |
| **Gestion des Dates** | **date-fns (Locale FR)** | Manipulation précise des fuseaux, durées, comparaisons de jours et formatage français. |
| **Parsing iCal** | **Parser RFC 5545 Custom** | Normalisation des flux `.ics` et extraction automatique des métadonnées ADE (.shu). |

---

## 3. Architecture Globale & Structure des Fichiers

```text
/Users/ou2/Documents/test/
├── app/
│   ├── api/
│   │   └── schedule/
│   │       └── route.ts          # Proxy API serveur : fetch ADE, conversion .shu -> .ics, parsing
│   ├── favicon.ico
│   ├── globals.css               # Design tokens CSS, dark mode Tailwind v4, animations blobs
│   ├── layout.tsx                # Structure HTML racine, police Plus Jakarta Sans, métadonnées SEO
│   └── page.tsx                  # Page principale & chef d'orchestre d'état (filtres, vues, modales)
├── components/
│   ├── AnalyticsModal.tsx        # Modale de statistiques (volume horaire, répartition CM/TD/TP)
│   ├── CourseCard.tsx            # Carte de cours interactive avec jauge live et badges capsules
│   ├── CourseDetailModal.tsx     # Modale détaillée du cours avec export Google Calendar et devoirs
│   ├── DateSelector.tsx          # Sélecteur horizontal de date en pilules (Lun - Sam) et switch de vue
│   ├── ExamRadarModal.tsx        # Radar intelligent des DS, partiels et examens
│   ├── Header.tsx                # En-tête avec horloge temps réel, nom du flux et barre d'actions
│   ├── HomeworkModal.tsx         # Gestionnaire global des devoirs et tâches
│   ├── ListView.tsx              # Vue agenda sous forme de liste chronologique par journée
│   ├── RecentPills.tsx           # Barre des plannings favoris et récents avec bascule en 1 clic
│   ├── ScheduleStats.tsx         # Capsules résumé du jour (nombre de cours, cours en cours, salle)
│   ├── SearchBar.tsx             # Barre de recherche avec raccourci '/' et filtres CM/TD/TP + Groupe
│   ├── ThemeSwitcher.tsx         # Bouton toggle Dark Mode (Soleil/Lune) + sélecteur de thèmes pastel
│   ├── TimelineView.tsx          # Vue journalière principale avec détection des pauses déjeuner
│   ├── UrlModalInput.tsx         # Modale d'importation d'URL ADE (.shu ou .ics) avec pré-configurations
│   └── WeekView.tsx              # Grille hebdomadaire 6 colonnes
├── hooks/
│   ├── useHomework.ts            # Hook React pour les devoirs (ajout, toggle fait, suppression, cache)
│   ├── useSchedule.ts            # Hook React maître (fetch API, cache local, filtrage Groupe 2-2)
│   └── useTheme.ts               # Hook de thème (Dark Mode + 4 palettes pastel synchronisées sur HTML)
├── lib/
│   ├── icsParser.ts              # Parseur d'agenda RFC 5545, nettoyage des titres et des salles
│   └── theme.ts                  # Cartographie des couleurs pastel par catégorie d'enseignement
└── types/
    └── schedule.ts               # Définitions TypeScript complètes (ScheduleEvent, Categories, etc.)
```

---

## 4. Moteur de Synchronisation ADE & Parsing

### Le Défi des URLs ADE `.shu`
Les universités françaises utilisant ADE Campus fournissent souvent deux formats de liens :
1. **Lien de consultation Web direct** :  
   Exemple : `https://ade-consult.univ-artois.fr/jsp/custom/modules/plannings/5YGpM4nJ.shu`
2. **Flux direct d'exportation iCal (.ics)** :  
   Exemple : `.../jsp/custom/modules/plannings/anonymous_cal.jsp?resources=...&projectId=...`

### Fonctionnement du Proxy Backend (`app/api/schedule/route.ts`)
Le composant serveur Next.js agit comme un **proxy intelligent sans CORS** :
1. **Résolution automatique** : Si l'utilisateur fournit une URL `.shu`, le serveur interroge la page HTML d'ADE, suit les redirections, extrait l'identifiant de ressource (`resources=...`) et reconstruit dynamiquement le flux iCalendar direct.
2. **Cache HTTP intelligent** : En-têtes `Cache-Control: public, s-maxage=300` pour limiter les requêtes répétitives vers les serveurs universitaires.
3. **Parseur RFC 5545 Robuste (`lib/icsParser.ts`)** :
   - Dépliage des lignes coupées (`folding lines` standards iCal).
   - Gestion des fuseaux horaires français (Europe/Paris, UTC).
   - Découpage intelligent du champ `SUMMARY` et `DESCRIPTION` pour extraire :
     - **Nom clair de la matière** (ex: *Calculus 1*, *Algorithmique et programmation 1*, *MOMI*).
     - **Type d'enseignement** (CM, TD, TP, Examen, Projet).
     - **Salle de cours** (ex: *Amphi Y.Barbeaux*, *D004*, etc.).
     - **Enseignant** (ex: *Parrain Anne*, *Jabbour Said*, etc.).
     - **Sous-groupes rattachés** (*TD2*, *TP 2-2*, *TP 2-1*).

---

## 5. Système de Filtrage Intelligent (Groupe 2-2)

### Problème Initial
Dans le flux officiel de L1 Maths-Info TD2, les travaux dirigés et travaux pratiques sont partagés avec d'autres sous-groupes (TP 2-1). Les créneaux se chevauchent visuellement.

### Algorithme de Filtrage (`hooks/useSchedule.ts`)
Le hook implémente un filtre multicouche :
```typescript
const isGroupe22Course = (event: ScheduleEvent): boolean => {
  // 1. Les Cours Magistraux (CM) et Examens généraux s'appliquent à toute la promo
  if (event.category === 'CM' || event.isPromoWide) return true;

  // 2. Si le cours spécifie expressément un groupe
  if (event.subGroup) {
    if (event.subGroup === '2-2') return true;
    if (event.subGroup === '2-1') return false; // Élimine automatiquement les cours du TP 2-1 !
  }

  // 3. Analyse du texte des groupes et de la description
  const text = `${event.summary} ${event.description} ${event.groups.join(' ')}`.toLowerCase();
  if (text.includes('tp 2-1') || text.includes('gr 2-1') || text.includes('groupe 2-1')) return false;
  if (text.includes('tp 2-2') || text.includes('gr 2-2') || text.includes('groupe 2-2')) return true;

  // 4. Par défaut, les cours communs TD2 sont inclus
  return true;
};
```
Un sélecteur visuel présent dans la barre de recherche permet à tout moment de basculer entre :
- `⭐ Groupe 2-2` *(Actif par défaut)*
- `Groupe 2-1`
- `Tous les groupes`

---

## 6. Design System « Organic Pill & Bubble »

Le design d'Aura Campus a été pensé pour rompre totalement avec la rigidité des logiciels scolaires.

### 1. Philosophie Formelle
- **Pilules et Bulles douces** : `rounded-full` pour les boutons d'action et badges, `rounded-3xl` (24px) pour les cartes et conteneurs.
- **Ombres légères multicouches** (`soft-shadow`, `soft-shadow-card`) : confèrent un aspect flottant sans agressivité visuelle.
- **Glassmorphism subtil** : flou d'arrière-plan (`backdrop-blur-md`) pour l'en-tête et les badges statut.
- **Aura Blobs Décoratifs animés** : 3 sphères dégradées et floutées oscillent doucement en arrière-plan (`animate-blob-1`, `2`, `3`).

### 2. Palette de Couleurs Pastels Spécifiques
| Thème / Catégorie | Couleur de fond | Couleur de texte | Utilisation |
| :--- | :--- | :--- | :--- |
| **Matcha Sage** | `#E2EBE2` | `#2D4A3E` | Thème zen par défaut, Travaux Pratiques (TP) |
| **Sunset Peach** | `#FBECE5` | `#783A24` | Travaux Dirigés (TD), chaleur douce |
| **Lavender Cloud**| `#EBE8F7` | `#3F356B` | Cours Magistraux (CM), devoirs |
| **Oceanic Blue**  | `#E6F0FA` | `#1E4268` | Examens & Contrôles (DS, Partiels) |
| **Golden Amber**  | `#FEF5E7` | `#7D5A1E` | Projets, alertes & Radar d'examen |

### 3. Architecture du Mode Sombre (Dark Mode)
Contrairement aux thèmes sombres basiques à fort contraste noir/blanc, Aura Campus utilise un **Dark Mode Charcoal & Slate** :
- **Fond de page** : `#020617` (Slate 950 profond).
- **Cartes & Conteneurs** : `bg-slate-900/95` avec bordures subtiles `border-slate-800`.
- **Textes** : `text-slate-100` avec nuances secondaires `text-slate-400`.
- **Badges Pastels en mode sombre** : conservent leur lisibilité grâce à des fonds semi-transparents (`dark:bg-emerald-950/60`, `dark:bg-purple-950/60`).
- **Configuration Tailwind v4** :
  ```css
  @import "tailwindcss";
  @custom-variant dark (&:where(.dark, .dark *));
  ```

---

## 7. Fonctionnalités Étudiantes Avancées

### 🎯 1. Exam Radar (Radar des Contrôles & DS)
- **Détection sémantique** : inspecte le flux iCal à la recherche de mots-clés (`DS`, `Examen`, `Partiel`, `Évaluation`, `Contrôle`).
- **Badge d'alerte dans l'en-tête** : affiche le nombre d'examens futurs.
- **Modale Radar** :
  - Compte à rebours précis en jours restants (`Dans 3 jours`, `Aujourd'hui`).
  - Salle, heure et durée de l'épreuve.
  - Bouton rapide d'ajout d'une tâche de révision dans le gestionnaire de devoirs.

### 📝 2. Gestionnaire de Devoirs & To-Do Intégré
- **Liaison contextuelle aux cours** : un devoir peut être lié à une matière spécifique (*ex: TD Calculus 1 - Exercices 4 à 8*).
- **Affichage sur les cartes de cours** : une pilule violette apparaît directement sur la séance concernée (`1 devoir`).
- **Filtres de statut** : À faire / Terminés / Tous.
- **Persistance** : stocké dans le `localStorage` de votre navigateur.

### 📊 3. Statistiques & Volume Horaire (Analytics Modal)
- **Heures totales de cours** sur le semestre.
- **Répartition graphique du volume** : proportion de CM, TD, TP et Examens.
- **Top 5 des matières les plus lourdes** en volume horaire.
- **Journée la plus chargée de la semaine**.

### ☕ 4. Détecteur Intelligent de Pauses
Dans la vue chronologique (`TimelineView`), dès que l'intervalle entre deux cours consécutifs dépasse **20 minutes**, une pilule spéciale s'insère :
- *Pause déjeuner* (si le créneau est entre 11h30 et 14h) ou *Pause*.
- Affichage de la durée exacte (ex: `Pause • 1h15 (11h45 – 13h00)`).

### 📅 5. Export Google Calendar en 1 Clic
Dans la modale détaillée de chaque cours (`CourseDetailModal`), un bouton génère un lien pré-rempli avec le titre, la salle, l'enseignant et les horaires exacts pour l'ajouter à votre Google Calendar personnel.

---

## 8. Composants UI Détaillés

### 1. `Header.tsx`
- **Logo Bubble** avec indicateur vert pulsant attestant que le flux est en direct.
- **Horloge dynamique** actualisée chaque seconde et date du jour en français.
- **Pillules de raccourcis** : *Exam Radar* (avec badge numérique), *Devoirs* (avec compteur de tâches), *Stats*, *Toggle Dark Mode*, *Palette pastel*, *Actualiser* et *Gérer*.

### 2. `DateSelector.tsx`
- Sélecteur de date en grille de 6 jours (du Lundi au Samedi).
- Indicateurs visuels : badge de nombre de cours par jour, surbrillance du jour sélectionné et du jour actuel (*Aujourd'hui*).
- Bascule des 3 modes d'affichage : **Jour**, **Semaine**, **Liste**.

### 3. `ScheduleStats.tsx`
- **Capsule 1** : Nombre de cours prévus aujourd'hui et volume total en heures.
- **Capsule 2** : Si un cours a lieu en ce moment, affichage d'un badge animé « En cours actuellement » avec son titre. Sinon, compte à rebours vers le prochain cours.
- **Capsule 3** : Salle du prochain cours ou localisation générale.

### 4. `CourseCard.tsx`
- **Barre de progression en direct** : pour les cours actuellement en cours, une jauge verte avance en temps réel au fur et à mesure des minutes écoulées.
- **Gélules d'information** : horaires, durée, groupe ciblé, salle et enseignant.
- **Micro-interactions** : légère élévation au survol (`whileHover={{ y: -3 }}`) et rétrécissement tactile (`whileTap={{ scale: 0.985 }}`).

---

## 9. Persistance Locale & Sécurité Hydratation Next.js

L'application stocke les préférences utilisateur dans le `localStorage` du navigateur :
- `pillcal_saved_schedules_v1` : liste des plannings importés et favoris.
- `pillcal_active_id_v1` : planning actif au démarrage.
- `pillcal_theme_dark_v1` : préférence mode clair / sombre.
- `pillcal_theme_palette_v1` : nuance de pastel active.
- `pillcal_homework_items_v1` : liste des devoirs et tâches.

### Résolution du Problème d'Hydratation SSR (Hydration Mismatch)
Dans Next.js, lire `localStorage` ou générer des dates dynamiques (`new Date()`) pendant le premier rendu serveur peut provoquer une divergence avec le client.
Aura Campus utilise un modèle d'état robuste :
1. **Initialisation SSR-safe** : les états React démarrent avec des valeurs par défaut constantes et neutres côté serveur.
2. **Effet de montage client** (`useEffect`) : la synchronisation avec le `localStorage` et l'heure système s'exécute uniquement une fois le DOM monté côté client.
3. **Attribut `suppressHydrationWarning`** appliqué sur les horloges textuelles qui changent à chaque seconde.

---

## 10. Guide de Déploiement & Commandes

### Prérequis
- Node.js version 18.18+ ou 20+.
- Gestionnaire de paquets `npm` ou `pnpm`.

### Installation & Lancement Local
```bash
# 1. Cloner ou ouvrir le dossier du projet
cd /Users/ou2/Documents/test

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
# Accès sur http://localhost:3000

# 4. Compiler pour la production
npm run build

# 5. Démarrer le build de production
npm run start
```

### Configuration des Variables d'Environnement (Optionnel)
Le projet fonctionne de manière autonome sans variables obligatoires. Si vous souhaitez définir un flux ADE par défaut pour tous les nouveaux utilisateurs, vous pouvez créer un fichier `.env.local` :
```env
NEXT_PUBLIC_DEFAULT_ADE_URL=https://ade-consult.univ-artois.fr/jsp/custom/modules/plannings/5YGpM4nJ.shu
NEXT_PUBLIC_DEFAULT_SCHEDULE_NAME="L1 MATHS TD2 (Univ Artois)"
```

---

*Document généré pour consultation et archivage personnel. Aura Campus — All rights reserved.*
