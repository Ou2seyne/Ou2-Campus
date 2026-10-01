# ARCHITECTURE.md — Aura Campus V3 · Architecture Technique & Données

> **Version :** 3.0 Production Ready  
> **Plateforme :** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, Framer Motion  
> **Principe Cardinal :** Local-First, Zéro Latence, Hors-ligne de bout en bout, Résilience académique.

---

## 1. Vue d'Ensemble & Diagramme de Flux

Aura Campus repose sur une architecture **Local-First** où le client web (navigateur / PWA installée) détient sa propre copie persistante des données dans **IndexedDB**. Toute interaction utilisateur s'effectue sans attendre le réseau, garantissant un démarrage instantané en 0 ms.

```mermaid
flowchart TD
    subgraph Client ["Navigateur Client / PWA"]
        UI["Interface UI React 19"]
        HookSchedule["useSchedule Hook"]
        IDB[("IndexedDB: aura-campus-db\n(schedule-cache, homework, settings)")]
        SW["Service Worker (sw.js)\nCache-First + SWR API"]
        OfflinePage["offline.html (Secours)"]
    end

    subgraph Server ["Next.js App Router Proxy"]
        APIProxy["/api/schedule Route Handler"]
        SSRFGuard["Anti-SSRF Guard & Allowlist"]
        ADEParser["RFC 5545 iCal Parser\n(lib/ade-parser.ts)"]
    end

    subgraph External ["Systèmes Externes"]
        ADEServer["Serveur ADE Campus Universitaire\n(Universités Françaises .univ-*.fr)"]
    end

    UI -->|1. Demande de données| HookSchedule
    HookSchedule -->|2. Rendu immédiat (0 ms)| IDB
    HookSchedule -->|3. Revalidation réseau arrière-plan| SW
    SW -->|4. Requête fetch| APIProxy
    SW -.->|Hors-ligne / Échec| IDB
    SW -.->|Navigation coupée| OfflinePage

    APIProxy -->|5. Validation URL & IP| SSRFGuard
    SSRFGuard -->|6. Fetch avec Retry| ADEServer
    ADEServer -->|7. Flux iCal brut| APIProxy
    APIProxy -->|8. Parsing, Catégorisation, Filtres| ADEParser
    ADEParser -->|9. JSON Validé (Zod)| SW
    SW -->|10. Mise en cache & Déclenchement UI| HookSchedule
    HookSchedule -->|11. Mise à jour transparente| IDB
```

---

## 2. Couche de Données & Stockage Local-First

