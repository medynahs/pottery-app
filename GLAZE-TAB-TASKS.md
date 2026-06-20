# Glaze Tab — Implementation Tasks

**Purpose:** Evolve **Glaze Atlas** from a recipe library into a **proper glaze tracker** — mix logs, glazing process, fired results, and the connections between them (inspired by studio glaze-journal practice: written notes + process photos + unload review).

**Last updated:** June 19, 2026  
**Current completion:** ~65–70% as a *recipe atlas*; ~35–40% as a *full glaze tracker* (mix + glaze + fire loop)  
**Backend companion:** [`GLAZE-TAB-BACKEND-TASKS.md`](./GLAZE-TAB-BACKEND-TASKS.md)

---

## Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| 🟡 | Partial — started, gaps remain |
| ❌ | Not started |

---

## What “proper glaze tracker” means

A studio glaze journal usually tracks **three linked stories**:

| Journal | Question it answers | Primary home in app |
|---------|---------------------|---------------------|
| **Mix log** | What did I weigh, substitute, or mess up while batching? | Glaze batch (Atlas) |
| **Glaze application log** | What went on this pot, how, and what did I hope for? | Piece (+ optional test tile) |
| **Firing connection** | How did the kiln run, and did results match notes? | Kiln tab ↔ pieces / glazes |

Unload is where those stories meet: read process notes **while unloading**, note surprises, write “try next time.”

---

## What exists today

### Tab & navigation
- ✅ **Glaze Atlas** tab (`app/(tabs)/library.tsx` → `JournalScreen`)
- ✅ Sub-tabs: **My Atlas** / **Discover**
- ✅ Header actions: **Add** batch, **Log Tile** (both tabs)
- ✅ Deep links: `library-glazes`, `glaze/[id]`, `glaze-collection/[slug]`, `discover-recipe`, `discover-inspiration`

### Recipe & batch library (My Atlas)
- ✅ Add / edit glaze batch (`AddGlazeModal`, `GlazeRecipeBuilder`)
- ✅ Structured ingredients + free-text fallback (`ingredientsText`)
- ✅ Batch metadata: `batchId`, `dateMixed`, `status`, `versionNumber`, version chain (`rootGlazeId`, `parentGlazeId`)
- ✅ Compare versions modal
- ✅ Collections, favorites, filters, search (`LibraryGlazesScreen`, `GlazeFilterSheet`)
- ✅ Batch scaler — grams per piece, waste %, piece count (`GlazeBatchScalerCard`, persisted on glaze)
- ✅ Photo gallery types: bucket, test-tile, finished-piece, accident
- ✅ Store-bought vs custom source
- ✅ Swipe-to-delete on atlas grid
- ✅ Premium gate (free batch limit)

### Test tiles
- ✅ Log test tile modal — clay, cone, kiln, application, thickness, defects, result, photo, `layeredWith`, notes
- ✅ Test stats on glaze detail (`glazeTestStats.ts`)
- ✅ Overview **Test wall** widget (`GlazeTestWallWidget`)

### Discover
- ✅ Bundled starter **recipes** (formulas, save to atlas)
- ✅ Bundled **layering ideas** (photo + description + application notes — read-only)
- ✅ Unified grid, search, filters; provenance on save (`discoverSourceRecipeId`)
- 🟡 Stock photos (Unsplash placeholders — need real tile photography)

### Detail & sharing
- ✅ Glaze detail — recipe, versions, tests, analytics usage, batch scaler
- ✅ Share recipe to community (`ShareGlazeRecipeSheet`, structured payload)
- ✅ Save from community / Discover with provenance banners
- ✅ Analytics drill-down — glaze usage → linked pieces + tests

### Piece ↔ glaze
- 🟡 Single `glazeId` + `glazeOutcome` on piece
- 🟡 Piece journal **Studio glaze** link card (`PieceGlazeLinkSection`)
- 🟡 `GlazePickerField` on piece forms
- ❌ Multi-glaze stack on one piece (over/under)
- ❌ Glazing process notes on piece (dip time, coats, mishaps)

