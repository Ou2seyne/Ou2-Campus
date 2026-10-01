# Aura Campus — V2 Web App

> **Cockpit académique · Gazette Structurée · Anti-Lisse Industriel**  
> Emploi du temps ADE Campus, offline-first PWA — Université d'Artois, L1 Maths-Info TD2

---

## Stack

| Layer | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript 5 (strict) |
| Styles | Tailwind CSS v4 + design tokens CSS |
| Animation | Framer Motion (120–180ms, easeOut) |
| Dates | date-fns v4 (locale fr) |
| Icons | Lucide React |
| Fonts | Bricolage Grotesque + Geist Mono (next/font) |
| Storage | localStorage (schedules/settings) + IndexedDB via `idb` (homework/cache) |
| iCal | node-ical (server-side) |
| PWA | Hand-written service worker (no Workbox) |

---

## Démarrage rapide

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # production server
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Serveur de développement Next.js |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |

---

## Fonctionnalités

### Vues
- **Jour** — fil chronologique avec ligne MAINTENANT, pauses détectées, briefing express
- **Semaine** — grille 6 colonnes (desktop) / snap-scroll 76% (mobile)
- **Liste** — scroll complet du semestre avec en-têtes de jours

### Navigation clavier
| Touche | Action |
|---|---|
| `J` | Vue Jour |
| `S` | Vue Semaine |
| `L` | Vue Liste |
| `←` / `→` | Jour/semaine précédent(e) / suivant(e) |
| `T` | Aujourd'hui |
| `R` | Rafraîchir |
| `F` | Focus Mode (masque le header) |
| `G` | Aller à une date (ouvre la palette) |
| `⌘K` / `Ctrl+K` | Palette de commandes |
| `/` | Focus barre de recherche |
| `?` | Aide raccourcis |
| `Esc` | Fermer modale |

### Palette de commandes (`⌘K`)
- Recherche de cours, salles, professeurs
- Commandes rapides : vue, theme, examens, devoirs, statistiques, refresh
- Navigation `>` pour les commandes (ex. `> sombre`, `> examen`)
- Clavier : ↑↓ navigation, ↵ sélection, Esc fermeture

### Modales
- **Fiche de cours** — export Google Calendar, .ics, partage natif, devoirs contextuels
- **Radar examens** — urgences J-day, export .ics
- **Devoirs** — liaison matière, date d'échéance, filtres, swipe-to-complete (mobile)
- **Analytiques** — heures par type, top 5 matières, jour le plus chargé
- **Sources ADE** — URL validation, presets, aide step-by-step

### PWA
- **Installable** sur Android (beforeinstallprompt) et iOS (guide Add to Home Screen)
- **Offline-first** — dernier planning mis en cache dans IndexedDB
- **Service Worker** — Network-First pour API, Cache-First pour chunks statiques
- **Update flow** — toast "Nouvelle version disponible → Mettre à jour" (skipWaiting user-triggered)
- **Navigation fallback** — `/offline.html` si navigation hors-ligne sans cache
- **Background refresh** — à la reconnexion réseau et au retour sur l'onglet

---

## Architecture des dossiers

```
app/
  layout.tsx          ← Fonts, inline theme script (no-flash), skip-to-content
  globals.css         ← Tokens V2, spacing scale, print tokens, animations
  page.tsx            ← Shell principal (orchestrateur)
  manifest.ts         ← PWA manifest
  api/schedule/       ← Proxy ADE (SSRF guard, Cache-Control, Zod)

features/
  command-palette/    ← CommandPalette + useCommandPalette
  focus-mode/         ← (intégré dans page.tsx)

components/
  ui/
    Button.tsx        ← btn-tactile, variants, 44px touch targets
    Dialog.tsx        ← focus trap, aria-dialog, swipe-down mobile
    Badge.tsx         ← stamp-badge, Kbd, Skeleton, Spinner, EmptyState
    Segmented.tsx     ← glider Framer Motion + Toast/HUD
  Header.tsx          ← horloge live, Cmd+K, badges, 44px cibles
  [autres]            ← composants existants

hooks/
  useFocusTrap.ts     ← Tab/Shift-Tab trap + Escape
  useSwipe.ts         ← gestes tactiles (swipe down/up/left/right)
  useTheme.ts         ← light/dark/auto + no-flash + prefers-color-scheme
  useSchedule.ts      ← état du planning (localStorage + IndexedDB cache)
  useHomework.ts      ← état des devoirs
  usePwa.ts           ← installation, SW, online/offline

lib/
  idb.ts              ← IndexedDB repo (homework + schedule cache) + migration localStorage
  ade-fetcher.ts
  ade-parser.ts
  calendarExport.ts
  campus.ts

public/
  sw.js               ← Service Worker V3 (lazy skipWaiting, nav fallback)
  offline.html        ← Page hors-ligne (auto-reload à la reconnexion)
```

