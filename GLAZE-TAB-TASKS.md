# Glaze Tab — Implementation Tasks

**Purpose:** Bring the **Glaze Atlas** tab in line with the **GLAZE NOTES** spec — log glaze batches, link to pieces, track outcomes, and support version history.

**Last updated:** June 19, 2026  
**Current completion:** ~96% (Phases 0–6 complete; Phase 7 polish remaining)

### Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| 🟡 | Partial — started, gaps remain |
| ❌ | Not started |

### What exists today

- Tab: **Glaze Atlas** (`app/(tabs)/library.tsx` → `JournalScreen` → `LibraryGlazesScreen`)
- CRUD: add / edit / delete glazes via `AddGlazeModal` + `GlazeDetailScreen`
- Search (name, notes, cone), collection chips (All, Favorites, custom)
- Photo grid cards, detail hero, test tile logging (`LogTestModal`)
- Backend sync (`src/services/glazes.ts`, `useGlazesSync.ts`)
- Discover recipes → save into atlas
- Orphaned UI: `GlazeLibraryScreen.tsx` (richer filters/stats, not wired to any route)

### Key gaps

- No glaze **batch ID**, **date mixed**, or **status** (works / experimental / failed)
- No **version chain** (parent glaze, compare, "+ New Version")
- No **piece ↔ glaze** link (`Piece` has no `glazeId`) — **Phase 4 adds local `glazeId` + `glazeOutcome`**
- Ingredients in model (`recipeIngredients`) but no create/edit UI
- Outcomes tracked on **test tiles**, not per batch version or per piece firing

---

## Phase 0 — Data model & store

Foundation for everything else. Extend types before UI.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Add `GlazeStatus`: `works_great` \| `experimental` \| `failed` | ✅ | `src/screens/glazes/types.ts` |
| 0.2 | Add `GlazeBatchMetadata` fields to `GlazeLibraryItem`: `batchId`, `dateMixed`, `status`, `bestClayType`, `bestFiringTempC`, `atmosphere` (`oxidation` \| `reduction` \| `both`) | ✅ | Keep `finish`; cone strings can coexist with °C |
| 0.3 | Add versioning fields: `parentGlazeId?`, `versionNumber` (default 1), `rootGlazeId?` (stable group key) | ✅ | Enables "Cobalt Blue v3" + `CB-2026-06-v3` |
| 0.4 | Add `ingredientsText` (free-form) or wire up existing `recipeIngredients` + UI | ✅ | Model has `recipeIngredients[]`; spec wants free-form text |
| 0.5 | Add `glazeId?: string` and `glazeOutcome?: string` to `Piece` | ✅ | `src/types/pieces.ts` — `GlazeOutcome` type |
| 0.6 | Store actions: `createGlazeVersion(parentId)`, `getGlazeVersions(rootId)`, `linkPieceToGlaze`, batch ID generator | ✅ | Version helpers in `glazeVersionUtils.ts`; batch ID in `batchId.ts` |
| 0.7 | Migration in persist layer for existing glazes (default `versionNumber: 1`, infer `dateMixed` from `createdAt`) | ✅ | Persist v5 |
| 0.8 | Update `src/services/glazes.ts` mappers + sync payload for new fields | ✅ | Batch fields in sync payload; preserved on merge |

**Acceptance:** New fields persist locally; existing glazes load without breakage.

---

## Phase 1 — Create & edit glaze (core form)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Expand **create** flow: ingredients (required), date mixed (date picker, default today), notes | ✅ | Text date input (YYYY-MM-DD); notes on create |
| 1.2 | Auto-generate `batchId` on save (e.g. initials + date + version) | ✅ | `src/screens/glazes/batchId.ts` |
| 1.3 | Add status picker on create/edit (works great / experimental / failed) | ✅ | Pill group with emoji labels |
| 1.4 | Add metadata fields: best clay type (dropdown), best firing temp (°C), atmosphere, surface finish (already have finish) | ✅ | Extend `AddGlazeModal` |
| 1.5 | Show ingredients in edit modal (currently missing) | ✅ | Same form for create + edit |
| 1.6 | Validate: name + ingredients required before save | ✅ | Save button disabled + toast on submit |

**Acceptance:** User can create a full glaze record matching spec form fields.

---