### Kiln ↔ glaze
- 🟡 Firing `glazeNotes` free text when scheduling glaze firing
- 🟡 Pieces assigned to firings; glaze outcome on piece after fire
- ❌ Unload review prompt tied to glaze notes
- ❌ Cone pack / temp notes surfaced on glaze or piece

### Sync & data integrity
- 🟡 Local-first glazes + tests (`useGlazesSync`)
- 🟡 Many batch/version/provenance fields sent in sync payload; **server may ignore**
- ❌ Piece `glazeId` / `glazeOutcome` not in piece sync (see BE-0.x)
- ❌ Image upload round-trip for glaze photos

---

## Gap summary vs studio glaze journal

Reference: common glaze-journal checklist (mixing → glazing → firing → unload + photo journal).

| Practice | App today |
|----------|-----------|
| Date on each mix | 🟡 `dateMixed` on batch, not per mix *session* |
| Recipe on mix day | ✅ On batch |
| Batch quantity / scaled grams | 🟡 `batchSize` + batch scaler; no mix *history* |
| Check off materials while weighing | ❌ |
| Partial weighs (375g of 500g) | ❌ |
| Substitutions / new bag opened | ❌ (only free `recipeNotes`) |
| Strange-while-mixing notes | 🟡 `recipeNotes` / `notes` — not prompted |
| Which glazes over/under | 🟡 `layeredWith` on test; single glaze on piece |
| Dip count / hold time | ❌ |
| Time between coats | ❌ |
| Specific gravity | ❌ |
| Spray / brush details | 🟡 Test: method + thickness only |
| Expected vs actual look | ❌ |
| Glazing mishaps | ❌ |
| Time glazing → kiln start | ❌ |
| Firing temp / cones / anomalies | 🟡 Kiln tab (separate book) |
| Unload: match expectations? | ❌ |
| Before/after process photos | 🟡 Photos exist; no guided sequence |
| Kiln shelf position memory | 🟡 Test `shelfPosition` only |

---

## Phase 1 — Mix log (P0 product)

*Goal: each new bucket mix is a first-class event, not just editing the batch record.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-1.1 | **Mix log entity** — `GlazeMixLog` linked to `glazeId` | ❌ | `{ id, glazeId, mixedAt, targetBatchG, notes, substitutions, incidents }` |
| FE-1.2 | **“Log a mix”** action on glaze detail | ❌ | Creates mix log; optionally bumps version or clones batch |
| FE-1.3 | **Scaled ingredient snapshot** on mix log | ❌ | Copy recipe at mix time + batch scaler output (grams per material) |
| FE-1.4 | **Mix session notes** — prompted fields (optional) | ❌ | Substitutions, new bag, “forgot X”, clumpy material — single notes block OK for v1 |
| FE-1.5 | **Mix history list** on glaze detail | ❌ | “Mixed Mar 3 · 2.5 kg”, tap to read notes |
| FE-1.6 | **Store-bought path** — log mix without full recipe | ❌ | Name + supplier + date + notes (Amaco Honey Flux opened today) |
| FE-1.7 | Persist mix logs in store + sync stub | ❌ | See BE-11.x in backend doc |

**Acceptance:** Mix a batch → dated entry with scaled grams and substitution note → visible in history on glaze detail.

**Defer (v2):** Per-material checkoff UI, partial weigh rows.

---

## Phase 2 — Glazing process on the piece (P0 product)

*Goal: capture what went on the pot before it enters the kiln.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-2.1 | **Glaze stack on piece** — ordered layers | ❌ | `[{ glazeId?, name, role: base \| inside \| accent, notes }]` — allow free text for commercial glazes |
| FE-2.2 | **Glazing notes sheet** on piece / journal | ❌ | Layers, dip seconds, coats, mishaps, hoped-for look |
| FE-2.3 | **Process photos** on piece timeline stage | 🟡 | Timeline photos exist; add “glazing” stage prompts |
| FE-2.4 | **Link piece stack → test tile** | ❌ | Prefill `layeredWith` when logging test from piece |
| FE-2.5 | **Time glazing → firing** | ❌ | Optional `glazedAt` on piece; compare to firing `startedAt` |
| FE-2.6 | Replace single `glazeId` with primary + stack (migration) | ❌ | Keep `glazeId` as primary for analytics backward compat |