---

## PWA — Checklist offline

1. Charger l'application une première fois (online)
2. Attendre la fin du chargement du planning
3. Couper le réseau (DevTools > Network > Offline)
4. Recharger la page — l'app doit démarrer instantanément
5. Naviguer entre Jour / Semaine / Liste — tout doit fonctionner
6. Vérifier le bandeau ambre "Hors-ligne"
7. Ouvrir `/offline.html` directement — doit afficher la page de fallback
8. Reconnecter le réseau — bandeau vert de reconnexion, puis refresh automatique

### Tester l'update flow
1. Modifier `sw.js` (incrémenter `CACHE_STATIC` version)
2. Recharger l'onglet
3. Le toast "Nouvelle version disponible → Mettre à jour" doit apparaître
4. Cliquer "Mettre à jour" → rechargement avec le nouveau SW

---

## SSRF Protection

L'API proxy (`/api/schedule`) n'accepte que :
- URLs `demo://` (données de démonstration)
- Domaines `.univ-*.fr`, `.u-*.fr`, `.ac-*.fr`, `.edu.fr`
- Fichiers `.shu` ou `.ics` depuis des serveurs HTTPS
- Blocage explicite de : `localhost`, `127.0.0.1`, `192.168.x`, `10.x`, `172.x`, `.local`

---

## Accessibilité (WCAG 2.2)

- Skip-to-content link visible au focus
- Focus trap dans toutes les modales (`useFocusTrap`)
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` sur les modales
- `aria-live="polite"` sur les états de chargement et navigation
- Cibles tactiles ≥ 44×44px sur tous les boutons d'action
- Contraste : `--text` / `--bg` = 18.2:1 (AAA) ; `--muted` relevé à `#5A5956` = ~5.2:1 (AA)
- `prefers-reduced-motion` : toutes les animations ramenées à 0.01ms
- Motif hachuré `.pattern-tp` pour les TP (sécurité daltonisme)
- `color-scheme: light dark` + script inline pour éviter le flash

---

## Design System V2 — Tokens clés

```css
/* Spacing (4px base) */
--sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; …

/* Elevation (hard shadows only) */
--el-1: 1.5px 1.5px 0px 0px var(--border-2);
--el-2: 2px 2px 0px 0px var(--border-2);
--el-dark: 2.5px 2.5px 0px 0px var(--text);

/* Radius (max 4px) */
--r-1: 2px;  --r-2: 4px;

/* Motion */
--dur-fast: 120ms; --dur-base: 150ms; --dur-slow: 180ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

---

## Notes de développement

- **IndexedDB migration** : au premier lancement avec la V2, les devoirs et caches de planning sont migrés depuis `localStorage` vers IndexedDB automatiquement. Les anciennes clés sont supprimées après 24h.
- **Service Worker** : `skipWaiting` n'est plus appelé à l'install — il est déclenché uniquement par le toast "Mettre à jour" (message `SKIP_WAITING`).
- **`select-none`** : retiré de `<html>` — la sélection de texte est maintenant active sur le contenu. Seuls les composants UI interactifs l'appliquent manuellement.
- **Live clock** : tourne à 1 seconde dans `page.tsx` et alimente à la fois le header et les barres de progression des cours en cours.
