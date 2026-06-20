# Glaze Tab — Backend Tasks

**Purpose:** API and sync work needed so Glaze Atlas data survives cross-device use, account restore, and matches the mobile app model.

**Last updated:** June 19, 2026  
**FE status:** See [`GLAZE-TAB-TASKS.md`](./GLAZE-TAB-TASKS.md) — atlas ~65–70% complete; full glaze tracker ~35–40%

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

## P1 — Community glaze recipe posts

FE embeds a machine-readable glaze recipe block in post `content` today (`<!-- pottery-life-glaze:v1 … -->`). This works offline but is fragile for search, moderation, and cross-client parsing.

| # | Task | Notes |
|---|------|-------|
| BE-7.1 | Add `post_type` enum on posts: `text` \| `glaze_recipe` \| … | Default `text` for backward compatibility |
| BE-7.2 | Add nullable `glaze_recipe` JSON column on posts | Schema mirrors `CommunityGlazeRecipePayload` in `src/screens/glazes/shareGlazeRecipe/glazePostPayload.ts` |
| BE-7.3 | Accept `glaze_recipe` on `POST /posts` (or `/users/me/posts`) | When present, set `post_type = glaze_recipe`; strip or ignore HTML comment block in `content` |
| BE-7.4 | Return `post_type` + `glaze_recipe` on feed + my-posts endpoints | FE can stop parsing comment blocks once BE is live |
| BE-7.5 | Validate recipe payload: name, finish, cone, ingredients[] with material + percentage | Reject oversized payloads (>8 KB) |
| BE-7.6 | Teaser posts: allow `teaser_shared: true` with partial or empty ingredients | Matches atlas “teaser mode” share |

**Acceptance:** Share recipe from atlas → post appears in feed with structured JSON → another user saves to atlas without parsing caption text.

---

## P1 — Save community glaze → atlas (provenance & dedup)

Saved glazes use client ids `community-{post_id}-{timestamp}` and land in collection **Saved from Community**.

| # | Task | Notes |
|---|------|-------|
| BE-8.1 | Add optional `source_post_id` (UUID) on glaze sync records | Set when saving from a community post |
| BE-8.2 | Add optional `source_user_id` on glaze sync records | Original poster attribution |
| BE-8.3 | Idempotent save: unique `(user_id, source_post_id)` or return existing glaze | Prevents duplicate saves from same post |
| BE-8.4 | Include `source_post_id` in glaze list + sync pull | FE `isCommunityGlazePostSaved()` can check server-side |
| BE-8.5 | Optional: increment `save_count` on source post | Powers “saved by N potters” on feed cards |

**Acceptance:** Save same community post twice → one atlas entry; reinstall → saved state restored from server.

---

## P1 — Discover catalog (recipes, inspirations, provenance)

Discover tab ships a **bundled static catalog** today (`recipes.ts`, `inspirations.ts`). Recipes save to atlas with stable ids `discover-{recipe_id}` + `discoverSourceRecipeId`. **Layering ideas** are read-only (photo, description, application notes — not saved to atlas).

| # | Task | Notes |
|---|------|-------|
| BE-10.1 | `GET /glazes/discover/recipes` — versioned catalog JSON | Replace bundled `DISCOVER_RECIPES`; include `catalog_version` for cache invalidation |
| BE-10.2 | `GET /glazes/discover/inspirations` — layering ideas | `{ title, description, application_notes, cone, preview_url }` — no recipe refs required |
| BE-10.3 | CDN URLs for test-tile preview images | Replace Unsplash placeholders; signed or public static assets |
| BE-10.4 | Add `source_discover_recipe_id` on glaze sync records | Set when saving a **recipe** from Discover; mirrors community `source_post_id` |
| BE-10.5 | Idempotent save: unique `(user_id, source_discover_recipe_id)` | Prevents duplicate saves; return existing glaze on retry |
| BE-10.6 | Return `source_discover_recipe_id` on glaze list + sync pull | FE `isDiscoverRecipeSaved()` can check server-side |
| BE-10.7 | Optional: `discover_saved_at` timestamp on glaze record | Powers provenance banner + analytics |
| BE-10.8 | Optional: admin endpoint to publish/update catalog entries | Curate recipes + inspirations without app release |
| BE-10.9 | Optional: full-text search index on catalog | Recipes (name, materials) + inspirations (title, notes) |

**Acceptance:** Save Floating Blue from Discover → one atlas entry with provenance → reinstall restores saved state; catalog update bumps version → app fetches new content without release.

---

## P2 — Glaze mix logs (when FE Phase 1 ships)

Proposed when `GlazeMixLog` lands in the app (`GLAZE-TAB-TASKS.md` FE-1.x).

| # | Task | Notes |
|---|------|-------|
| BE-11.1 | `glaze_mix_logs` table + sync payload | `glaze_id`, `mixed_at`, `target_batch_g`, `ingredient_snapshot_json`, `notes` |
| BE-11.2 | Optional weigh rows per mix | `{ material, target_g, actual_g, checked_at }[]` |
| BE-11.3 | Return mix logs on glaze pull | Powers mix history on glaze detail across devices |

**Acceptance:** Log mix on device A → mix history visible on device B on same glaze batch.

---

## P2 — Batch scaling metadata (optional server fields)

Piece-count batch scaling runs **entirely on device** today (`GlazeBatchScalerCard` + `glazeBatchScaler.ts`). Server support is optional for sharing defaults across devices.

| # | Task | Notes |
|---|------|-------|
| BE-9.1 | Optional glaze fields: `default_grams_per_piece`, `default_waste_percent` | User overrides in atlas detail |
| BE-9.2 | Return fields on glaze list/sync | Pre-fill batch scaler on any device |
| BE-9.3 | Optional: include `suggested_batch_g` in `glaze_recipe` community payload | Poster’s coverage preset when sharing |

**Acceptance:** Set “25g per piece” on glaze A → sign in elsewhere → batch scaler opens with same default.

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
| Community post create | `src/services/community.ts` → send `post_type` + `glaze_recipe` when BE-7 lands |
| Community save provenance | `src/screens/community/utils/saveCommunityGlaze.ts`, `glazePostPayload.ts` |
| Discover save provenance | `src/screens/library/discover/saveDiscoverGlaze.ts`, `recipeLookup.ts` |
| Types | `BackendPiece`, `PieceSyncSnapshot`, `BackendFeedPost`, `GlazeSyncItem` |
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
| `POST /posts` (or `/users/me/posts`) | Create feed post (**missing `post_type` / `glaze_recipe`**) |
| `GET /users/me/feed` | Friends feed (**returns plain `content` only today**) |
| `GET /glazes/discover/recipes` | Curated starter recipes (**bundled in app today**) |
| `GET /glazes/discover/inspirations` | Layering ideas — photo + notes (**bundled in app today**) |
| `POST /uploads/presigned` | Post photo upload (see `TICKETS.md` #22) |
