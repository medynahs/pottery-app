# Glaze Tab — Backend Tasks

**Purpose:** API and sync work needed so Glaze Atlas data survives cross-device use, account restore, and matches the mobile app model.

**Last updated:** June 19, 2026  
**FE status:** Glaze Atlas Phases 0–7 complete locally (`GLAZE-TAB-TASKS.md`)

---

## Priority legend

| Priority | Meaning |
|----------|---------|
| P0 | Blocks cross-device / data loss for shipped features |
| P1 | Needed for full spec fidelity on server |
| P2 | Nice to have / future |

---

## P0 — Piece ↔ glaze link sync

The app stores `glazeId` and `glazeOutcome` on `Piece` locally. These are **not** in `PieceSyncSnapshot` today.

| # | Task | Notes |
|---|------|-------|
| BE-0.1 | Add `glaze_id` (nullable UUID or client_ref) to piece sync payload + DB | References a glaze batch the user owns |
| BE-0.2 | Add `glaze_outcome` enum: `success` \| `crawling` \| `underfired` \| `crack` | Matches `GlazeOutcome` in `src/types/pieces.ts` |
| BE-0.3 | Return both fields on `GET /users/me/pieces` and sync response | FE mappers in `src/services/pieces.ts` |
| BE-0.4 | Validate `glaze_id` belongs to same user when present | Reject or null orphaned refs |
| BE-0.5 | Cascade behavior on glaze delete | Either block delete while pieces reference it, or null `glaze_id` on linked pieces |

**Acceptance:** Link a glaze on device A → sign in on device B → piece shows same glaze link and outcome.

---

## P0 — Glaze batch metadata persistence

FE sends batch/version fields in `GlazeSyncItem` (`src/services/glazes.ts`). Comment in FE: *server may ignore until supported*.

| # | Task | Notes |
|---|------|-------|
| BE-1.1 | Persist `batch_id`, `date_mixed`, `status` on glaze records | `works_great` \| `experimental` \| `failed` |
| BE-1.2 | Persist `best_clay_type`, `best_firing_temp_c`, `atmosphere` | Optional metadata |
| BE-1.3 | Persist `ingredients_text` (free-form) alongside structured `recipe_ingredients` | Both can coexist |
| BE-1.4 | Return all fields on list + sync merge | FE `backendGlazeToLocal` must map them |

**Acceptance:** Create glaze with batch ID on device A → pull on device B → batch chip and status match.

---

## P1 — Version chain

| # | Task | Notes |
|---|------|-------|
| BE-2.1 | Persist `version_number` (default 1), `root_glaze_id`, `parent_glaze_id` | `root_glaze_id` stable family key |
| BE-2.2 | Resolve `root_glaze_id` / `parent_glaze_id` via client_ref on sync | Same pattern as glaze ↔ test linking |
| BE-2.3 | Support querying all versions for a root id | Powers version history + compare on any device |
| BE-2.4 | Unique constraint: `(user_id, batch_id)` optional | Prevents duplicate batch labels per user |

**Acceptance:** Create v2 from v1 on device A → version history complete on device B.

---

## P1 — Glaze test tiles

| # | Task | Notes |
|---|------|-------|
| BE-3.1 | Confirm `POST /users/me/glazes/sync` accepts test tile snapshots | Already partially wired in FE |
| BE-3.2 | Persist test fields: clay body, cone, kiln, application, thickness, defects, `result_rating`, photo ref | See `GlazeTestSyncItem` |
| BE-3.3 | Link test → glaze via `glaze_client_ref` | Required for stats rollup |
| BE-3.4 | Test photo upload endpoint or reuse glaze image gallery with type `test-tile` | FE uploads after sync |

**Acceptance:** Log test tile with photo → survives re-login and appears on glaze detail.

---

## P1 — Images

| # | Task | Notes |
|---|------|-------|
| BE-4.1 | Confirm gallery types: `bucket`, `test-tile`, `finished-piece`, `accident` | FE `GlazeImageType` |
| BE-4.2 | Idempotent upload + delete per `(glaze_id, type, client_ref)` | Avoid duplicates on retry |
| BE-4.3 | Return signed URLs in glaze list payload | FE maps to `bucketPhotoUri`, etc. |

---

## P2 — Analytics & limits

| # | Task | Notes |
|---|------|-------|
| BE-5.1 | Optional: server-side glaze count for free-tier enforcement | FE gates at 15 batches today (`FREE_GLAZE_LIMIT`) |
| BE-5.2 | Optional: aggregate endpoint for glaze usage (pieces + tests by family) | FE computes locally for Analytics Materials tab |

---

## P2 — Account lifecycle

| # | Task | Notes |
|---|------|-------|
| BE-6.1 | `DELETE /users/me` cascades glazes, tests, and glaze images | Ticket #6 in `TICKETS.md` |
| BE-6.2 | Export endpoint includes glazes + tests + piece glaze links | Premium export feature |

---

## FE integration checklist (when BE lands)

| Area | FE file to update |
|------|-------------------|
| Piece sync payload | `src/services/pieces.ts`, `src/screens/pieces/hooks/usePiecesSync.ts` |
| Glaze pull mapper | `src/services/glazes.ts` → `backendGlazeToLocal` |
| Types | `BackendPiece`, `PieceSyncSnapshot` |
| Merge rules | Preserve local `syncDirty` until push confirms new fields |

---

## API surface reference (current FE)

| Endpoint | Purpose |
|----------|---------|
| `GET /users/me/glazes` | Pull glaze library |
| `GET /users/me/glazes/tests` | Pull test tiles |
| `POST /users/me/glazes/sync` | Push glaze + test snapshots |
| `POST /users/me/glazes/:id/images` | Upload glaze photo |
| `DELETE /users/me/glazes/:id/images/:imageId` | Remove glaze photo |
| `POST /users/me/pieces/sync` | Push pieces (**missing glaze fields**) |
