# V3_1_CHANGELOG.md — Journal des Corrections et Preuves V3.1

> **Règle absolue :** Chaque entrée consigne la situation « Avant » (le problème constaté ou l'incohérence doc/code), la modification « Après » effectuée, et la **preuve tangible** associée (test Vitest, mesure, script, snapshot).

---

## Lot 0 : État Réel & Audit Initial
- **Audit de la Vue Liste :**
  - *Avant :* `docs/V3_DECISIONS.md` affirmait l'utilisation de `react-window` pour virtualiser le semestre.
  - *Après :* Constat factuel que seul CSS `content-visibility: auto` + `contain-intrinsic-size` est utilisé dans `components/ListView.tsx`. Incohérence documentée dans `docs/V3_1_AUDIT.md`.
  - *Preuve :* `grep -rn "react-window" components/ app/` (0 résultat).
- **Audit des tailles de composants :**
  - *Avant :* Affirmation que `page.tsx` et `WeekView.tsx` avaient été découpés en modules de < 300 lignes.
  - *Après :* Constat factuel : `app/page.tsx` = 905 lignes, `components/WeekView.tsx` = 889 lignes.
  - *Preuve :* Sortie commande `wc -l`.
- **Audit de l'arborescence :**
  - *Avant :* 6 répertoires sous `features/` vides, 23 composants toujours importés depuis `@/components/...`.
  - *Après :* Constaté et documenté dans `docs/V3_1_AUDIT.md`.
- **Audit des tests & Playwright :**
  - *Avant :* Croyance que `computeEventLayout`, la migration IndexedDB et des snapshots Playwright existaient.
  - *Après :* 21 tests réels, 0 test pour `computeEventLayout`, 0 test pour `migrateFromLocalStorage`, Playwright absent.
  - *Preuve :* Sortie de `vitest run` et recherche `playwright.config.*`.