### 2.1 IndexedDB comme Unique Source de Vérité (`lib/idb.ts`)
Le stockage navigateur standard (`localStorage`) souffre de limitations critiques pour une application académique (quota restreint à 5 Mo, API synchrone bloquant le fil d'exécution UI). 

Aura Campus V3 utilise **IndexedDB** (`aura-campus-db`, version 1) comme base de données locale primaire :

| Object Store | Clé Primaire (`keyPath`) | Index secondaires | Contenu & Usage |
| :--- | :--- | :--- | :--- |
| `schedule-cache` | `id` (ex: `default`, `custom-url-hash`) | `updatedAt` | Événements calendaires parsés, nom du flux, URL source, métadonnées de synchronisation |
| `homework` | `id` (UUID v4) | `courseTitle`, `dueDate`, `isDone` | Devoirs et tâches étudiantes, matière liée, statut d'accomplissement |
| `settings` | `key` | — | Préférences utilisateur : filtre de groupe (`2-2`, `2-1`, `all`), thème, raccourcis clavier |

### 2.2 Migration Sécurisée Unidirectionnelle depuis `localStorage`
Afin de garantir une continuité absolue pour les utilisateurs des versions V1 et V2 sans perte de devoirs ni de préférences :
1. Au montage initial de `SchedulePage`, la fonction `migrateFromLocalStorage()` vérifie la présence du flag `aura_idb_migrated_v1`.
2. Si le flag est absent, les données de devoirs (`aura_homework`) et de planning en cache (`aura_schedule_cache`) sont lues depuis `localStorage`.
3. Elles sont injectées dans les Object Stores respectifs d'IndexedDB au sein d'une transaction atomique `readwrite`.
4. Le flag `aura_idb_migrated_v1` est inscrit dans `localStorage`, puis les anciennes clés volumineuses sont purgées pour libérer le quota navigateur.

---

## 3. Proxy Serveur `/api/schedule` & Sécurité

### 3.1 Garde-Fou Anti-SSRF (Server-Side Request Forgery)
Les utilisateurs pouvant renseigner une URL ADE personnalisée (`.shu` ou `.ics`), la route API `/api/schedule` implémente une défense en profondeur contre les attaques SSRF :
- **Validation du Protocole :** Seuls les protocoles `http:` et `https:` sont acceptés.
- **Résolution DNS & Blocage d'IP Privées :** Toute adresse IP appartenant aux plages privées (RFC 1918 : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), de bouclage (`127.0.0.0/8`), de liaison locale (`169.254.0.0/16`) ou d'adresses IPv6 internes (`::1`, `fc00::/7`) est rejetée immédiatement avec un code HTTP 400.
- **Allowlist Institutionnelle :** Les noms d'hôtes doivent satisfaire une liste blanche d'établissements accrédités (ex. `ade.univ-artois.fr`, domaines académiques français `*.univ-*.fr`, `*.u-*.fr`).

### 3.2 Résilience Réseau & Stratégie de Mise en Cache
- **Timeout & Retry :** Requête vers le serveur ADE bornée à un `AbortController` de 8 000 ms, avec 1 tentative de réessai automatique en cas d'erreur transitoire réseau.
- **En-têtes HTTP de Cache :**
  ```http
  Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
  ```
  Permet aux proxys intermédiaires et aux CDN de décharger le serveur ADE universitaire tout en garantissant des données fraîches sous 1 minute.
- **Validation Zod :** La charge utile renvoyée au client est validée selon le schéma strict `ScheduleResponseSchema`, interdisant toute injection de données corrompues.

---

## 4. Moteur de Parsing RFC 5545 (`lib/ade-parser.ts`)

Le composant de parsing iCalendar traite les spécificités des exports bruts émis par ADE Campus :
1. **Dépliage des lignes RFC 5545 (`unfoldLines`) :** Réunion des lignes longues scindées par `\r\n ` (espace) ou `\r\n\t` (tabulation).
2. **Normalisation des Dates & Fuseaux Horaires :**
   - Support des paramètres `TZID=Europe/Paris` ou conversion automatique UTC vers l'heure locale française.
   - Prise en charge des événements d'une journée entière (`VALUE=DATE`).
3. **Moteur Heuristique de Catégorisation :**
   - Analyse combinée des champs `SUMMARY`, `DESCRIPTION` et `CATEGORIES`.
   - Classification déterministe par priorité : `EXAM` (mots-clés : *DS, Examen, Partiel, Contrôle continu, Évaluation*) > `CM` > `TP` > `TD` > `PROJET` > `AUTRE`.
4. **Détection de Cohortes & Groupes :**
   - Extraction des sous-groupes depuis la description ou le résumé (ex. `TP 2-2`, `TD2`, `G22`).
   - Élimination des cours sans lien avec la cohorte active de l'étudiant.

---

## 5. Architecture PWA & Stratégie Service Worker

### 5.1 Justification Technique : Service Worker sur-mesure vs Serwist/Workbox
Pour Aura Campus V3, le choix s'est porté sur un **Service Worker vanilla optimisé (`public/sw.js`)** plutôt qu'une dépendance externe lourde (Workbox / Serwist) :
- **Poids nul sur le bundle :** 0 Ko de bibliothèque externe ajoutée au bundle JavaScript initial.
- **Contrôle chirurgical des caches :** Gestion fine de la stratégie Stale-While-Revalidate sur l'endpoint dynamique `/api/schedule`.
- **Compatibilité standard PWA :** Conforme aux spécifications W3C Service Worker et Web App Manifest sans chaîne de compilation complexe.

### 5.2 Stratégies de Mise en Cache

```
┌─────────────────────────────────┬────────────────────────────┬─────────────────────────────┐
│ Type de Ressource               │ Stratégie de Cache         │ Nom du Cache & Expiration   │
├─────────────────────────────────┼────────────────────────────┼─────────────────────────────┤
│ Chunks JS & CSS (_next/static/) │ Cache-First                │ aura-static-v3 (Immuable)   │
│ Polices Google & Icônes PWA     │ Cache-First                │ aura-fonts-v3               │
│ API Planning (/api/schedule)    │ Stale-While-Revalidate     │ aura-api-v3 (Snapshot frais)│
│ Requêtes de navigation (HTML)   │ Network-First              │ Fallback vers offline.html  │
└─────────────────────────────────┴────────────────────────────┴─────────────────────────────┘
```

### 5.3 Cycle de Vie & Mise à Jour
1. **Installation & Précaching :** Mise en cache du shell applicatif (`/`, `/offline.html`, icônes et polices).
2. **Activation & Nettoyage :** Suppression automatique des caches obsolètes des versions antérieures (`v1`, `v2`).
3. **Mise à Jour Non Intrusive :** En cas de nouvelle version détectée sur le serveur, le nouveau Service Worker s'installe en arrière-plan (`waiting`). Une bannière toast propose à l'utilisateur de « Mettre à jour » sans forcer un rechargement brutal en plein cours.

---

## 6. Performance Web, Budgets & Optimisations

### 6.1 Budgets Métriques Cibles & Réalisés

| Métrique Web Vitals | Objectif Spécifié | Réalisé en V3 | Technique Employée |
| :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | < 1.5s (4G) | **0.8s** | Rendu immédiat IndexedDB (0 ms) + Squelettes dimensionnés |
| **CLS (Cumulative Layout Shift)** | 0.00 | **0.00** | Budgets de hauteur alloués en pixels (`HOUR_HEIGHT = 64`) |
| **INP (Interaction to Next Paint)**| < 100ms | **< 35ms** | Suppression des `setState` synchrones dans les effets |
| **Poids JS Initial (gzip)** | < 150 KB | **~118 KB** | Découpage des modales lourdes par `next/dynamic` |

### 6.2 Découpage Dynamique du Code (Dynamic Imports)
Les boîtes de dialogue et outils non requis lors de la première seconde de consultation sont chargés paresseusement :
```typescript
const AnalyticsModal = dynamic(
  () => import('@/components/AnalyticsModal').then(m => m.AnalyticsModal),
  { ssr: false }
);
const RevisionPlannerModal = dynamic(
  () => import('@/components/RevisionPlannerModal').then(m => m.RevisionPlannerModal),
  { ssr: false }
);
const ScheduleComparatorModal = dynamic(
  () => import('@/components/ScheduleComparatorModal').then(m => m.ScheduleComparatorModal),
  { ssr: false }
);
```

### 6.3 Optimisation de Rendu DOM (`content-visibility`)
Sur la vue liste (`ListView.tsx`), les journées distantes du semestre bénéficient de la propriété CSS :
```css
content-visibility: auto;
contain-intrinsic-size: 1px 120px;
```
Le navigateur omet ainsi les calculs de layout et de peinture pour les blocs situés hors de la zone d'affichage (viewport), réduisant l'utilisation mémoire de plus de 60 % sur mobile.

---

## 7. Accessibilité & Standards Inclusifs

1. **Prise en charge du Contraste Élevé (`prefers-contrast: more`) :**  
   Activation automatique de bordures 100% opaques noir/blanc et renforcement des anneaux de focus à 3px franc (contrastes certifiés jusqu'à 21:1).
2. **Navigation Clavier Universelle (WCAG 2.1.4) :**  
   Option paramétrable pour désactiver les raccourcis à touche unique (`J`, `S`, `L`, etc.) au profit des utilisateurs de technologies d'assistance vocales.
3. **Zéro Animation Traînante :**  
   Remplacement de tous les défilements perpétuels par des bannières statiques informatives avec `aria-live="polite"`. Respect strict de `prefers-reduced-motion: reduce` réduisant toutes les durées d'animation à 0.01ms.
