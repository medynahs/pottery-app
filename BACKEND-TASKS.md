# Backend Tasks — By Priority

**Purpose:** Single prioritized backlog for all API, sync, and server-side work. The mobile app repo tracks FE wiring here; deployment is verified separately.

**Last updated:** June 21, 2026  
**Companion docs:** [`BACKEND.md`](./BACKEND.md) (overview + API surface) · [`FRONTEND.md`](./FRONTEND.md) (FE tickets + roadmaps)

---

## Priority legend

| Priority | Meaning |
|----------|---------|
| **P0** | Broken or blocking shipped FE — fix first |
| **P1** | Required for V1 fidelity or cross-device data survival |
| **P2** | Phase 2, notifications, polish, nice-to-have |

## Recommended implementation order

1. **Profile P0** — Fix friends list 500; ship public profile endpoint
2. **Profile P1** — `PUT /users/me` for name, studio, location, bio (P1-2)
3. **Profile P1** — Open Graph web page for share link previews (WhatsApp / iMessage)
4. **Core sync P0** — Pieces, kilns, firings REST (if not deployed); friends `cover_url` migration
5. **Community P0** — Post/feed, reactions, presigned upload, challenge loop + voting contract
6. **Glaze P0** — Piece↔glaze sync + batch metadata persistence
7. **Auth & compliance P1** — Password recovery verification, account delete cascade, privacy sync
8. **Premium & security P1** — RevenueCat webhook, input validation, upload security
9. **Hall of Fame + glaze community P1** — Winner archive, structured recipe posts
10. **P2 batch** — Discover catalog API, mix logs, push notifications, analytics aggregates

---

## P0 — Blockers & critical path

### P0-1 · Profile — Friends list 500 (`cover_url`)

**Observed:** `GET /users/me/friends` returns 500 — **cannot find field cover_url**.

**Impact:** Clay Friends tab, profile friend count, friend-status on public profiles.

**Fix (pick one):**
1. **Preferred:** Migrate nullable `cover_url` on `users`; persist from cover upload.
2. **Interim:** Remove `cover_url` from friends-list SELECT until migration ships.

**Acceptance:** `200` JSON array; objects match FE `BackendUser` in `src/services/friends.ts`.

**FE:** `src/services/friends.ts`, `ProfileHeader.tsx`, `useClayFriendStatus.ts`

---

### P0-2 · Profile — Public profile (`GET /users/:userId/profile`)

**FE shipped.** Share copies a single web URL: `https://potterynook.app/user/{id}` (see `profileLinks.ts`, `profileShareActions.ts`). In-app route: `app/user/[id].tsx`. Rich chat previews require **P1-17** (OG web page).

```
GET /users/:userId/profile
```

| | |
|---|---|
| Auth | Optional (`X-Session-Token` if signed in) |
| 200 | Public profile JSON |
| 404 | User not found or profile not private |

**Response fields:** `id`, `name`, `avatar_url`, `cover_url?`, `studio_name?`, `location?`, `bio?`, `post_count`, `posts[]` (newest first, ~50 max).

Posts accept flat `{ id, image_url, created_at, reaction_count }` or nested `assets[].url` — FE normalizer in `src/services/publicProfile.ts`.

**Logic:** Load user → check `profile_public` → load community posts with images → no email/ory_id/private piece data.

**Acceptance:** Share link opens read-only grid; Add Clay Friend works; private user → 404.

**Blocks:** P1-17 (OG preview page reuses this data).

---

### P0-3 · Core — Pieces REST API

`GET/POST/PUT/DELETE /pieces` (or `/users/me/pieces/sync`). Authenticated. All fields from `src/types/pieces.ts`.

**FE wired:** `src/services/pieces.ts`, `useOfflineSync`

---

### P0-4 · Core — Kiln & firings REST API

`GET/POST/PUT/DELETE /kilns`, `/firings`. Include log fields: `firedDate`, `peakTempC`, `holdTimeMinutes`, `photoUri`, `statusOverride`.

**FE wired:** `src/services/kilns.ts`, `src/services/firings.ts` — **log fields not round-tripped yet**

---

### P0-5 · Auth — Account deletion

`DELETE /users/me` — soft/hard delete per privacy policy, 204, cascade pieces/firings/glazes/friends.

