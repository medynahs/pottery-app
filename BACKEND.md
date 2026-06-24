# Backend — Overview

**Purpose:** How the Pottery Life mobile app talks to the server — patterns, deployment status, and where to find detailed work.

**Last updated:** June 24, 2026  
**Task backlog:** [`BACKEND-TASKS.md`](./BACKEND-TASKS.md) (prioritized P0 → P2)  
**Frontend companion:** [`FRONTEND.md`](./FRONTEND.md)

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
| Account delete | 🟡 | FE calls `DELETE /users/me`; cascade TBD |
| Current user profile | 🔶 | `GET /users/me`, avatar/cover upload — avatar/cover verified end-to-end (P1-2b ✅ Sprint A) |
| Profile identity edit | ❌ | `PUT /users/me` — name, studio, location, bio; FE saves locally today → [P1-2](./BACKEND-TASKS.md) |
| Privacy settings | 🔶 | `PUT /users/me/privacy` shipped (P1-3 ✅ Sprint A) + enforcement; FE toggles still local only |
| Public profile | 🔶 | `GET /users/:userId/profile` shipped (P0-2 ✅ Sprint A) |
| Friends | 🔶 | `cover_url` fix shipped — list returns 200 (P0-1 ✅ Sprint A) |
| Friend requests | 🔶 | FE wired |
| Studios | 🔶 | Owned/member-of, invites, join requests |

### Pieces & kiln

| Area | Status | Notes |
|------|--------|-------|
| Pieces CRUD / sync | 🔶 | FE fully wired; offline sync active |
| Kilns CRUD | 🔶 | FE wired |
| Firings CRUD | 🔶 | FE wired; **log fields** (peak temp, hold, photo) not in API yet |
| Piece ↔ glaze link | ❌ | Local only until glaze P0-10 |

### Glaze library

| Area | Status | Notes |
|------|--------|-------|
| Glaze list / sync push | 🔶 | Many batch/version fields sent but may be ignored server-side |
| Test tiles sync | 🔶 | Partial |
| Glaze image upload | 🔶 | Endpoint exists; round-trip TBD |
| Community recipe posts | ❌ | FE embeds HTML comment in caption today |
| Discover catalog | ❌ | Bundled static JSON in app |

### Community

| Area | Status | Notes |
|------|--------|-------|
| Feed + posts | 🔶 | Text posts work; image upload partial on FE |
| Reactions | 🔶 | FE wired |
| Polls | 🔶 | FE wired |
| Challenges (basic) | 🔶 | Join/submit/withdraw FE wired |
| Challenge (tracks + voting) | ❌ | FE uses mock store — see BACKEND-TASKS P0-8/9 |
| Hall of Fame | ❌ | Needs winner-archive redesign (P1-6) |
| News | ❌ | Not started |
| Presigned upload | 🔶 | Required for photo posts |

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
4. **Gap:** `glazeId`, `glazeOutcome` not in payload — see BACKEND-TASKS P0-10

### Glazes

1. `POST /users/me/glazes/sync` batches glaze + test snapshots
2. Client refs link tests → glazes across devices
3. **Gap:** batch metadata, version chain, images may not persist server-side

### Kilns & firings

1. Local-first CRUD in `appStore`
2. `useKilnsSync`, `useFiringsSync` push/pull
3. **Gap:** firing log fields (`peakTempC`, `holdTimeMinutes`, `firedDate`, `photoUri`, `statusOverride`) local only

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

Public profile endpoint and friends list shipped in Sprint A (P0-2, P0-1). Remaining FE work: wire privacy toggles (#14); OG web preview (P1-17) for rich link unfurls.

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