**Acceptance:** Glaze a mug → record “Rose Quartz ×2, Honey Flux on rim, 5s dip” + photo → visible in piece journal and on glaze usage.

**Defer:** Specific gravity field, banding-wheel spray count.

---

## Phase 3 — Firing ↔ unload loop (P1)

*Goal: connect kiln results back to glaze notes (blog: read notes while unloading).*

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-3.1 | **Unload review sheet** when completing firing | ❌ | Show assigned pieces + their glaze notes; “As expected?” per piece |
| FE-3.2 | Write unload outcome → piece `glazeOutcome` + notes | 🟡 | Outcome exists; not prompted at unload |
| FE-3.3 | **Firing summary on glaze detail** — pieces fired with this batch | 🟡 | Usage analytics partial; show last firing + outcome |
| FE-3.4 | Cross-link kiln detail ↔ piece journal ↔ glaze detail | ❌ | From firing piece chip → piece → glaze stack |
| FE-3.5 | Cone / temp anomaly note on firing → visible on linked glazes | ❌ | Depends on kiln tab fields (see `KILN-TAB-TASKS.md`) |

**Acceptance:** Complete glaze firing → prompted unload review → piece outcomes updated → glaze detail shows “last fired in X, crawling on 1 piece.”

---

## Phase 4 — Photo journal workflow (P1)

*Goal: guided before/after photos without sketching.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-4.1 | **Glazing photo checklist** (optional) | ❌ | After 1st coat, after 2nd, wax line, drips — user picks what to capture |
| FE-4.2 | Before/after pair on piece or test | ❌ | Tag photos `pre-fire` / `post-fire` |
| FE-4.3 | Kiln load photo → remember shelf position | ❌ | Attach to firing; show on piece from that load |
| FE-4.4 | Compare view (2-up) in piece journal or test detail | ❌ | Side-by-side pre/post |

**Acceptance:** User takes 2 glazing photos + 1 unloaded photo on same piece → can compare in journal.

---

## Phase 5 — Atlas & test tile polish (P1)

*Existing features that need completion for “tracker” credibility.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-5.1 | Test tile **detail screen** (not just glaze detail list) | ❌ | Full notes, photo, edit, link to piece |
| FE-5.2 | Log test from glaze detail **with photo required** nudge | 🟡 | Photo optional today |
| FE-5.3 | **Material library** autocomplete for recipe builder | ❌ | Reduce typos; tie to substitution notes later |
| FE-5.4 | Export / share batch sheet (PDF or text) | ❌ | Recipe + batch ID for studio shelf |
| FE-5.5 | Duplicate batch → new mix log + version | 🟡 | New version exists; not framed as “mixed again” |
| FE-5.6 | Empty states: link setup quest → first batch + first test | 🟡 | Setup quests mention glazes |

---

## Phase 6 — Discover & inspiration (P2)

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-6.1 | Replace placeholder photos with real test tiles | ❌ | CDN or bundled assets |
| FE-6.2 | Expand recipe + inspiration catalog | 🟡 | 9 + 6 bundled |
| FE-6.3 | “Save inspiration to piece notes” (copy application text) | ❌ | Clipboard or prefill glazing sheet |
| FE-6.4 | Remote catalog fetch when BE-10 lands | ❌ | Cache + version bump |

---

## Phase 7 — Community & atlas loop (P2)

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-7.1 | Share glaze → structured post (done) | ✅ | |
| FE-7.2 | Save from community → atlas (done) | ✅ | |
| FE-7.3 | Promote own test tile to community post | ❌ | Photo + recipe teaser |
| FE-7.4 | Migrate off HTML comment recipe payload when BE-7 live | ❌ | |

---