## Phase 2 — Glaze library list (tab home)

| # | Task | Status | Notes |
|---|------|--------|-------|

| 2.2 | Search: include **ingredients** text in filter | ✅ | `glazeListUtils.glazeSearchHaystack` |
| 2.3 | Status filter chips: All \| Works Great 🟢 \| Experimental 🟡 \| Failed 🔴 | ✅ | Second chip row on `LibraryGlazesScreen` |
| 2.4 | Clay filter: "Works on…" (stoneware / earthenware / porcelain) | ✅ | Chip row filters `bestClayType` |
| 2.5 | Update card (`GlazePhotoTile`): status badge, batch ID, days since mixed | ✅ | Status emoji, meta line on tile |
| 2.6 | Card one-liner: "Best on stoneware at 1240°C" (clay + temp + finish) | ✅ | `buildGlazeCardSubtitle` |
| 2.7 | Swipe-to-delete on list cards (with confirm) | ✅ | `GlazeSwipeTile` + `ConfirmSheet` |
| 2.8 | Evaluate wiring `GlazeLibraryScreen.tsx` vs extending `LibraryGlazesScreen` | ✅ | Extend `LibraryGlazesScreen` (tab home); keep orphaned screen for now |
| 2.9 | Group list by glaze family (show latest version per root, or flat list with version suffix) | ✅ | `collapseToLatestGlazeVersions` + display name suffix |

**Acceptance:** Library matches spec list UX — searchable, filterable by status, informative cards.

---

## Phase 3 — Glaze detail screen

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Show batch ID + date mixed in header | ✅ | Batch chip + mixed date in hero |
| 3.2 | Status picker (inline, saves on change) | ✅ | Pill group saves via `updateGlaze` |
| 3.3 | Ingredients section (display + editable) | ✅ | `GlazeRecipeSummary` + Edit / Add recipe |
| 3.4 | Expanded notes / metadata block (clay, temp, atmosphere, finish, free-form notes) | ✅ | `BatchDetailsCard` |
| 3.5 | Hero photo tap-to-expand (lightbox) | ✅ | `ImageLightbox` component |
| 3.6 | **Pieces Using This Glaze** — list linked pieces with thumbnail, name, firing outcome | ✅ | `GlazeDetailScreen` + `selectPiecesByGlazeId` |
| 3.7 | Quick stats footer: "Used 8 times • 7 successful • 1 crawling" | ✅ | `glazeTestStats.ts` on detail |
| 3.8 | Compute stats from **linked pieces** (not just test tiles) once piece linking exists | ✅ | `formatGlazeUsageStatsLine` combines tests + pieces |

**Acceptance:** Detail shows full batch metadata, linked pieces, and aggregate outcomes.

---

## Phase 4 — Link glaze to piece

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Add searchable **Select Glaze** dropdown to piece create/edit form | ✅ | `GlazePickerField` in `AddPieceForm` |
| 4.2 | Selected glaze shows thumbnail preview on piece form | ✅ | Thumbnail in picker + selected state |
| 4.3 | Persist `glazeId` on piece save | ✅ | `useAddPieceForm` → `buildSavedPiece` |
| 4.4 | Capture firing outcome on piece (success / crawling / underfired / crack) — stage advance or kiln flow | ✅ | Piece form + `StageAdvanceFlowModal` on glaze-fired / finished |
| 4.5 | Reverse lookup: query pieces by `glazeId` for detail screen | ✅ | `selectPiecesByGlazeId` in `glazePieceLink.ts` |

**Acceptance:** Creating/editing a piece links a glaze; detail shows those pieces.

---

## Phase 5 — Glaze batch versioning

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Display version in name convention: "Cobalt Blue v3" | ✅ | `formatGlazeDisplayName` |
| 5.2 | Batch ID includes version segment | ✅ | `generateGlazeBatchId` → `CB-2026-06-v3` |
| 5.3 | Version history list on detail (all versions for `rootGlazeId`) | ✅ | `GlazeDetailScreen` version history section |
| 5.4 | Version card: version #, date mixed, status, "Used N times, M successful" | ✅ | Per-version stats via `formatVersionStatsLine` |
| 5.5 | **+ New Version** flow: copy parent (name, ingredients, notes), pre-fill vN suffix, allow edits, save linked to parent | ✅ | `AddGlazeModal` new-version mode + `buildNewVersionDraft` |
| 5.6 | **Compare** versions: side-by-side ingredients + outcome % diff | ✅ | `CompareVersionsModal` |
| 5.7 | Outcomes tracked **per version** (stats scoped to `glazeId`, not conflated across versions) | ✅ | Stats filtered by `glazeId` on detail + compare |

