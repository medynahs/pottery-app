# Backend — Overview

**Purpose:** How the Pottery Life mobile app talks to the server — patterns, deployment status, and where to find detailed work.

**Last updated:** June 25, 2026  
**Task backlog:** [`BACKEND-TASKS.md`](./BACKEND-TASKS.md) (prioritized P0 → P2)  
**Frontend companion:** [`FRONTEND.md`](./FRONTEND.md)

---

## ⚠️ Backend status — all P0 blockers shipped (Jun 25)

The API repo completed **every P0** (friends, public profile, privacy, pieces/firings/glaze sync, posts/feed/media, reactions, challenges, voting, Hall of Fame) plus **account delete**. Remaining backend work is P1/P2 (RevenueCat webhook, validation/rate-limit, upload hardening, editable identity `PUT /users/me`, OG share page, push tokens). Status below is **🔶 backend-done** until each is re-verified in-app.

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
| Account delete | 🔶 | `DELETE /users/me` → soft-delete + ~1wk grace + `POST /users/me/revive`; cascade via FK. **403 `account_deleted`** during grace |
| Current user profile | 🔶 | `GET /users/me`, avatar/cover upload — avatar/cover verified end-to-end (P1-2b ✅ Sprint A) |
| Profile identity edit | ❌ | `PUT /users/me` — name, studio, location, bio; FE saves locally today → [P1-2](./BACKEND-TASKS.md) (Sprint E, not started) |
| Privacy settings | 🔶 | `PUT /users/me/privacy` shipped (P1-3 ✅ Sprint A) + enforced on public profile (404 when private); FE toggles still local only |
| Public profile | 🔶 | `GET /users/:userId/profile` shipped (P0-2 ✅ Sprint A); 404 when private/unknown |
| Friends | 🔶 | **500 fixed** (`cover_url` added to SELECT, P0-1 ✅ Sprint A) |
| Friend requests | 🔶 | FE wired |
| Studios | 🔶 | Owned/member-of, invites, join requests |

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
| Glaze list / sync push | 🔶 | Batch metadata now persisted server-side (P0-11): `batch_id`, `date_mixed`, `status`, `best_clay_type`, `best_firing_temp_c`, `atmosphere`, `ingredients_text`. Version chain (P1-8) still TBD |
| Test tiles sync | 🔶 | Partial |
| Glaze image upload | 🔶 | Endpoint exists; round-trip TBD |
| Community recipe posts | ❌ | FE embeds HTML comment in caption today |
| Discover catalog | ❌ | Bundled static JSON in app |

### Community

| Area | Status | Notes |
|------|--------|-------|
| Feed + posts | 🔶 | Routes are `GET /users/me/feed`, `POST /users/me/posts`. Image posts work end-to-end via `post_assets` → `assets[]` with public URLs |
| Reactions | 🔶 | DB-unique `(post_id, user_id)`; count in feed payload (P0-7) |
| Polls | 🔶 | FE wired |
| Challenges (basic) | 🔶 | Join/submit/withdraw FE wired |
| Challenge (tracks + voting) | 🔶 | Shipped (P0-8/9): tracks, idempotent join, submit/withdraw, voting w/ revote + self-vote reject. **Replace FE mock store** |
| Hall of Fame | 🔶 | Winner-archive shipped (P1-6): `GET /hall-of-fame` cycles + `/hall-of-fame/winners/:id`. Deleted winners → `user_deleted: true` |
| News | ❌ | Not started (P1-7) |
| Image upload | 🔶 | **`POST /uploads` (server-side multipart)** → `{ asset_id, public_url }`. No presigned flow |

### Premium & ops

| Area | Status | Notes |
|------|--------|-------|
| RevenueCat webhook | 🔶 | Entitlement sync on server |
| Push tokens | ❌ | FE not sending tokens yet |
| Challenge deadline push | 🔶 | Server cron + Expo Push |
| Input validation / rate limits | 🔶 | P1-15 |
| Upload security | 🔶 | P1-16 |

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
3. **Gap (narrowed):** batch metadata now persists (P0-11); version chain (P1-8), images (P1-10) still TBD

### Kilns & firings

1. Local-first CRUD in `appStore`
2. `useKilnsSync`, `useFiringsSync` push/pull
3. **Gap (narrowed):** `peakTempC`, `holdTimeMinutes`, `photoUri` now round-trip (P0-4). `firedDate`/`statusOverride`/`pieceIds` mapping still to confirm on FE

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

~~Blocked by missing public profile endpoint and broken friends list.~~ Both shipped in Sprint A (P0-1, P0-2) — in-app share grid + Add Clay Friend now have a working API. Remaining FE work: wire privacy toggles (#14); OG web preview (P1-17) still pending for rich chat unfurls.

---

## Related FRONTEND tickets

Cross-reference by number in [`FRONTEND.md`](./FRONTEND.md):

| BE work | FE ticket # |
|---------|-------------|
| Account delete | #6 |
| Pieces / kiln API | #7, #10, #11 |
| Community APIs | #16–22, #23–28 |
| Privacy sync | #14 |
| RevenueCat webhook | #57 |
| Friends 500 | #89 |
| Push tokens + challenge contract | #86, #87, #70 |
| Security | #79, #80 |

---

## Out of scope (V1 backend)

- Public studio search / invite codes (product study needed — see FRONTEND Key Decisions)
- Community events API (Events tab hidden for V1)
- Full material inventory / glaze lab calculations
- Comments on challenge entries
