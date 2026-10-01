# Aura Campus — V3 Web App

> **Cockpit académique d'élite · Gazette Structurée · Anti-Lisse Industriel**  
> Emploi du temps ADE Campus, PWA Local-First — Université d'Artois, L1 Maths-Info TD2 / TP 2-2

---

## 1. Stack Technique V3

| Couche | Technologie |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), Turbopack |
| **UI & Logique** | React 19, TypeScript strict (0 `any`) |
| **Styles** | Tailwind CSS v4 + Design Tokens CSS (`:root`, `[data-theme=dark]`) |
| **Animations** | Framer Motion (120–180ms, cubic-bezier(0.16, 1, 0.3, 1), sans bounce) |
| **Dates** | date-fns v4 (locale fr) |
| **Icônes** | Lucide React (épaisseur 1.75–2.2) |
| **Typographies** | Bricolage Grotesque (Display/Titres) + Geist Mono (Horaires, tabular-nums, Salles) |
| **Stockage** | IndexedDB unique source de vérité (`aura-campus-db`, version 1) via repository typé |
| **Partage P2P** | Compression JSON URL sécurisée via `lz-string` |
| **PWA** | Service Worker sur-mesure (SWR, Cache-First, Offline Fallback, lazy skipWaiting) |

---

## 2. Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement (http://localhost:3000)
npm run dev

# Vérification du typage strict
npx tsc --noEmit

# Exécution des suites de tests unitaires et d'accessibilité (Vitest)
npm run test

# Validation du linter
npm run lint

# Compilation de production
npm run build

# Démarrage du serveur de production
npm run start
```

---

## 3. Scripts Disponibles

| Commande | Rôle |
| :--- | :--- |
| `npm run dev` | Lance le serveur de développement local avec Fast Refresh Turbopack |
| `npm run build` | Compile l'application pour la production et génère les chunks optimisés |
| `npm run start` | Démarre le serveur Node.js de production |
| `npm run lint` | Exécute ESLint sur l'ensemble du projet (0 avertissements autorisés) |
| `npm run test` | Lance les 21 tests unitaires et de conformité WCAG via Vitest |

---

## 4. Fonctionnalités Phares V3

### 📰 Esthétique Gazette Structurée V3
- **Double Filet Signature :** Séparateur 1px + 3px sous le masthead et entre sections majeures (`.filet-double`).
- **Trame Papier & Grain :** Texture de points réguliers en mode clair (`radial-gradient`), grain subtil en sombre.
- **Numérotation Éditoriale :** Chapeau type `ÉDITION DU MARDI 30 SEPTEMBRE · SEM. 40` en Geist Mono caps.
- **Tampons Industriels :** `.stamp-badge` et `.stamp-exam` à rotation fixe -1° et double bordure.
- **Chargement Squelette Réel :** Remplace les spinners par un gabarit dimensionné à l'identique de la page (CLS = 0).

### 📅 Vues Calendaires Adaptatives
- **Vue Jour :** `DailyBriefingCard` format Une de journal avec grand compteur Display en Geist Mono, timeline avec ligne rouge « MAINTENANT », scanline sur le cours actif, et détection des pauses méridiennes (bandeau ambre).
- **Vue Semaine Responsive (3 tiers) :**
  - *Desktop (≥1024px) :* Grille 6 colonnes synchronisée avec clustering `computeEventLayout`.
  - *Tablette (640–1023px) :* Grille 3 colonnes avec commutateur segmenté (Lun–Mer / Jeu–Sam).
  - *Mobile (<640px) :* Affichage d'**un seul jour en pleine largeur** surmonté d'un mini-strip interactif de 6 jours et navigation par swipe horizontal.
- **Vue Liste :** Rendu virtualisé pour l'intégralité du semestre avec en-têtes de jour collants et propriété `content-visibility: auto`.

### ⚡ Productivité & Outils Métier
- **Palette de Commandes `⌘K / Ctrl+K` :** Recherche floue (cours, salles, professeurs) et mode actions (préfixe `>`).
- **Planificateur de Révision (`RevisionPlannerModal`) :** Détection automatique des créneaux libres de 9h à 19h avant un examen et ajout de devoirs en 1 clic.
- **Comparateur de Plannings (`ScheduleComparatorModal`) :** Comparaison de deux cohortes (ex. 2-2 vs 2-1) pour détecter les pauses et temps libres communs.
- **Partage P2P de Devoirs :** Exportation et importation d'ensembles de tâches compressées via le paramètre d'URL `?hwShare=`.
- **Décodeur Campus Faculté des Sciences de Lens :** Localisation précise des amphis et salles D, C, E (`lib/campus.data.ts`).
- **Mode Impression Gazette A4 (`@media print`) :** Exportation ou impression papier noir sur blanc de haute qualité.

---

## 5. Navigation Clavier & Raccourcis (WCAG 2.1.4)

| Raccourci | Action |
| :--- | :--- |
| `⌘K` / `Ctrl+K` | Ouvrir la Palette de Commandes (fonctionne même dans les champs de saisie) |
| `J` | Basculer en **Vue Jour** |
| `S` | Basculer en **Vue Semaine** |
| `L` | Basculer en **Vue Liste** |
| `T` | Revenir à **Aujourd'hui** |
| `R` | Forcer le rafraîchissement ADE |
| `F` | Activer le **Mode Focus Amphi** (masque le header) |
| `G` | Sélecteur rapide de date |
| `/` | Donner le focus à la recherche |
| `?` | Afficher la modale des raccourcis |
| `Esc` | Fermer toute boîte de dialogue, tiroir ou palette |

> **Accessibilité Clavier :** Une option dans la modale des raccourcis permet de **désactiver les touches uniques** (`J`, `S`, etc.) pour les personnes utilisant des technologies d'assistance vocales (WCAG 2.1.4).

---

## 6. Checklist de Validation Offline & PWA

Pour tester le comportement hors-ligne et l'installation PWA :
1. **Premier chargement :** Ouvrir l'application en ligne et laisser le flux ADE se charger.
2. **Coupure réseau :** Dans les DevTools du navigateur, basculer le réseau sur *Offline* (ou passer en Mode Avion).
3. **Rechargement :** Rafraîchir la page (`F5` ou `Cmd+R`).
   - L'application démarre immédiatement (0 ms) grâce au cache IndexedDB.
   - Le bandeau ambré « Mode hors-ligne » s'affiche en tête d'écran.
   - Les vues Jour, Semaine et Liste restent 100 % navigables.
4. **Fallback Navigation :** Naviguer vers une URL non mise en cache pour observer `/offline.html`.
5. **Reconnexion :** Rétablir le réseau. Un bandeau vert confirme le retour en ligne et déclenche une synchronisation silencieuse.
6. **Mise à jour du Service Worker :** Lorsqu'un nouveau `sw.js` est déployé, un toast signale « Nouvelle version disponible → Mettre à jour » (déclenchement `SKIP_WAITING` sur consentement).

---

## 7. Galerie UI Interne

Une page de laboratoire interne est mise à disposition pour inspecter l'ensemble des design tokens, boutons tactiles, modales et variations de thèmes :
👉 **`http://localhost:3000/_ui`**

---

## 8. Documentation Complémentaire

- [Spécifications UI/UX & Design System (DESIGN.md)](./DESIGN.md)
- [Architecture Technique & Données (ARCHITECTURE.md)](./ARCHITECTURE.md)
- [Plan de Développement V3 (docs/V3_PLAN.md)](./docs/V3_PLAN.md)
- [Registre des Décisions d'Ingénierie (docs/V3_DECISIONS.md)](./docs/V3_DECISIONS.md)