**FE wired:** `AccountSettingsScreen`

---

### P0-6 · Community — Post + feed + media

| Task | Endpoint | Notes |
|------|----------|-------|
| Create post | `POST /posts` | imageUrl, caption, pieceId?, tags[] |
| Feed | `GET /feed` | Paginated, 20/page, recency sort |
| Delete own post | `DELETE /posts/:id` | |
| Presigned upload | `POST /uploads/presigned` | jpeg/png/webp, 10MB, UUID filenames |

**FE wired:** feed, reactions, text posts — **image upload flow incomplete on FE (#24)**

---

### P0-7 · Community — Reactions

`POST/DELETE /posts/:id/reactions`. Duplicate prevented at DB. Count in feed response.

**FE wired**

---

### P0-8 · Community — Challenge lifecycle

| Task | Notes |
|------|-------|
| `GET /challenges` | `status` (`open`\|`voting`\|`closed`), dates, tracks, hero, join contract |
| Join contract | `is_joined`, `track_id`, `entry_id`, `has_submitted`, `submission_deadline` (#87) |
| `POST /challenges/:id/entries` | Body `{ track_id }`; idempotent join |
| Submit entry | `{ post_id, note?, piece_id? }` → sets `submitted_at` |
| `DELETE …/entries/:entryId` | Withdraw |
| `GET /challenges/:id/entries` | Paginated gallery; filter `?track_id=`; sort by votes |
| Phase transitions | Cron: open→voting→closed at configured dates |

**FE:** Mock preview in `src/screens/community/mock/` — replace with real API.

---

### P0-9 · Community — Voting

| Task | Notes |
|------|-------|
| `POST /challenges/:id/votes` | `{ entry_id }`; one vote per user per track |
| `my_vote_by_track` | On gallery or challenge detail |
| Denormalized `vote_count` | Transactional on vote change |

**Acceptance:** Vote in gallery; revote in same track updates count; self-vote rejected.

---

### P0-10 · Glaze — Piece ↔ glaze link sync

Piece stores `glazeId` + `glazeOutcome` locally — **not in sync payload today**.

| Task | Notes |
|------|-------|
| Add `glaze_id`, `glaze_outcome` to piece sync + DB | Enum: success, crawling, underfired, crack |
| Return on GET/sync | FE mappers in `src/services/pieces.ts` |
| Validate glaze belongs to user | Null or reject orphaned refs |
| Cascade on glaze delete | Block or null refs |

**Acceptance:** Link glaze on device A → sign in on B → same link and outcome.

---

### P0-11 · Glaze — Batch metadata persistence

FE sends batch fields in `GlazeSyncItem`; server may ignore.

Persist: `batch_id`, `date_mixed`, `status`, `best_clay_type`, `best_firing_temp_c`, `atmosphere`, `ingredients_text`.

**Acceptance:** Create glaze with batch ID on A → pull on B → batch chip matches.

---

## P1 — V1 fidelity

### P1-1 · Auth — Password recovery (Ory Kratos)

Recovery flow on submit. Email sent. Session invalidated on success.

**FE wired:** `oryRecoveryStart` / `oryRecoverySubmitCode` — Ory deployment not verified in this repo.

---

### P1-2 · Profile — Editable identity (name, studio, location, bio)

**FE today:** `EditProfileModal` saves `name`, `studioName`, `location`, and `bio` to **local Zustand only**. Avatar/cover upload calls BE; text fields do not. `useCurrentUser` pulls `name` from `GET /users/me` but not studio/location/bio.

**Goal:** User edits profile text fields → persisted on server → survives reinstall / second device → shown on public profile (P0-2).

#### Database

| Column | Type | Notes |
|--------|------|-------|
| `name` | string, nullable | May exist; ensure writable (not Ory-only) |
| `studio_name` | string, nullable | Display studio label — not the Studios membership entity |
| `location` | string, nullable | Free text, e.g. `"Portland, OR"` |
| `bio` | text, nullable | Max ~500 chars recommended |

#### `PUT /users/me` (or `PATCH /users/me`)

Authenticated. Partial update — only sent fields are changed.

**Request body (all optional):**

```json
{
  "name": "Jane Potter",
  "studio_name": "Sunfire Studio",
  "location": "Portland, OR",
  "bio": "Wood-fired tableware"
}
```

**Validation:**

| Field | Rules |
|-------|-------|
| `name` | Trim; 1–80 chars if present; reject empty string (omit field to leave unchanged) |
| `studio_name` | Trim; max 120 chars; empty string → null |
| `location` | Trim; max 120 chars; empty string → null |
| `bio` | Trim; max 500 chars; empty string → null |

**Response:** `200` — full updated profile (same shape as `GET /users/me`).

**Acceptance:**

- Edit all four fields in app → `GET /users/me` returns updated values after refetch
- Sign in on second device → same name, studio, location, bio
- Public profile (P0-2) shows `name`, `studio_name`, `location`, `bio` from server
- Community feed author name reflects updated `name`

#### `GET /users/me` — extend response

Add to existing `BackendProfile` contract in `src/services/api.ts`:

```json
{
  "id": "…",
  "email": "…",
  "name": "Jane Potter",
  "studio_name": "Sunfire Studio",
  "location": "Portland, OR",
  "bio": "Wood-fired tableware",
  "avatar_url": "…",
  "cover_url": "…",
  "role": "…",
  "created_at": "…",
  "updated_at": "…"
}
```

**FE follow-up (separate task):** `updateProfile()` in `api.ts`, call from `EditProfileModal.handleSave`, map snake_case ↔ camelCase in `useCurrentUser`.

| # | Task | Notes |
|---|------|-------|
| BE-P1.2.1 | Migration: `studio_name`, `location`, `bio` on `users` | Nullable text columns |
| BE-P1.2.2 | `PUT /users/me` — partial profile update | See contract above |
| BE-P1.2.3 | Return all identity fields on `GET /users/me` | |
| BE-P1.2.4 | Return `studio_name`, `location`, `bio` on public profile | P0-2 |
| BE-P1.2.5 | Input validation + length limits | Reject oversize payloads |

---

### P1-2b · Profile — Media (avatar + cover)

| Task | Notes |
|------|-------|
| `cover_url` column + migration | Unblocks P0-1 |
| `GET /users/me` returns `cover_url` | FE: `useCurrentUser` |
| `POST /users/me/avatar` | FE: `uploadAvatar()` |
| `POST /users/me/cover` | FE: `uploadCover()` |
| Cascade delete avatar/cover assets on account delete | |

---

### P1-3 · Profile — Privacy sync

`PUT /users/me/privacy` — `profile_public`, `pieces_public`, analytics opt-in.

Enforce on `GET /users/:userId/profile` → 404 when private.

**FE gap:** toggles local only (#14 in FRONTEND.md)

---

### P1-4 · Profile — Studios API

`GET /users/me/studios/owned`, `/member-of`, invites + join requests.

**FE wired:** `src/services/studios.ts`, `StudiosTab`

---

### P1-5 · Community — Polls

`GET /polls`, `POST /polls/:id/vote` (one per user), `GET /polls/:id/results`.

**FE wired**

---

### P1-6 · Community — Hall of Fame (winner archive)

Redesign `GET /hall-of-fame` → `{ cycles: [{ challenge_id, title, winners[] }] }`.

Winner row: track, artist, piece, image, vote_count, `won_at`.

Job on `voting → closed`: max votes per track; tie-break earliest submit.

`GET /hall-of-fame/winners/:id` for deep links.

**FE gap:** tab uses challenge leaderboard; mock cycles in community mock store.

---

### P1-7 · Community — Admin news

`GET /news` — curated pottery news (title, source, url, imageUrl, publishedAt).

**FE:** not started (#29)

---

### P1-8 · Glaze — Version chain

Persist `version_number`, `root_glaze_id`, `parent_glaze_id`. Query all versions for root.

---

### P1-9 · Glaze — Test tiles sync

Confirm `POST /users/me/glazes/sync` accepts test snapshots. Persist clay, cone, kiln, application, defects, `result_rating`, photo ref. Link via `glaze_client_ref`.

---

### P1-10 · Glaze — Images

Gallery types: `bucket`, `test-tile`, `finished-piece`, `accident`. Idempotent upload/delete. Signed URLs in list payload.

---

### P1-11 · Glaze — Community recipe posts

| Task | Notes |
|------|-------|
| `post_type` enum on posts | `text` \| `glaze_recipe` |
| `glaze_recipe` JSON column | Mirrors `CommunityGlazeRecipePayload` |
| Accept on POST | Strip HTML comment block in content when structured payload present |
| Return on feed | FE stops parsing comment blocks |

---

### P1-12 · Glaze — Save provenance

`source_post_id`, `source_user_id` on glaze records. Idempotent `(user_id, source_post_id)`.

Optional `source_discover_recipe_id` for Discover saves.

---

### P1-13 · Premium — RevenueCat webhook

`POST /webhooks/revenuecat` — INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION. Updates `users.isPremium`, `premiumExpiresAt`.

---

### P1-14 · Notifications — Push token storage

`POST /users/me/push-tokens` — multiple devices, platform, dedupe, rotation.

**FE gap:** #86 in FRONTEND.md

---

### P1-15 · Security — Validation & rate limiting

Zod (or equivalent) on all endpoints. Body size limits on POST. Auth endpoints rate-limited (~10/min/IP).

---

### P1-16 · Security — Media upload hardening

Authenticated only; type whitelist; 10MB server-side; UUID filenames; no public-write bucket.

---

### P1-17 · Profile — Share link preview (Open Graph web page)

**Why:** WhatsApp, iMessage, Slack, etc. only show image + title cards when the shared **https** URL returns Open Graph meta tags. FE already shares one clean link; without this page, shares stay plain text.

**Route:** `GET https://potterynook.app/user/:userId`

| | |
|---|---|
| Depends on | P0-2 (`GET /users/:userId/profile` logic) |
| Auth | None (public HTML for crawlers + humans) |
| 404 | Same rules as API — private or missing user |
| Render | **Server-side HTML** (crawler must see tags without JS) |

**Required `<head>` meta (minimum):**

| Tag | Source |
|-----|--------|
| `og:title` | `{name} · Pottery Life` |
| `og:description` | `bio` or `Studio: {studio_name}` or fallback tagline |
| `og:image` | Absolute HTTPS — `cover_url` → else `avatar_url` → else newest post `image_url` → app logo |
| `og:url` | Canonical `https://potterynook.app/user/{id}` |
| `og:type` | `profile` |
| `og:site_name` | `Pottery Life` |
| `twitter:card` | `summary_large_image` |
| `twitter:title` / `twitter:description` / `twitter:image` | Mirror OG values |

**Image rules (WhatsApp / Facebook crawler):**

- Absolute `https://` URL (signed CDN URLs OK if stable for ≥24h or regenerate on cache bust)
- Min ~200×200; prefer 1200×630 crop for large card
- JPEG/PNG; avoid redirects to auth-gated URLs

**Page body (human visitors):**

- Avatar, name, studio, bio, 3×3 photo grid preview (same posts as API)
- Primary CTA: **Open in Pottery Life** → deep link `potterynook://user/{id}` (until P2-1 universal links)
- Secondary: App Store + Play Store badges for users without the app

**Caching / ops:**

- `Cache-Control` short TTL OK (e.g. 5–15 min) or invalidate on profile/post update
- Validate with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) after deploy
- User-agent: allow `facebookexternalhit`, `WhatsApp`, `Twitterbot`, `Slackbot`

**Acceptance:** Paste `https://potterynook.app/user/{id}` in WhatsApp → unfurls card with name + image; tap opens web page with grid + store CTA.

**FE:** No app change required once deployed. Optional env override: `EXPO_PUBLIC_PROFILE_WEB_URL`.

---

## P2 — Phase 2 & polish

### P2-1 · Profile — Universal Links / App Links

**Depends on:** P1-17 (same URL `https://potterynook.app/user/:userId`).

When the app is installed, tapping the shared link should open `/user/[id]` in-app instead of Safari/Chrome.

| Platform | Deliverable |
|----------|-------------|
| iOS | `apple-app-site-association` at `https://potterynook.app/.well-known/apple-app-site-association` — paths `/user/*`, app ID `TEAMID.com.ariane.potterylife` |
| Android | `assetlinks.json` at `https://potterynook.app/.well-known/assetlinks.json` — package `com.ariane.potterylife`, SHA-256 cert fingerprint |
| Expo | `ios.associatedDomains: ["applinks:potterynook.app"]`; Android `intentFilters` with `autoVerify` for `https://potterynook.app/user` |

**Acceptance:** Shared link on device with app installed → opens `PublicUserProfileScreen`; without app → P1-17 web page + store CTAs.

**FE follow-up:** Verify `app/user/[id].tsx` handles cold-start deep link; no `potterynook://` in share payload (already removed).

---

### P2-2 · Glaze — Discover catalog API

`GET /glazes/discover/recipes`, `/inspirations` — versioned catalog replacing bundled static data. CDN preview URLs. Admin publish endpoint optional.

---

### P2-3 · Glaze — Mix logs (when FE ships)

`glaze_mix_logs` table + sync: `glaze_id`, `mixed_at`, `target_batch_g`, `ingredient_snapshot_json`, `notes`. Optional per-material weigh rows.

---

### P2-4 · Glaze — Batch scaler sync (optional)

`default_grams_per_piece`, `default_waste_percent` on glaze records.

---

### P2-5 · Glaze — Analytics & limits

Server-side glaze count for free-tier enforcement. Aggregate glaze usage endpoint optional.

---

### P2-6 · Community — Notifications

Push 48h before submission deadline (#70). Voting opens. Winner celebration optional.

---

### P2-7 · Community — Moderation

Rate limit votes. Report/disqualify entry endpoints.

---

### P2-8 · Account lifecycle

`DELETE /users/me` cascades glazes, tests, images. Premium export includes glazes + piece glaze links.

---

## API surface quick reference

| Method | Path | Priority | FE client |
|--------|------|----------|-----------|
| DELETE | `/users/me` | P0-5 | Account settings |
| GET | `/users/me` | P1-2 | `fetchMe()` — extend with studio/location/bio |
| PUT | `/users/me` | **P1-2 missing** | Not wired — `EditProfileModal` local only |
| POST | `/users/me/cover` | P1-2b | `uploadCover()` |
| POST | `/users/me/avatar` | P1-2b | `uploadAvatar()` |
| PUT | `/users/me/privacy` | P1-3 | Not wired |
| GET | `/users/me/friends` | **P0-1 bug** | `apiListFriends()` |
| POST | `/users/me/friends/requests` | P1 | `apiSendFriendRequest()` |
| GET | `/users/:userId/profile` | **P0-2 missing** | `apiGetPublicProfile()` |
| GET | `https://potterynook.app/user/:id` | **P1-17 missing** | Share / OG preview (web, not JSON API) |
| GET/POST | `/pieces` or sync | P0-3 | `src/services/pieces.ts` |
| GET/POST | `/kilns`, `/firings` | P0-4 | `src/services/kilns.ts` |
| GET | `/feed` | P0-6 | Community feed |
| POST | `/posts` | P0-6 | Post create |
| POST | `/uploads/presigned` | P0-6 | Image upload |
| POST/DELETE | `/posts/:id/reactions` | P0-7 | Reactions |
| GET | `/challenges` | P0-8 | Challenge tab |
| POST | `/challenges/:id/entries` | P0-8 | Join/submit |
| POST | `/challenges/:id/votes` | P0-9 | Gallery voting |
| GET | `/hall-of-fame` | P1-6 | Hall of Fame tab |
| GET/POST | `/polls` | P1-5 | Poll voting |
| GET | `/news` | P1-7 | News cards |
| POST | `/webhooks/revenuecat` | P1-13 | — |
| POST | `/users/me/push-tokens` | P1-14 | Not wired |
| GET/POST | `/users/me/glazes/sync` | P0-10/11 | `src/services/glazes.ts` |

---

## FE file map (integration)

| Domain | Key paths |
|--------|-----------|
| Profile / public | `EditProfileModal.tsx`, `src/services/api.ts`, `useCurrentUser.ts`, `publicProfile.ts`, `PublicUserProfileScreen.tsx`, `profileLinks.ts` |
| Friends / studios | `src/services/friends.ts`, `src/services/studios.ts` |
| Pieces sync | `src/services/pieces.ts`, `usePiecesSync` |
| Kiln sync | `src/services/kilns.ts`, `useKilnsSync`, `useFiringsSync` |
| Glaze sync | `src/services/glazes.ts`, `useGlazesSync` |
| Community | `src/services/community.ts`, `src/screens/community/mock/` (to remove) |
