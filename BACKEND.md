# Backend — Overview

**Purpose:** How the Pottery Life mobile app talks to the server — patterns, deployment status, and where to find detailed work.

**Last updated:** June 26, 2026  
**Task backlog:** [`BACKEND-TASKS.md`](./BACKEND-TASKS.md) (prioritized P0 → P2)  
**Frontend companion:** [`FRONTEND.md`](./FRONTEND.md)

---

## ✅ Backend status — entire V1 backend complete (Jun 26)

**Every P0, P1, and P2 task in the API repo is shipped.** All P0 (friends, public profile, privacy, pieces/firings/glaze sync, posts/feed/media, reactions, challenges, voting, Hall of Fame) + account delete; all P1 (editable identity `PUT /users/me`, RevenueCat webhook, validation + rate limiting, upload hardening, OG share page, push token storage, **Studios API**, **Polls**, **Admin news**, **glaze version chain / test tiles / images / structured recipe posts / save provenance**); and all P2 (Universal Links, **Discover catalog API**, **glaze mix logs**, **batch scaler fields**, **server-side glaze count enforcement**, **challenge deadline/voting push notifications**, **challenge moderation**, **account delete full lifecycle** — storage purge + premium export, and **server-side cloud upload quotas**).

**Remaining backend gaps are FE wiring plus a small deferred backlog** (extended pieces deep-sync, `/users/me/preferences`, public entitlement GET — see [`BACKEND-TASKS.md` → Deferred / post-V1 backend](./BACKEND-TASKS.md)). FE has wired profile (#91 ✅), privacy (#14 ✅), and push tokens (#86 ✅). Status below is **🔶 backend-done** / **🟡 FE-wired** until each is re-verified in-app. Two prod-config TODOs: set `APPLE_APP_ID` / `ANDROID_SHA256_FINGERPRINT` (Universal Links) and `REVENUECAT_WEBHOOK_SECRET`.

**Routes that changed during implementation — FE must adopt:**

| FE doc / client expects | Actual shipped route | Notes |
|-------------------------|----------------------|-------|
| `GET /feed` | `GET /users/me/feed` | Public `/feed` not implemented; FE already treats 404 as empty |
| `POST /posts` | `POST /users/me/posts` | |
| `DELETE /posts/:id` | `DELETE /posts/:id` | Unchanged; own-post-only |
| `POST /uploads/presigned` → presigned S3 PUT | `POST /uploads` (server-side multipart) → `{ asset_id, public_url }` | **No presign infra.** FE POSTs the file directly to the API |
| Challenge `status` field + phase cron | `status` **derived from dates** in API response | open/voting/closed computed from `submission_deadline`/`end_date`; no cron |

**Account delete is soft-delete, not immediate:** `DELETE /users/me` → 204, sets `is_deleted`. ~1-week grace period. During grace, all endpoints return **403 `account_deleted`** except `POST /users/me/revive` (restores account, 200). Deleted users are hidden from others' feeds/friends/leaderboards; deleted challenge winners show as `user_deleted: true`. Hard-purge cron is deferred.

---

## Architecture

| Layer | Details |
|-------|---------|
| Auth | Ory Kratos — session token in `X-Session-Token` header, stored in SecureStore on device |
| API base | Configured via env; clients in `src/services/` |
| Sync model | Local-first (Zustand + AsyncStorage) with push/pull sync for pieces, glazes, kilns, firings |
| Media | Presigned S3/CDN upload → URL stored on post/glaze/piece records |
| Premium | RevenueCat on device; server entitlement via webhook (not yet verified) |

---

## Deployment status legend

| Symbol | Meaning in this repo |
|--------|----------------------|
| ✅ | FE client wired and working against deployed API (verified in app) |
| 🟡 | FE client wired; behavior partial or endpoint not verified here |
| 🔶 | Backend-only — FE client may exist; deployment not auditable from mobile repo |
| ❌ | Not implemented or known broken |

---

## Domain summary

### Auth & users

| Area | Status | Notes |
|------|--------|-------|
| Login / register / logout | ✅ | Ory flows — Google + email/password verified on device |
| Password recovery | ✅ | Verified end-to-end (Google + email) — Ory Recovery V2 |
| Account delete | ✅ | Soft-delete + grace; `AccountDeletedGate` + `POST /users/me/revive` |
| Current user profile | 🔶 | `GET /users/me`, avatar/cover upload — avatar/cover verified end-to-end (P1-2b ✅ Sprint A) |
| Profile identity edit | 🟡 | `PUT /users/me` shipped (P1-2) — FE wired via `useUpdateProfile()` (#91 ✅); verify in-app |
| Privacy settings | 🟡 | `PUT /users/me/privacy` shipped (P1-3 ✅) + enforced on public profile; FE wired via `useUpdatePrivacy()` (#14 ✅) |
| Public profile | 🔶 | `GET /users/:userId/profile` shipped (P0-2 ✅ Sprint A); 404 when private/unknown |
| Friends | 🔶 | **500 fixed** (`cover_url` added to SELECT, P0-1 ✅ Sprint A) |
| Friend requests | 🔶 | FE wired |
| Studios | 🔶 | Shipped (P1-4): owned/member-of lists, invites, join-requests accept/reject. BE paths follow FE `studios.ts` contract |

### Pieces & kiln

| Area | Status | Notes |
|------|--------|-------|
| Pieces CRUD / sync | 🔶 | `POST /users/me/pieces/sync` verified + deployed (P0-3 ✅ Sprint B); FE fully wired; offline sync active |
| Kilns CRUD | 🔶 | FE wired |
| Firings CRUD | 🔶 | FE wired; **log fields** (`peak_temp_c`, `hold_time_minutes`, `photo_uri`) now round-trip in API (P0-4) |
| Piece ↔ glaze link | 🔶 | `glaze_id` + `glaze_outcome` now in sync payload + DB (P0-10); validated to same user |

### Glaze library

| Area | Status | Notes |
|------|--------|-------|
| Glaze list / sync push | 🔶 | Batch metadata persisted (P0-11). **Version chain shipped** (P1-8): `version_number`/`root_glaze_id`/`parent_glaze_id` + `GET /users/me/glazes/:id/versions`. **Save provenance** (P1-12) + **batch scaler fields** (P2-4) + **mix logs** (P2-3) all persist in sync |
| Test tiles sync | 🔶 | **Shipped** (P1-9): clay/cone/kiln/application/defects/rating/photo_ref persist, linked via `glaze_client_ref` |
| Glaze image upload | 🔶 | **Shipped** (P1-10): `POST/DELETE /users/me/glazes/:id/images` (`bucket`/`test-tile`/`finished-piece`/`accident`); `images[]` with URLs in glaze payload |
| Community recipe posts | 🔶 | **Shipped** (P1-11): `POST /users/me/posts` accepts `type: "glaze_recipe"` + `glaze_recipe` JSONB; feed returns both. **Field is `type`, not `post_type`** — FE live code still embeds recipe in `content`; no FE change required |
| Discover catalog | 🔶 | **Shipped** (P2-2): `GET /glazes/discover/recipes` + `/inspirations` (versioned, public) + admin publish at `/api/glazes/discover` |

### Community

| Area | Status | Notes |
|------|--------|-------|
| Feed + posts | 🔶 | Routes are `GET /users/me/feed`, `POST /users/me/posts`. Image posts work end-to-end via `post_assets` → `assets[]` with public URLs |
| Reactions | 🔶 | DB-unique `(post_id, user_id)`; count in feed payload (P0-7) |
| Polls | 🔶 | Shipped (P1-5): `GET /polls` (active), `POST /polls/:id/vote` (DB-unique one per user → 409), `GET /polls/:id/results`. Admin-create via `POST /api/polls` |
| Challenges (basic) | 🔶 | Join/submit/withdraw FE wired |
| Challenge (tracks + voting) | 🔶 | Shipped (P0-8/9): tracks, idempotent join, submit/withdraw, voting w/ revote + self-vote reject. **Replace FE mock store** |
| Hall of Fame | 🟡 | Winner-archive shipped (P1-6): FE wired — `GET /hall-of-fame` + `/hall-of-fame/winners/:id`; `user_deleted` tombstone |
| News | 🔶 | **Shipped** (P1-7): `GET /news` (public, newest first) + seeded rows. FE not started (#29) |
| Challenge moderation | 🔶 | **Shipped** (P2-7): vote rate-limit, `POST …/entries/:entryId/report`, admin `POST /admin/challenges/:id/entries/:entryId/disqualify` (hides entry from gallery + vote totals) |
| Image upload | 🔶 | **`POST /uploads` (server-side multipart)** → `{ asset_id, public_url }`. No presigned flow |

### Premium & ops

| Area | Status | Notes |
|------|--------|-------|
| RevenueCat webhook | 🔶 | `POST /webhooks/revenuecat` shipped (P1-13), secret-verified + rate-limited 10/min. Writes a `subscriptions` table; server can now read active tier via `GetActiveTier` |
| Push tokens | 🟡 | `POST /users/me/push-tokens` shipped (P1-14) — FE wired (#86 ✅): `usePushTokenSync` on launch + token refresh; `AccountSettingsScreen` on toggle enable |
| Challenge push notifications | 🔶 | **Shipped** (P2-6): background job pushes 48h before `submission_deadline` to joined-but-unsubmitted, and to all joined when voting opens (Expo Push API). FE now registers tokens (#86 ✅) |
| Server-side glaze count | 🔶 | **Shipped** (P2-5): free tier capped at **15** active glazes on `POST /users/me/glazes/sync` → 403 `glaze_limit_reached`; updates/premium pass through. `GET /users/me/glazes/usage` → `{count, limit, is_premium}` |
| Cloud upload quotas | 🔶 | **Shipped** (P2-9): free tier = **500 MB** total cloud media (413 over) + **1** cloud photo per piece (403 on 2nd); premium uncapped. Enforced on piece-asset, glaze-image, avatar, cover uploads (`internal/quota/cloud.go`) |
| Account delete — full lifecycle | 🔶 | **Shipped** (P2-8): hard-purge piggybacks the 10m background-jobs ticker (30-day `deleted_at` grace), wipes whole `{userID}/` storage prefix, then FK-cascades the DB row. **`GET /users/me/export`** (premium-gated) returns glaze + piece-glaze-link archive |
| Input validation / rate limits | 🔶 | Shipped (P1-15): global 1000/min limiter + per-route limits; identity/upload input validated |
| Upload security | 🔶 | Shipped (P1-16): auth-only, type whitelist + byte-sniff, 10MB cap, UUID keys |

---

## Sync patterns

### Pieces

1. Local create/update sets `syncDirty`
2. `useOfflineSync` / `usePiecesSync` pushes snapshots to server
3. Login reconciliation: push locals without `backendId`, pull missing server rows
4. ~~Gap: `glazeId`, `glazeOutcome` not in payload~~ — **resolved (P0-10)**: both now in sync payload + DB, validated to same user

### Glazes

1. `POST /users/me/glazes/sync` batches glaze + test snapshots
2. Client refs link tests → glazes across devices
3. ~~Gap~~ **closed:** batch metadata (P0-11), version chain (P1-8), test tiles (P1-9), save provenance (P1-12), batch scaler (P2-4), and mix logs (P2-3) all persist. Glaze gallery images (P1-10) ride separate `…/glazes/:id/images` endpoints. Free tier capped at 15 glazes server-side (P2-5)

### Kilns & firings

1. Local-first CRUD in `appStore`
2. `useKilnsSync`, `useFiringsSync` push/pull
3. **Gap (narrowed):** `peakTempC`, `holdTimeMinutes`, `photoUri` now round-trip (P0-4). `firedDate`/`statusOverride`/`pieceIds` mapping still to confirm on FE

---

## Pieces feature — completeness backlog

**Context:** V1 P0 for pieces is **shipped** (`P0-3` sync, `P0-10` glaze link, piece assets CRUD). The mobile app’s `Piece` model is much richer than what the API persists today — most journal, metadata, and pricing fields are **local-only** (`src/types/pieces.ts`). This section tracks what the **API** still needs for the pieces tab to be “complete.”

**FE reference:** `src/services/pieces.ts`, `usePiecesSync`, `pieceAssetSync.ts` · **Field map:** [`BACKEND-TASKS.md` → Pieces table](./BACKEND-TASKS.md)

### Shipped today (baseline)

| Capability | Route(s) | Notes |
|------------|----------|-------|
| Bulk upsert / soft-delete | `POST /users/me/pieces/sync` | Idempotent on `(user_id, client_ref)`; returns `pieces[]` + `client_ref_map` |
| List / update single piece | `GET /users/me/pieces`, `PUT /users/me/pieces/{id}` | Same field set as sync snapshot |
| Hard delete | `DELETE /users/me/pieces/{id}` | FE uses soft-delete via sync today |
| Glaze link | sync + PUT payload | `glaze_id` (FK, same user), `glaze_outcome` enum |
| Piece photos | `GET/POST/PUT/DELETE …/pieces/{id}/assets` | Cover = asset with `status: null`; stage photos keyed by collapsed API `status` |
| Privacy | `PUT /users/me/privacy` | `pieces_public` hides piece posts on public profile |

**Sync payload today:** `client_ref`, `name`, `status`, `description?`, `deleted?`, `glaze_id?`, `glaze_outcome?`.

**Stage vocabulary:** API uses 8 statuses (`idea` … `cemetery`). FE maps granular local stages (e.g. `leather-hard`, `bone-dry`) into coarser API values — **granularity is lost on pull**.

### Definition of “complete”

| Tier | Goal | BE responsibility |
|------|------|-------------------|
| **V1-complete** | Offline-first tracker; reinstall keeps identity + stage + cover/stage photos + glaze link | Verify assets + sync in production; optional server-side photo-tier enforcement |
| **Full-complete** | Entire `Piece` journal workbook syncs cross-device; studio integrations work | Extend sync schema (below); related firing / glaze / studio endpoints |

V1 P0 items are done — remaining work is **payload extension** and **cross-domain links**, not greenfield CRUD.

### Gaps — by priority

#### P1 · Cross-device journal & metadata (blocks “full” pieces)

Extend `POST /users/me/pieces/sync` and `PUT /users/me/pieces/{id}` (and `GET` responses) to round-trip fields the FE stores locally today:

| Field group | FE location | Suggested BE shape | Notes |
|-------------|-------------|-------------------|-------|
| **Timeline / journal** | `Piece.timeline[]` | `timeline` JSONB array: `{ stage, timestamp, notes?, photos?, bisque_temp?, glaze_temp?, status? }` | Photos in timeline stay **URIs locally**; cloud URLs come from assets API. Store `notes` + capture metadata server-side. |
| **Granular stage** | `Piece.stage` (11 local values) | `local_stage` string **or** widen `status` enum | Without this, `leather-hard` / `trimming` / `bone-dry` collapse to `forming` / `drying` on pull. |
| **Outcome status** | `Piece.status` (sold/gifted/…) | `outcome_status` string (nullable) | Separate from lifecycle `status` / stage. |
| **Physical metadata** | clay, forming method, form, dimensions, weight, location, decorations, notes | Flat nullable columns or `metadata` JSONB | Match `src/types/pieces.ts` field names for thin FE mappers. |
| **Cemetery** | `epitaph`, `causeOfDeath` | Nullable text columns | Only when `status = cemetery`. |
| **Batch grouping** | `batchId`, `batchSize` | `batch_client_ref`, `batch_size` | Client-generated batch id; no separate batch entity required for V1. |
| **Pricing & costs** | `pricingUserType`, firing/sale modes, all `cost*` / `*Price` / labor fields | `pricing` JSONB blob | Large surface — JSONB avoids 30+ migrations; validate on write (P1-15). |

**Acceptance:** Second device or reinstall restores journal text, metadata, pricing, and granular stage — not just name + collapsed stage.

#### P1 · Piece assets (verify + small extensions)

Assets API exists; FE wires upload/hydrate in `pieceAssetSync.ts`. Remaining BE work:

| Item | Status | Action |
|------|--------|--------|
| Cover + per-stage photo round-trip | 🔶 shipped, verify | Confirm multipart upload, CDN URLs, delete cascade on piece soft-delete |
| Map asset → timeline entry | Partial | Today assets use collapsed API `status`; consider `local_stage` on asset row or `client_ref` on asset for multi-photo-per-stage |
| Asset `description` | Shipped | Wire if journal captions should sync |
| Premium photo limit (1 cloud photo/piece free) | **Enforced server-side** (P2-9) | `POST …/assets` rejects a free user's 2nd cloud photo per piece → 403; PUT-replace untouched. Premium uncapped |
| Global cloud storage cap (500 MB free) | **Enforced server-side** (P2-9) | Sums live object bytes under `{userID}/` before accept; over cap → 413. Premium uncapped |

#### P1 · Related domains (pieces-adjacent, not on `pieces` row)

| Item | BE task | Why it matters for pieces |
|------|---------|---------------------------|
| Firing ↔ piece assignment | **P0-4 extend** — `piece_ids[]` on firings | Completing a firing should link pieces server-side; today local-only |
| Glaze stack on piece | **P2-3** (mix logs / stack) | Single `glaze_id` shipped; over/under coats + glazing notes need new schema |
| Studio queue | Product study | `studioQueueStatus` on `Piece` is local-only; needs studio-member API |
| Challenge submit | P0-8 ✅ | Piece-linked posts work via community; no extra piece endpoint |

#### P2 · Public / social surfacing

| Item | Notes |
|------|-------|
| Public profile piece grid | Uses **community posts**, not `GET /pieces` — governed by `pieces_public` + post assets |
| `GET /users/:userId/pieces` | Not required for V1; add only if product wants a dedicated public piece portfolio API |

### Recommended build order (API repo)

1. **`local_stage` on piece row** — stop stage granularity loss (small migration, unblocks honest sync).
2. **`timeline` JSONB + outcome/metadata columns** — biggest user-visible gap on reinstall.
3. **`pricing` JSONB** — studio sellers lose economics today.
4. **Asset `local_stage` or ordering** — multi-photo journal entries survive cross-device merge.
5. **Firing `piece_ids`** — kiln tab completion; pieces show firing history consistently.
6. ~~**Server premium enforcement**~~ — ✅ shipped: photo/storage quotas (P2-9) + glaze count (P2-5) enforced server-side via `GetActiveTier`.
7. ~~**Glaze stack / mix logs (P2-3)**~~ — ✅ shipped: mix logs persist in glaze sync.

### FE work when BE lands

| BE change | FE files to update |
|-----------|-------------------|
| Extended sync payload | `PieceSyncSnapshot`, `BackendPiece`, `pieceToSnapshot`, `backendToLocalPatch` in `pieces.ts` / `usePiecesSync.ts` |
| `local_stage` | `LOCAL_STAGE_TO_API` / `API_TO_LOCAL_STAGE` — prefer round-trip over collapse |
| Timeline JSONB | Stop treating `timeline` as local-only in merge logic |
| Firing `piece_ids` | `useFiringsSync.ts`, firing ↔ piece assignment UI |
| Entitlement API | `premiumGate.ts`, `pieceAssetSync.ts` — replace device-only limits |

### Out of scope (pieces)

- Full material inventory / clay lot tracking
- Comments on piece journal entries
- Public studio search for pieces
- Glaze lab calculations (grams, shrinkage) — FE utilities today

---

## Full app — what should be saved on the backend

**Purpose:** Whole-app map of user data and settings: what the API **already** owns, what **should** move to the server for cross-device / reinstall, and what can **stay on device**. Complements the Zustand field tables below.

**Single store:** Almost all local state is `src/store/appStore.ts` (AsyncStorage via `partialize`). Exceptions: session token (SecureStore), `profilePostCache` (in-memory session cache), Discover recipes (bundled JSON).

### Feature matrix (by app area)

| App area | User-facing data | On BE today | Should be on BE | OK device-only |
|----------|------------------|-------------|-----------------|----------------|
| **Auth** | Session, email | ✅ Ory | — | — |
| **Onboarding** | Role archetype, kilnkin pick, module choices, units/language | 🟡 `role` on `GET /users/me` | **P2** — `onboarding_profile` JSON or fold into preferences | `generalOnboardingCompleted`, ceremony flags |
| **Profile & identity** | Name, studio, location, bio, avatar, cover | ✅ `PUT /users/me` + uploads wired (#91) | **P2** onboarding prefs | — |
| **Privacy** | Profile/pieces public, analytics opt-in | ✅ community flags wired (#14) | **P2** analytics/suggestions prefs | — |
| **App customization** | Clay bodies, forming methods, piece forms, cones, stages, pricing rules, modules, text size | ❌ | **P1** — `GET/PUT /users/me/preferences` | UI toggles (compact cards, hidden analytics tabs) |
| **Overview tab** | Widgets, missions, kilnkin nudges, setup quests, alerts | ❌ (computed from local store) | **P2** rhythm + missions if cloud quests matter | `seenCeremonies`, `setupProgress`, alert **generation** (derive from synced data) |
| **Pieces** | Journal, metadata, pricing, photos, batches | 🟡 minimal sync + assets API | **P1** — extend pieces sync ([backlog](#pieces-feature--completeness-backlog)) | — |
| **Kiln** | Kiln profiles, firings, checklist template | 🟡 kilns + firings (partial) | **P1** `piece_ids` on firing · **P2** checklist in preferences | `logSource`, session UI state |
| **Glaze / Library** | Atlas recipes, tests, collections, images | ✅ `POST /users/me/glazes/sync` + images/version/tests/scaler/mix-logs all persist ([§ E](#e--glaze-atlas-glazes-glazetests--partial-sync)) | Verify FE round-trip | Discover catalog now `GET /glazes/discover/*` (P2-2) |
| **Analytics** | Studio stats, charts, export | ❌ (FE computes from local store) | **P3** optional historical snapshots · entitlement read for gates | Period/tab UI prefs |
| **Community — feed** | Posts, reactions, images | ✅ `GET /users/me/feed`, posts, uploads | Verify only | Feed scroll/cursor cache |
| **Community — create** | Text + photo posts | ✅ | Verify `POST /uploads` in prod (#24 ✅) | Composer preset (navigation) |
| **Community — challenges** | Join, submit, vote, gallery | 🟡 API shipped; FE still uses mock in `__DEV__` | **P1** remove mock store; server is source of truth | Dev phase bar |
| **Community — Hall of Fame** | Winner archive | 🟡 API + FE wired (#28) | Verify in prod | — |
| **Community — polls** | Poll list + votes | ✅ | Verify | Demo poll vote id (offline fallback) |
| **Community — news** | Admin news cards | ✅ `GET /news` (P1-7) | Wire FE #29 | — |
| **Community — events/drops** | Events tab | ❌ | Out of scope V1 (tab hidden) | Placeholder UI |
| **Profile tab — posts** | Own post grid | ✅ `GET /users/me/posts` | Verify; drop session cache when stable | `profilePostCache` (memory) |
| **Profile tab — journey/badges** | XP, badges, milestones | ❌ (computed from local counters + store) | **P3** optional `user_stats` / badge unlocks if achievements must survive reinstall | Badge **definitions** (code registry) |
| **Friends** | Friends list, requests | ✅ friends API | **P2** stop using local `clayFriendsCount` | — |
| **Studios** | Owned/member studios, invites | ✅ `/users/me/studios/*` (P1-4) | **P2** `user.linkedStudioCode` invite codes (out of scope) + active studio context; piece queue needs API | `studio` / `studioMembers` runtime cache |
| **Studio rhythm** | Schedule, drying timers, events, rituals | ❌ | **P2** `preferences.studio_rhythm` JSONB | Ad-hoc `tasks[]` |
| **Notifications** | Toggles + local kilnkin pushes | 🟡 push token endpoint | **P2** prefs on server for **remote** pushes (P2-6) | Local notification schedule + in-app inbox |
| **Premium** | Entitlement, purchases | 🟡 RC webhook + server reads tier (`GetActiveTier`); gates export/quotas | **P2** optional `GET /users/me/entitlement` for FE-readable tier | `isPremium` from device SDK until a GET exists |
| **Account settings** | Delete account, change password | ✅ `DELETE /users/me` · Ory password | Verify revive flow | — |
| **Public profile** | Other users’ grid | ✅ `GET /users/:id/profile` | Verify privacy enforcement | — |
| **Discover** | Recipe / inspiration catalog | ✅ `GET /glazes/discover/recipes` + `/inspirations` (P2-2) | Wire FE off bundled JSON | Bundled JSON OK until FE wired |

---

## Zustand-only data — field-level inventory

**Scope:** Everything in **`appStore`** that is not in the “Already on the backend” table — organized for implementers. **Priority:** P1 = cross-device studio survival · P2 = important · P3 = nice-to-have · **—** = intentionally device-local.

**Persist gap:** Fields marked **⚠ not in `partialize`** are lost on **cold start** even before cross-device sync is considered.

### Already on the backend (do not re-implement)

| Data | API |
|------|-----|
| Session | Ory + SecureStore |
| Name, studio, location, bio | `GET` / `PUT /users/me` |
| Avatar, cover | Upload on `/users/me` |
| `profile_public`, `pieces_public` | `PUT /users/me/privacy` |
| `role` | `GET /users/me` (writable path TBD) |
| Pieces (minimal) | `POST /users/me/pieces/sync`, assets sub-resource |
| Glazes + tests (core) | `POST /users/me/glazes/sync` |
| Kilns | `/users/me/kilns` |
| Firings (core + log fields) | `/users/me/firings` |
| Feed, posts, reactions, uploads | Community routes |
| Challenges, voting, Hall of Fame | `/challenges`, `/hall-of-fame` |
| Polls | `GET /polls`, vote POST, `GET /polls/:id/results` |
| Friends + requests | `/users/me/friends` |
| Public profile | `GET /users/:userId/profile` |
| Studios (CRUD, invites) | `/users/me/studios` |
| News | `GET /news` (public) |
| Discover catalog | `GET /glazes/discover/recipes`, `/inspirations` |
| Glaze images / versions / usage | `…/glazes/:id/images`, `…/glazes/:id/versions`, `…/glazes/usage` |
| Push token | `POST /users/me/push-tokens` — FE wired (#86 ✅) |
| Account delete + export | `DELETE /users/me`, `POST /users/me/revive`, `GET /users/me/export` (premium) |
| Premium events | `POST /webhooks/revenuecat` |

---

### J · Auth, account & security

| Data | Location | BE today | Should BE? | Notes |
|------|----------|----------|------------|-------|
| `sessionToken`, `oryIdentityId`, `oryEmail` | SecureStore + store | ✅ Ory | — | Never in preferences blob |
| Password change | `change-password` screen | ✅ Ory | — | |
| Account delete / revive | Account settings | ✅ | — | Soft-delete + grace |

---

### K · Onboarding & role

| Zustand key | What it is | BE today | Priority | Notes |
|-------------|------------|----------|----------|-------|
| `role` | Studio owner / hobby / etc. | 🟡 read on `/users/me` | P2 | Writable `PUT` or part of preferences |
| `onboardingProfile` | Archetype, kiln count, units, language, modules, kilnkin id | ❌ | P2 | Large; overlaps preferences + role |
| `generalOnboardingCompleted` | Finished welcome flow | ❌ | P3 | Infer from non-null role + kilnkin |
| `studioCreatedAt` | First onboarding timestamp | ❌ | P3 | Use `users.created_at` on server |
| `initialSetupQuestCount` | Quest denominator | ❌ | — | Device UX |

---

### A · Studio setup & user preferences

**Recommended API:** `GET` / `PUT /users/me/preferences` with a versioned JSON document (or `preferences` JSONB on `users`). Single upsert keeps clay lists, stage config, and UI prefs atomic.

| Zustand key | What it is | BE today | Priority | Notes |
|-------------|------------|----------|----------|-------|
| `clayBodies` | User-edited clay body list + shrinkage % | ❌ | **P1** | App Customization → Clay Bodies. **Also missing from `partialize`** — lost on restart |
| `defaultClayBodyId` | Default clay for new pieces | ❌ | **P1** | **Not in `partialize`** |
| `formingMethods` | Wheel thrown, slab, etc. | ❌ | **P1** | **Not in `partialize`** |
| `pieceFormOptions` | Mug, bowl, vase, … | ❌ | **P1** | **Not in `partialize`** |
| `defaultBisqueTemp` | Default bisque cone | ❌ | **P1** | **Not in `partialize`** |
| `defaultGlazeTemp` | Default glaze cone | ❌ | **P1** | **Not in `partialize`** |
| `defaultNewPieceStage` | Starting stage for new pieces | ❌ | P1 | In `partialize`; not on server |
| `stageConfig` | Enabled stages, labels, icons, order | ❌ | **P1** | Custom pipeline; affects whole app |
| `pricingSettings` | Global pricing rules (currency, tiers, labor, overhead) | ❌ | **P1** | Separate from per-kiln pricing on kiln rows |
| `pricingTemplates` | Named pricing presets | ❌ | P1 | |
| `activePricingTemplateId` | Active template id | ❌ | P1 | |
| `pricingOnboardingCompleted` | Pricing quest done | ❌ | P3 | Can re-derive from non-empty settings |
| `enabledModules` | Which tabs/modules are on | ❌ | P2 | Partially mirrored in `onboardingProfile.activeModules` |
| `textScale` | Accessibility text size | ❌ | P2 | Also on `onboardingProfile.textScale` |
| `practiceMode` | Demo / practice studio flag | ❌ | P3 | OK device-local unless product wants cloud |
| `analyticsHiddenTabs` | Hidden analytics sub-tabs | ❌ | P3 | Pure UI |
| `piecesCompactCards` | Dense piece grid toggle | ❌ | P3 | Pure UI |
| `kilnkinCompanion` | Element + custom name | ❌ | P2 | Onboarding choice; premium swap is FE-only |
| `kilnChecklist` | User’s kiln prep checklist items | ❌ | P2 | Template checklist, not per-firing |

**Suggested `preferences` JSON shape (illustrative):**

```json
{
  "version": 1,
  "clay_bodies": [{ "client_ref": "…", "name": "B-Mix", "shrinkage_pct": 12 }],
  "default_clay_body_ref": "…",
  "forming_methods": [{ "client_ref": "…", "name": "Wheel Thrown" }],
  "piece_forms": [{ "client_ref": "…", "name": "Mug" }],
  "defaults": { "bisque_cone": "04", "glaze_cone": "6", "new_piece_stage": "idea" },
  "stage_config": [{ "id": "forming", "label": "…", "enabled": true, "icon_key": "…" }],
  "pricing": { "settings": { }, "templates": [ ], "active_template_ref": "…" },
  "ui": { "text_scale": "default", "enabled_modules": ["pieces","kiln"], "pieces_compact_cards": false },
  "kilnkin": { "element": "earth", "name": "Terra" },
  "kiln_checklist": [{ "client_ref": "…", "label": "…", "sort": 0 }]
}
```

---

### B · Privacy, notifications & onboarding

| Zustand key | What it is | BE today | Priority | Notes |
|-------------|------------|----------|----------|-------|
| `privacyPrefs.profilePublic` | Profile visible on web/app | 🟡 | — | **BE + FE shipped** — hydrate on login, save on toggle (#14) |
| `privacyPrefs.piecesPublic` | Piece posts on public profile | 🟡 | — | Same |
| `privacyPrefs.analyticsEnabled` | Product analytics opt-in | ❌ | P2 | Local only; extend P1-3 or preferences blob |
| `privacyPrefs.personalizedSuggestions` | Personalization opt-in | ❌ | P2 | Local only |
| `notificationPrefs.*` | Kiln/drying/weekly/challenge toggles | ❌ | P2 | Push delivery needs P1-14 token + prefs for server pushes (P2-6) |
| `generalOnboardingCompleted` | Finished 3-step onboarding | ❌ | P3 | Can infer from `role` + kilnkin on server |
| `onboardingProfile` | Archetype, modules, text scale from onboarding | ❌ | P2 | Overlaps `role`, `enabledModules`, `textScale` |
| `setupProgress` | Setup quest checklist flags | ❌ | P3 | Recomputable from preferences + first piece |
| `initialSetupQuestCount` | Quest denominator snapshot | ❌ | P3 | Device UX only |

---

### C · Pieces (`pieces[]`) — partial sync

Full detail: [Pieces completeness backlog](#pieces-feature--completeness-backlog). Summary of **Zustand fields with no BE home**:

| Zustand / `Piece` field | BE today | Priority |
|-------------------------|----------|----------|
| `timeline[]` (notes, photos metadata, stage history) | ❌ | **P1** |
| `local_stage` granularity (`leather-hard`, etc.) | ❌ (collapsed) | **P1** |
| `clay`, `formingMethod`, `form`, dimensions, weight, location, decorations | ❌ | **P1** |
| `status` (sold/gifted/…) outcome | ❌ | P1 |
| All pricing / cost / labor fields on piece | ❌ | P1 |
| `epitaph`, `causeOfDeath` | ❌ | P2 |
| `batchId`, `batchSize` | ❌ | P2 |
| `studioQueueStatus`, `studioQueueSubmittedAt` | ❌ | P2 | Needs studio-member API |
| `photo` / timeline photos | 🟡 | P1 | Assets API exists; journal notes not tied to assets server-side |
| `name`, `stage`, `description`, `glazeId`, `glazeOutcome` | ✅ | — | Synced |

---

### D · Kilns & firings — partial sync

| Zustand key | BE today | Priority | Notes |
|-------------|----------|----------|-------|
| `kilns[]` (profile, pricing per kiln, delays) | ✅ | — | `useKilnsSync` |
| `firings[]` core session fields | ✅ | — | |
| `firings[].pieceIds` | ❌ | **P1** | Piece assignment on completed firing |
| `firings[].statusOverride` | ❌ | P2 | Manual session state override |
| `firings[].result`, `resultNotes` | ❌ | P2 | Outcome on log firing |
| `firings[].logSource` | ❌ | P3 | FE discriminator (`session` vs `manual`) |

---

### E · Glaze atlas (`glazes[]`, `glazeTests[]`) — partial sync

| Zustand key | BE today | Priority | Notes |
|-------------|----------|----------|-------|
| Core recipe fields, ingredients, tags, collections | ✅ | — | `POST /users/me/glazes/sync` |
| Batch metadata (`batchId`, `dateMixed`, `status`, …) | ✅ | verify | P0-11 — persists; verify FE round-trip |
| `versionNumber`, `rootGlazeId`, `parentGlazeId` | ✅ | verify | P1-8 shipped — persists + `GET …/glazes/:id/versions` |
| Gallery photos (`bucketPhotoUri`, test/finished/accident URIs) | ✅ | verify | P1-10 shipped — `…/glazes/:id/images` upload/delete; `images[]` in payload |
| `discoverSourceRecipeId`, `discoverSavedAt` | ✅ | verify | P1-12 shipped — provenance persists, idempotent |
| `communitySourcePostId`, … | ✅ | verify | P1-12 shipped — `source_post_id`/`source_user_id` persist |
| `batchScalerGramsPerPiece`, `batchScalerWastePercent`, … | ✅ | verify | P2-4 shipped — persist in sync |
| `glazeCollectionNames` | 🟡 | P2 | Derived from glaze `collections`; confirm server stores custom names |
| `glazeTests[]` | ✅ | verify | P1-9 shipped — test tiles persist (clay/cone/defects/rating/photo_ref) |
| Mix logs (`mix_logs[]` per glaze) | ✅ | verify | P2-3 shipped — persist via glaze sync |

---

### F · Studio rhythm & missions

| Zustand key | What it is | BE today | Priority | Notes |
|-------------|------------|----------|----------|-------|
| `studioRhythm` | v2 rhythm (type, stage days, drying timers, events, rituals, sprint) | ❌ | P2 | Large nested object — good `preferences.studio_rhythm` JSONB candidate |
| `studioRhythmConfig` | Legacy rhythm config + goals | ❌ | P2 | Migrate to v2 or drop |
| `dailyMissionCompletion` | Per-day mission checkmarks | ❌ | P3 | Gamification; OK device-local unless cloud missions |
| `tasks` | “Today’s routine” ad-hoc tasks | ❌ | P3 | Ephemeral; device OK |

---

### G · Community & social counters (prefer server authority)

| Zustand key | BE today | Priority | Notes |
|-------------|----------|----------|-------|
| `hasCreatedPost`, `communityPostsCreated` | 🟡 | P3 | Derive from posts API |
| `challengeEntriesSubmitted`, `challengeWins` | 🟡 | P3 | Derive from challenges / HoF API |
| `clayFriendsCount` | 🟡 | P2 | Should be `GET /friends` count, not local counter |
| `communityDemoPollVoteId` | ❌ | — | **Device OK** — demo poll fallback |
| `communityKilnShareHintShown`, `communityPieceShareHintShown` | ❌ | — | **Device OK** — one-time UI hints |
| `communityPostSaveCounts` | ❌ | P3 | Local stub until BE exposes save counts |
| `hasOpenedCommunityTab` | ❌ | — | **Device OK** — first-visit UX |

---

### H · Identity & profile patches still local

| Zustand key | BE today | Priority | Notes |
|-------------|----------|----------|-------|
| `user.name`, `studioName`, `location`, `bio` | ✅ | — | `PUT /users/me` wired (#91) |
| `user.linkedStudioCode` | ❌ | P2 | Studios API (P1-4) — invite/join flow |
| `user.avatarImageUri`, `coverImageUri` | ✅ | — | Intentionally **not** in `partialize`; fetched from `/users/me` |

---

### L · Overview, journey, badges & gamification

Computed mostly from **local** store today — badges/journey re-derive after sync if underlying data syncs.

| Data | Location | BE today | Priority | Notes |
|------|----------|----------|----------|-------|
| Overview widgets (firing queue, live studio, missions) | Derived from pieces/kilns/firings | ❌ | — | No BE if domain data syncs |
| `dailyMissionCompletion` | Per-day mission checkmarks | ❌ | P3 | Optional `user_missions` table if cloud cap (#15) |
| `tasks` | Ad-hoc “today’s routine” | ❌ | — | Ephemeral |
| `setupProgress` | Setup quest flags | ❌ | P3 | Recomputable |
| `seenCeremonies` | First-piece / first-kiln celebrations | ❌ | — | Device UX |
| Badge progress (`badgeRegistry` + `useBadgeContext`) | Journey, badges screens | ❌ | P3 | **Derive** from synced pieces/glazes/posts/challenges; optional persist unlock timestamps |
| `communityPostsCreated`, `challengeEntriesSubmitted`, `challengeWins` | Achievement counters | ❌ | P3 | Prefer aggregate from posts/challenges API |
| `hasCreatedPost`, `hasOpenedCommunityTab` | First-visit UX | ❌ | — | Device |
| Kilnkin mood / nudge copy | `petMood.ts`, overview hero | ❌ | — | Derived + device |

---

### M · Analytics

| Data | Location | BE today | Priority | Notes |
|------|----------|----------|----------|-------|
| All charts & `computeStudioStats` | `app/analytics.tsx` | ❌ | — | **Compute on device** from synced pieces/kilns/glazes |
| `analyticsHiddenTabs` | User hides sub-tabs | ❌ | P3 | `preferences.ui` |
| Studio export JSON | Privacy → export (premium) | ❌ | — | Client-side assembly; no server archive required for V1 |
| Historical analytics snapshots | — | ❌ | P3 | Only if product wants multi-year cloud reports |

---

### N · Community — API vs local/mock

| Data | Location | BE today | Priority | Notes |
|------|----------|----------|----------|-------|
| Feed posts + reactions | `ForYouFeed`, `community.ts` | ✅ | P1 verify | |
| Create post (text + photo) | `CreatePostSheet` | ✅ | P1 verify `POST /uploads` | |
| Own posts grid | `useProfilePosts` | ✅ | P1 verify | Fallback: `profilePostCache` (memory) |
| Challenge join/submit/vote | `FestivalsTab`, `ChallengeGalleryScreen` | 🟡 | **P1** | Remove `mockChallengeStore` / `MOCK_*` in prod |
| Hall of Fame cycles | `HallOfFameTab` | ✅ | Verify | Dev mock fallback only |
| Winner detail | `HallOfFameWinnerScreen` | ✅ | `GET /hall-of-fame/winners/:id` | Dev mock fallback only |
| Polls | `CommunityPollCard` | ✅ | verify | |
| `communityDemoPollVoteId` | Demo when `GET /polls` empty | ❌ | — | Device fallback |
| `communityPostSaveCounts` | Save count stub | ❌ | P3 | Use `save_count` on feed payload (BE-8.5) |
| `communityKilnShareHintShown`, `communityPieceShareHintShown` | One-time hints | ❌ | — | Device |
| Glaze recipe in post caption | HTML comment parse | ✅ BE | P3 | P1-11 shipped — structured `type: "glaze_recipe"` + `glaze_recipe` JSONB (field is `type`, not `post_type`); FE still parses comment block |
| News cards | Not built (#29) | ✅ BE | P2 | P1-7 shipped — `GET /news`; FE #29 |
| Events / Drops tab | `DropsTab` placeholder | ❌ | — | Out of scope V1 |

---

### O · Friends, studios & shared studio

| Data | Location | BE today | Priority | Notes |
|------|----------|----------|----------|-------|
| Friends list + requests | `friends.ts`, `app/friends.tsx` | ✅ | verify | |
| `clayFriendsCount` | Profile header counter | ❌ | P2 | Use `GET /friends` length |
| `user.linkedStudioCode` | Profile link to studio | ❌ | P2 | Studios API P1-4 |
| `studio`, `studioMembers` | Runtime studio context | 🟡 | P2 | Fetch from `/users/me/studios`; not in `partialize` |
| Piece `studioQueueStatus` | Member firing queue | ❌ | P2 | Needs studio workflow API (product study) |

---

### P · Notifications & alerts

| Data | Location | BE today | Priority | Notes |
|------|----------|----------|----------|-------|
| `notificationPrefs.*` | Settings toggles | ❌ | P2 | Store on user for server-triggered push (P2-6) |
| Local kilnkin notifications | `notifications.ts` | ❌ | — | Scheduled on device; OK for V1 |
| `notifications[]`, read state | In-app notification inbox | ❌ | P3 | Optional inbox API; today not persisted in `partialize` |
| Overview alerts | `getStudioAlerts.ts` | ❌ | — | **Generated** from kiln/pieces/rhythm — no separate BE row |
| Push device token | Settings | 🟡 | — | `usePushTokenSync` + `syncPushTokenWithBackend` (#86 ✅) |

---

### Q · Premium & subscriptions

| Data | Location | BE today | Priority | Notes |
|------|----------|----------|----------|-------|
| `isPremium` | `useEntitlements()` → store | 🟡 webhook + server reads tier (`GetActiveTier`) | P2 | Optional `GET /users/me/entitlement` for FE-readable tier |
| RevenueCat customer | Device SDK | ✅ | — | |
| Photo / storage / export gates | `premiumGate.ts` | ✅ BE enforced | — | Photo+storage quotas (P2-9), glaze count (P2-5), export gated (P2-8) — all server-side now |

#### Premium tier — what the backend should store (and enforce)

**Important:** Premium is **not** a separate database for most features. Free and Premium users share the same tables and sync endpoints. Premium changes **quotas**, **upload acceptance**, and **optional add-ons** — not whether pieces/glazes/kilns exist on the server.

**Product split** (from `FRONTEND.md` + `premiumGate.ts`):

| Capability | Free (on device) | Free (on BE) | Premium (on BE) |
|------------|------------------|--------------|-----------------|
| Pieces, kiln, firings (text/structure) | Unlimited | Synced (minimal payload today) | Same — unlimited |
| Glaze atlas recipes + tests (text) | Unlimited local | Synced | Same — unlimited |
| **Cloud photos per piece** | Unlimited local | **1 backed up** | **Unlimited** assets |
| **Total cloud media** | — | **500 MB cap** (`FREE_CLOUD_STORAGE_MB`) | **Unlimited** |
| Glazes in cloud sync | — | **15** (product target #65) | Unlimited |
| Community posts + images | ✅ | ✅ | ✅ (not tier-gated) |
| Avatar / cover | ✅ | ✅ (counts toward 500 MB) | ✅ |
| Analytics dashboards | Preview (FE gate) | ❌ not stored | ❌ not stored — still FE-computed |
| Data export | Blocked (FE gate) | ❌ no export archive | ✅ **`GET /users/me/export`** (premium-gated, P2-8) — glaze + piece-glaze-link archive |
| Studio Rhythm sprint / freeform | Blocked (FE gate) | ❌ today | **Same `preferences` blob** — tier checked on read/write |
| Kilnkin companion swap | Onboarding pick only | ❌ today | **Same `preferences.kilnkin`** — swap allowed if premium |
| Missions | 3/week cap (#15, not built) | Optional counter | Unlimited — server tracks weekly count for free |
| Yearly wrap | Coming soon | ❌ | **P3:** generated report snapshot |

**What should be saved on BE only for Premium users** (quota-enforced uploads — free users must not persist these rows):

| Resource | Endpoint / table | Free limit | Premium | Enforcement |
|----------|------------------|------------|---------|-------------|
| Extra **piece photo** assets (cover + journal) | `POST …/pieces/{id}/assets` | 1 cloud-backed URI per piece | Unlimited | Reject 402/403 when `count >= 1` and not premium |
| **Glaze gallery** images (bucket, test-tile, finished, accident) | Glaze image upload / P1-10 | Within 500 MB + 15-glaze atlas cap | Unlimited | Reject when over cap or glaze count > 15 |
| **Profile / glaze / piece** media pushing user over **500 MB** | `POST /uploads`, asset uploads | Hard stop at cap | Allow | Sum `assets` bytes per user before accept |
| **Community post images** | `POST /uploads` → post | Not tier-gated today | Not tier-gated | Same 500 MB pool for free (product choice) |

**What is Premium-gated in the app but does NOT need premium-only BE storage:**

| Feature | Why no separate BE tier |
|---------|-------------------------|
| **Analytics** / kiln analytics | Computed from synced pieces/kilns/glazes — gate in FE (and optionally on a future `GET /analytics` route) |
| **Export** | V1 builds JSON from local + synced data on device; no server archive |
| **Full pricing** presets | Belongs in `preferences.pricing` for all users; hide advanced fields in FE when free |
| **Companion swap** | Single `kilnkin` field in preferences; server stores element + name for everyone, validates swap only if `entitlement = premium` |
| **Studio Rhythm** sprint/freeform | `preferences.studio_rhythm.type` — store for all; reject `type: sprint \| freeform` on PUT if free |
| **Unlimited missions** | Optional `mission_completions` counter per ISO week — same table, stricter limit column for free |

**BE work for premium (not “premium-only tables”):**

1. **Entitlement read** — ✅ server reads active tier internally via `subscriptions.GetActiveTier` and gates routes with `middleware.RequirePremium()` (used by `/users/me/export`). **No public `GET /users/me/entitlement` yet** — FE still reads `isPremium` from the device SDK; add the GET if FE needs server-authoritative tier.
2. **Quota checks on upload paths** — ✅ **done (P2-9)**: 500 MB cap + 1-photo-per-piece enforced on piece-asset, glaze-image, avatar, cover uploads (`internal/quota/cloud.go`).
3. **Glaze sync cap** — ✅ **done (P2-5)**: `POST /users/me/glazes/sync` rejects a free user past 15 non-deleted glazes (`enforceGlazeLimit`); `GET /users/me/glazes/usage` exposes count/limit/tier.
4. **Mission weekly cap** (when #15 ships) — `GET/POST /users/me/missions` or field on preferences with `completions_this_week` + reset cron.
5. **Yearly wrap (P3)** — `GET /users/me/wrap/{year}` generating or serving a cached report — premium-only route.

**Free users still need BE persistence for:** identity, privacy, pieces (text), glazes (recipes), kilns, firings, friends, posts, first cloud photo per piece, and preferences — see [Full app map](#full-app--what-should-be-saved-on-the-backend). Premium unlocks **volume of cloud media** and **access to gated preference modes**, not the existence of a server account.

---

### R · Discover & static catalog

| Data | Location | BE today | Priority | Notes |
|------|----------|----------|----------|-------|
| Discover recipes & inspirations | `library/discover/*.ts` bundled JSON | ✅ BE | P3 | P2-2 shipped — `GET /glazes/discover/recipes` + `/inspirations`; FE still bundled until wired |
| `devDiscoverGlazeIds` | Dev seed in Discover | ❌ | — | `__DEV__` only |

---

### I · Intentionally device-local (do not move to BE)

| Zustand key | Why |
|-------------|-----|
| `sessionToken`, `oryIdentityId`, `oryEmail` | SecureStore |
| `pendingSyncOps`, `pendingGlazeDeletions`, … | Sync queue ephemera |
| `backendUsers` cache | React Query / refetch |
| `seenCeremonies` | One-time celebration UX |
| `devDiscoverGlazeIds` | `__DEV__` only |
| `isPremium` | Read from RevenueCat SDK until entitlement GET exists |
| `lastSyncedAt`, `backendUserId` | Client sync metadata |
| `communityPostComposerPreset` | Transient navigation state |
| `communityFeedRevision` | In-memory bump counter |

---

### Recommended API work (whole app)

| Step | Work | Features unblocked |
|------|------|-------------------|
| 1 | **`GET` / `PUT /users/me/preferences`** — clay lists, stages, pricing, UI, kilnkin, notification prefs | App Customization, onboarding defaults |
| 2 | ~~**Wire profile + privacy**~~ — ✅ `PUT /users/me`, `PUT /users/me/privacy` wired (#91, #14) | Profile, Account, Privacy |
| 3 | **Extend pieces sync** — journal, metadata, pricing JSONB, `local_stage` | Pieces tab |
| 4 | **Firing `piece_ids`** + verify kiln log round-trip | Kiln tab |
| 5 | **Glaze verify** — images (P1-10), version chain (P1-8), tests (P1-9) | Library / Glaze |
| 6 | **Community mock removal** — challenges, gallery, Hall of Fame → live API only | Community |
| 7 | **`preferences.studio_rhythm`** or dedicated resource | Studio Rhythm, Overview missions |
| 8 | ~~**Push tokens (#86)**~~ ✅ — `usePushTokenSync`; notification prefs on user still P2 | Notifications |
| 9 | **`GET /users/me/entitlement`** | Premium gates, photo limits |
| 10 | **Studios member queue** (when product ready) | Studio owners, piece queue |
| 11 | **`GET /news`**, **`GET /discover`** | Community news, Discover catalog (P2+) |

**Target API surface (new or extended):**

| Method | Path | Holds |
|--------|------|-------|
| GET/PUT | `/users/me/preferences` | Sections **A**, **B**, **F** (rhythm), kiln checklist |
| PUT | `/users/me` | Identity (**H**) |
| PUT | `/users/me/privacy` | Community + analytics opt-in (**B**) |
| POST | `/users/me/pieces/sync` | Extended **C** |
| POST | `/users/me/glazes/sync` | Full **E** |
| PUT | `/users/me/firings/{id}` | `piece_ids`, results (**D**) |
| POST | `/users/me/push-tokens` | Device token (**P**) |
| GET | `/users/me/entitlement` | Premium tier (**Q**) |
| GET | `/users/me/posts` | Profile grid (**N**) — verify |
| GET | `/challenges`, `/hall-of-fame` | Community — replace mocks (**N**) |

**FE when APIs land:** `src/services/api.ts` or `preferences.ts`; hydrate in `useCurrentUser` / post-login bootstrap; debounced `PUT` from store subscribers. **Fix `partialize`** for `clayBodies`, `formingMethods`, `pieceFormOptions`, `defaultClayBodyId`, `defaultBisqueTemp`, `defaultGlazeTemp` until server is source of truth.

**Does not need BE (by design):** Analytics aggregates (**M**), overview alert **generation** (**L**), badge **definitions**, local notification **scheduling**, ceremony/hint flags, Discover bundled JSON until P2-2.

---

## Community challenge — target flow

```
Open → user joins track → submits piece (linked post)
Voting → gallery per track, one vote per user per track
Closed → server picks winners → Hall of Fame archive
```

Detailed API shapes and task IDs: **BACKEND-TASKS P0-8 through P1-6**.

FE mock modules to replace: `src/screens/community/mock/`.

---

## Profile & share — target flow

```
Profile → Share → potterynook.app/user/{id}
Recipient (app) → GET /users/:userId/profile → grid + Add Clay Friend
Recipient (no app, V2) → web landing page
```

~~Blocked by missing public profile endpoint and broken friends list.~~ Both shipped in Sprint A (P0-1, P0-2) — in-app share grid + Add Clay Friend now have a working API. **OG web preview (P1-17) shipped** — `GET /user/:userId` serves server-rendered HTML with OG/Twitter tags for rich chat unfurls. **Universal Links (P2-1) shipped** — `/.well-known/apple-app-site-association` + `/assetlinks.json` served (set `APPLE_APP_ID` / `ANDROID_SHA256_FINGERPRINT` env before tap-to-open works). Remaining FE work: wire privacy toggles (#14); verify cold-start deep link in `app/user/[id].tsx`.

---

## Related FRONTEND tickets

Cross-reference by number in [`FRONTEND.md`](./FRONTEND.md):

| BE work | FE ticket # |
|---------|-------------|
| Account delete | #6 |
| Pieces / kiln API | #7, #10, #11 |
| Pieces full sync (journal, pricing, metadata) | — (see [Pieces completeness backlog](#pieces-feature--completeness-backlog)) |
| User preferences & studio setup (clay bodies, stages, pricing rules) | — (see [Full app map](#full-app--what-should-be-saved-on-the-backend)) |
| Community APIs | #16–22, #23–28 |
| Privacy sync | #14 |
| RevenueCat webhook | #57 |
| Friends 500 | #89 |
| Push tokens + challenge contract | #86 ✅, #87, #70 |
| Security | #79, #80 |

---

## Out of scope (V1 backend)

- Public studio search / invite codes (product study needed — see FRONTEND Key Decisions)
- Community events API (Events tab hidden for V1)
- Full material inventory / glaze lab calculations
- Comments on challenge entries