## Phase 8 — Analytics & insights (P2)

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-8.1 | Glaze usage by outcome (success vs crawl rate) | 🟡 | Stats local; surface on detail |
| FE-8.2 | “Best batch” / highest success version | ❌ | Across version family |
| FE-8.3 | Mix frequency — how much made over time | ❌ | Needs mix logs (FE-1.x) |
| FE-8.4 | Materials tab ↔ atlas ingredient overlap | 🟡 | Analytics drill-down started |

---

## Phase 9 — UX & consistency (ongoing)

| # | Task | Status | Notes |
|---|------|--------|-------|
| FE-9.1 | My Atlas search bar theme tokens | 🟡 | Still hardcoded hex in places |
| FE-9.2 | Onboarding: default glaze cone → filter hint | 🟡 | Cone in settings; discover uses filter only |
| FE-9.3 | Terminology pass: “batch” vs “recipe” vs “glaze” | ❌ | User-facing copy |
| FE-9.4 | Accessibility labels on atlas grid + discover | 🟡 | Partial |

---

## Recommended build order (baby steps)

Aligns with “start small, add detail later”:

1. **FE-1.1 – FE-1.5** — Mix log (notes + date + scaled snapshot) — biggest gap vs blog  
2. **FE-2.1 – FE-2.3** — Glaze stack + notes on piece  
3. **FE-3.1 – FE-3.2** — Unload review on firing complete  
4. **FE-5.1** — Test tile detail  
5. **FE-4.1 – FE-4.2** — Photo pairs  
6. Backend P0 (BE-0, BE-1) — cross-device survival  

---

## Backend tasks (separate doc)

Server work is tracked in **[`GLAZE-TAB-BACKEND-TASKS.md`](./GLAZE-TAB-BACKEND-TASKS.md)** including:

- BE-0 — Piece ↔ glaze sync  
- BE-1 — Batch metadata persistence  
- BE-2 – BE-4 — Versions, tests, images  
- BE-7 – BE-8 — Community recipe posts + save provenance  
- BE-9 — Batch scaler sync  
- BE-10 — Discover catalog API  

**Proposed addition when mix logs ship:**

| # | Task | Notes |
|---|------|-------|
| BE-11.1 | `glaze_mix_logs` table + sync | `glaze_id`, `mixed_at`, `target_batch_g`, `ingredient_snapshot_json`, `notes` |
| BE-11.2 | Optional material-level weigh rows | `{ material, target_g, actual_g, checked_at }[]` |

---

## Key files (reference)

| Area | Path |
|------|------|
| Tab shell | `src/screens/library/JournalScreen.tsx` |
| My Atlas | `src/screens/library/LibraryGlazesScreen.tsx` |
| Discover | `src/screens/library/GlazeDiscoverScreen.tsx` |
| Add batch | `src/screens/library/atlas/AddGlazeModal.tsx` |
| Log test | `src/screens/library/atlas/LogTestModal.tsx` |
| Glaze detail | `src/screens/glazes/GlazeDetailScreen.tsx` |
| Types | `src/screens/glazes/types.ts` |
| Store | `src/store/appStore.ts` |
| Sync | `src/screens/library/useGlazesSync.ts`, `src/services/glazes.ts` |
| Piece link | `src/screens/pieces/components/PieceGlazeLinkSection.tsx` |
| Share / community | `src/screens/glazes/shareGlazeRecipe/` |
| Kiln crossover | `src/screens/kiln/`, `KILN-TAB-TASKS.md` |

---

## Out of scope (for now)

- Full material inventory / bag-opened tracking across studio  
- Glaze calculation lab (Unity-style UMF)  
- Cone 10 vs 6 automatic recipe adjustment  
- Replacing physical notebook entirely on day one  

---

## Success criteria — “proper glaze tracker” v1

When these are true, the feature earns the name:

1. **Every mix** can be dated with notes and a scaled gram list.  
2. **Every finished piece** can record what glazes were applied and how.  
3. **Every glaze firing unload** can capture whether results matched notes.  
4. **Tests + pieces + batches** link together without dead ends.  
5. **Data survives** sign-in on a second device (backend P0 complete).

Until then, Glaze Atlas is a strong **recipe + test library** with discover and community — not yet a full **process tracker**.