**Acceptance:** User can remix a glaze over months and see which version performs best.

---

## Phase 6 — Outcomes & firing integration

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Align outcome vocabulary: spec (success/crawling/underfired/crack) vs test tile (great/interesting/bad + defects) | ✅ | `glazeOutcomeMap.ts` maps test tiles → studio outcomes |
| 6.2 | Mark piece glaze outcome after firing (not only via test tile) | ✅ | Piece form, stage advance, kiln glaze-firing completion |
| 6.3 | Optional: prompt to log outcome when advancing piece past glaze firing stage | ✅ | Stage advance modal prompts when piece has linked glaze |
| 6.4 | Keep test tile flow as lab notebook OR merge into batch outcomes — product decision | ✅ | Test tiles kept; stats roll up via shared outcome map |

**Acceptance:** Firing results roll up to glaze stats per version.

---

## Phase 7 — Polish & cleanup

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Remove or merge orphaned `GlazeLibraryScreen.tsx` | ❌ | |
| 7.2 | Remove legacy routes if redundant (`app/glaze-library.tsx`, `app/library-glazes.tsx`) | ❌ | Audit redirects |
| 7.3 | Premium gate: 15-glaze free limit — ensure version creates count correctly | 🟡 | `canAddGlaze()` in `premiumGate.ts` |
| 7.4 | Analytics: glaze usage stats from linked pieces + versions | ❌ | `AnalyticsScreen.tsx` |
| 7.5 | Empty states & onboarding nudge ("Log your first glaze batch") | 🟡 | Basic empty state exists |
| 7.6 | Accessibility: filter chips, status badges, form labels | ❌ | |

---

## Recommended build order

1. **Phase 0** — Data model (blocks everything)
2. **Phase 1 + 2** — Usable library with full create form and status filters
3. **Phase 4 + 3.6–3.8** — Piece linking + detail stats (core "magic")
4. **Phase 5** — Versioning (differentiator)
5. **Phase 6 + 7** — Outcome unification and polish

---

## Spec acceptance checklist

| Criterion | Status |
|-----------|--------|
| Create glaze (name, ingredients, photo, notes) | ✅ |
| View all glazes (searchable list) | ✅ |
| Filter by status (works / experimental / failed) | ✅ |
| Mark outcome after firing | ✅ |
| See pieces using each glaze | ✅ |
| Quick stats (used X times, Y successful) | ✅ |
| Edit / delete glaze | ✅ |
| Create glaze version (inherits parent, can modify) | ✅ |
| See version history | ✅ |
| Compare versions (ingredients + outcomes) | ✅ |
| Outcomes track per version | ✅ |
| Clay type, temp, atmosphere, finish metadata | ✅ |
| Display metadata in detail | ✅ |
| Summary on glaze card | ✅ |
| Filter by clay type | ✅ |
| Link glaze to piece (searchable picker) | ✅ |

---

## Key files

| Area | Path |
|------|------|
| Tab entry | `app/(tabs)/library.tsx`, `src/screens/library/JournalScreen.tsx` |
| List (live) | `src/screens/library/LibraryGlazesScreen.tsx` |
| List (orphaned) | `src/screens/glazes/GlazeLibraryScreen.tsx` |
| Detail | `src/screens/glazes/GlazeDetailScreen.tsx` |
| Create/edit modal | `src/screens/library/atlas/AddGlazeModal.tsx` |
| Test logging | `src/screens/library/atlas/LogTestModal.tsx` |
| Types | `src/screens/glazes/types.ts` |
| Store | `src/store/appStore.ts` |
| Sync | `src/services/glazes.ts`, `src/screens/library/useGlazesSync.ts` |
| Outcome mapping | `src/screens/glazes/glazeOutcomeMap.ts` |
| Piece form | `src/screens/pieces/components/AddPieceForm.tsx` |
| Piece types | `src/types/pieces.ts` |
