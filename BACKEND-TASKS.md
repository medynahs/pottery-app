# Backend Tasks — By Priority

**Purpose:** Single prioritized backlog for all API, sync, and server-side work. The mobile app repo tracks FE wiring here; deployment is verified separately.

**Last updated:** June 24, 2026  
**Companion docs:** [`BACKEND.md`](./BACKEND.md) (overview + API surface) · [`FRONTEND.md`](./FRONTEND.md) (FE tickets + roadmaps)

---

## Release readiness — TestFlight vs App Store

Use this to decide what must ship before internal beta vs public release. **TestFlight** = testers can use the core studio app with known gaps. **App Store** = marketed promises (backup, community, share, premium) must work and review-risk items must be closed.

### TestFlight — hard blockers

Fix before sending builds to testers.

| Item | Why it blocks beta | BE task | FE task |
|------|-------------------|---------|---------|
| Auth login / register / session restore | App unusable without account | ✅ Ory live — Google + email sign up/in verified on device | — |
| Core tab crashes (Overview, Pieces, Kiln, Glaze Atlas) | Instant uninstall | — | Stability pass |
| Production EAS build + OTA channel | Can't distribute | Deploy pipeline | `eas update` verified |
| Account delete call doesn't hard-crash | Apple expects deletion path even in beta | P0-5 (cascade can be incomplete if 204 returned) | #5 wired |
| Graceful API failure | Broken endpoints shouldn't white-screen tabs | P0-1 friends 500 | #89 shows 0 friends on failure |

**Not TestFlight blockers (release builds):** `reopenGeneralOnboarding()` in `app/index.tsx` runs only under `__DEV__` — production/TestFlight builds are unaffected (#1 in FRONTEND.md).

### TestFlight — should fix (high tester pain)

Ship soon after first beta if the feature is visible in the UI.

| Item | User impact | BE | FE |
|------|-------------|----|----|
| Pieces / kiln / glaze basic sync | Reinstall or second device loses studio data | P0-3, P0-4 (basic fields) | Wired |
| Friends list 500 | Clay Friends always empty | **P0-1** | — |
| Profile text fields (name, studio, location, bio) | Edits lost on reinstall | **P1-2** | #91 wire `PUT /users/me` |
| Image post upload | Community feels broken | P0-6 presigned | #24 upload flow |
| Firing log fields | Kiln journal incomplete cross-device | **P0-4** log fields | Kiln tab phase 7 |
| Piece ↔ glaze link | Glaze outcomes lost on new device | **P0-10** | — |
| Glaze batch metadata | Batch chips wrong on second device | **P0-11** | — |

### App Store — hard blockers

Do not submit until these pass. App Review or marketing accuracy will fail otherwise.

| Item | Why it blocks public release | BE | FE |
|------|------------------------------|----|----|
| Account deletion end-to-end | Required by Apple; must cascade user data | **P0-5** + P2-8 | #5 |
| Privacy policy URL live | App Store Connect + in-app link | — | #42 |
| Password recovery | Expected for email/password accounts | ✅ **P1-1** verified (Google + email) | #4 |
| Public profile API | Share button copies `potterynook.app/user/{id}` — must resolve | **P0-2** | Route exists |
| Privacy toggles enforced server-side | `profile_public` must gate public profile (404 when private) | **P1-3** | #14 |
| Real community OR hide mock UI | V1 decision: real UGC backend; mock gallery/voting is misleading | **P0-8, P0-9, P1-6** | Remove `src/screens/community/mock/` |
| Cross-device core sync | Auth landing promises "Cloud backup" / "Sync across devices" | P0-3, P0-4, P0-10, P0-11 | Wired |
| Premium purchase + entitlement | IAP must unlock paid features reliably | **P1-13** webhook | #61–64 gates |
| Profile identity on server | Name/studio/bio on shared public profile | **P1-2** | #91 |
| Friends list + friend requests | Social features advertised on auth gate | **P0-1**, friend APIs | — |

### App Store — should fix (polish / conversion)

| Item | Why | BE | FE |
|------|-----|----|----|
| OG share preview page | WhatsApp/iMessage shares look broken without unfurl | **P1-17** | Optional env only |
| Universal Links | Tap shared link opens app when installed | P2-1 | Deep link verify |
| Glaze version chain + images + test tiles | Full atlas fidelity across devices | P1-8, P1-9, P1-10 | — |
| Structured glaze recipe posts | Feed stops parsing HTML comment blocks | P1-11 | — |
| Push token storage + challenge deadline push | Notification permission with no delivery | P1-14, P2-6 | #86 |
| RevenueCat webhook + server glaze count | Free-tier enforcement can't rely on client only | P1-13, P2-5 | #65 |
| Input validation + upload hardening | Production security baseline | P1-15, P1-16 | — |
| PostHog / no PII in logs | Ops + compliance | — | #47–48, #78 |

### App Store — explicitly deferrable (V1.1+)

Safe to ship V1 without blocking review if not prominently marketed.

| Item | Notes |
|------|-------|
| Discover catalog API (P2-2) | Bundled static recipes in `src/screens/library/discover/` |
| Mix logs / glaze stack / unload review (P2-3, FE roadmap) | Studio journal depth, not V1 promise |
| Community news (P1-7) | Not started (#29) |
| Events / Drops tab | Placeholder UI only (`DropsTab.tsx`) |
| Role-based kiln default view (#38–39) | Polish |
| Missions cap (#15), telemetry (#47–48), Jest/Maestro (#71–76) | Quality, not review gates |
| Challenge moderation (P2-7) | Post-launch ops |

### Release gate summary

```
TestFlight ready  → auth works · tabs stable · prod build · delete doesn't crash · API failures degrade gracefully
App Store ready     → everything above + sync survives reinstall + public profile/share + privacy enforced
                    + real challenge/voting/HoF OR mock removed + premium IAP + password reset + privacy policy
```

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

### P1-1 · Auth — Password recovery (Ory Kratos) — ✅ Verified

Recovery flow on submit. Email sent. Session invalidated on success.

**Status (Jun 24):** Verified end-to-end on device for both Google and email/password accounts — request → emailed code → new password → signed in. Runs on Ory **Recovery V2**

**FE:** `oryRecoveryStart` / `oryRecoverySubmitCode` in `src/services/auth.ts`.

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

## FE mock & unsynced data inventory

Single map of **what the app collects or displays today** vs **what the backend must persist** for cross-device survival and for replacing mock UI. FE clients often exist; gaps are persistence, round-trip, or mock replacement.

### Legend

| Status | Meaning |
|--------|---------|
| **Synced** | FE pushes/pulls; verify deployment |
| **Partial** | FE sends subset or BE may ignore fields |
| **Local only** | Zustand / AsyncStorage only — no server write |
| **Mock** | Hardcoded or `src/screens/community/mock/` — not real API data |
| **Static** | Bundled JSON in app — no server |
| **FE gap** | BE may exist; FE not wired to save/load |

---

### Profile & identity

| Data | FE location | Status | BE task | Notes |
|------|-------------|--------|---------|-------|
| `name` | `EditProfileModal`, `useCurrentUser` | **Partial** | P1-2 | `GET /users/me` may return name; **save is Zustand only** — no `PUT /users/me` |
| `studio_name`, `location`, `bio` | `EditProfileModal`, `appStore.user` | **Local only** | P1-2 | Not on `GET /users/me` response today |
| `avatar_url` | `uploadAvatar()` | **Synced** | P1-2b | Works when BE deployed |
| `cover_url` | `uploadCover()` | **Partial** | P1-2b, **P0-1** | Upload may work; **friends list 500** if column missing |
| `profile_public`, `pieces_public` | `PrivacySettingsScreen`, `privacyPrefs` | **Local only** | P1-3 | Toggles persist locally only (#14) |
| `analyticsEnabled`, `personalizedSuggestions` | `PrivacySettingsScreen` | **Local only** | P1-3 (optional) | Not in BE contract yet |
| Public profile grid (posts, counts) | `PublicUserProfileScreen`, share URLs | **Mock/ blocked** | **P0-2** | Route shipped; API missing → share link empty |
| OG / web preview | Share to WhatsApp/iMessage | **Missing** | P1-17 | Plain-text shares until HTML page ships |
| Clay friends list | `friends.ts`, `ProfileHeader` | **Broken** | **P0-1** | 500 on `GET /users/me/friends` |
| Friend requests | `friends.ts` | **FE wired** | — | Blocked by friends list / public profile |
| Studios (owned, member-of, invites) | `studios.ts`, `StudiosTab` | **FE wired** | P1-4 | Deployment not verified from mobile repo |

---

### Pieces

| Data | FE location | Status | BE task | Notes |
|------|-------------|--------|---------|-------|
| `name`, `status` (stage), `description`, tombstone | `usePiecesSync` → `PieceSyncSnapshot` | **Synced** | P0-3 | Only fields in sync payload today |
| Journal / timeline entries | `Piece.timeline` | **Local only** | P0-3 extend | Rich journal not in `PieceSyncSnapshot` |
| Clay, dimensions, weight, forming method, pricing, costs | `src/types/pieces.ts` | **Local only** | P0-3 extend | Large local model; API sync is minimal |
| `photo` / piece images | Local + assets API types | **Partial** | P0-3 | `BackendPieceAsset` exists; not in sync snapshot |
| `glazeId`, `glazeOutcome` | `PieceGlazeLinkSection`, piece form | **Local only** | **P0-10** | Single link + outcome enum on piece |
| `status` (sold/gifted/cracked etc.) | Piece detail | **Local only** | P0-3 extend | Separate from stage; not synced |

**Sync payload today** (`pieceToSnapshot` in `usePiecesSync.ts`): `client_ref`, `name`, `status`, `description?`, `deleted?`.

---

### Kiln & firings

| Data | FE location | Status | BE task | Notes |
|------|-------------|--------|---------|-------|
| Kiln profile (name, type, cone, shelves, pricing, delays, max temp) | `useKilnsSync`, `kilns.ts` | **Synced** | P0-4 | Basic kiln fields round-trip |
| Firing session (name, type, cone, state, dates, notes) | `useFiringsSync`, `firings.ts` | **Partial** | P0-4 | Created/updated on BE |
| `firedDate`, `peakTempC`, `holdTimeMinutes` | Log Firing modal, `FiringDetailModal` | **Local only** | **P0-4** | `useFiringsSync` preserves local on merge, never sends |
| `photoUri`, `statusOverride`, `logSource` | Kiln history / log firing | **Local only** | **P0-4** | Same — stripped on pull |
| `pieceIds` on firing | Firing detail, piece assignment | **Local only** | P0-4 extend | Not in `BackendFiring` |
| `result`, `resultNotes` | Firing completion | **Local only** | P0-4 extend | |

---

### Glaze library

| Data | FE location | Status | BE task | Notes |
|------|-------------|--------|---------|-------|
| Core glaze fields (name, finish, cone, ingredients, tags, collections) | `useGlazesSync`, `GlazeSyncItem` | **Synced** | P0-3 glazes path | Via `POST /users/me/glazes/sync` |
| Batch metadata: `batchId`, `dateMixed`, `status`, `bestClayType`, `bestFiringTempC`, `atmosphere`, `ingredientsText` | Glaze batch UI | **Partial** | **P0-11** | Sent in sync item; **server may ignore** |
| Version chain: `versionNumber`, `rootGlazeId`, `parentGlazeId` | `glazeVersionUtils.ts` | **Partial** | P1-8 | Sent; may not persist |
| Discover save provenance: `discoverSourceRecipeId`, `discoverSavedAt` | Save from Discover | **Partial** | P1-12 | Client fields; server may ignore |
| Test tiles (clay, cone, defects, rating, photo) | Atlas test logging | **Partial** | P1-9 | In sync payload; confirm BE persistence |
| Glaze gallery images (bucket, test-tile, finished-piece, accident) | Glaze detail | **Partial** | P1-10 | **Not** in sync snapshot — separate upload endpoints |
| `default_grams_per_piece`, `default_waste_percent` (batch scaler) | Batch scaler UI | **Local only** | P2-4 | |
| Mix log sessions | Not built on FE | — | P2-3 | Future FE |
| Discover recipes & inspirations | `discover/recipes.ts`, `inspirations.ts` | **Static** | P2-2 | Bundled JSON, not API |

---

### Community — real API vs mock

| Surface | FE location | Status | BE task | Notes |
|---------|-------------|--------|---------|-------|
| Feed + pagination | `ForYouFeed`, `community.ts` | **Synced** | P0-6 | Real API |
| Reactions | Feed cards | **Synced** | P0-7 | Optimistic + persisted |
| Polls | Community UI | **Synced** | P1-5 | FE wired |
| Text post create | `CreatePostSheet` | **Synced** | P0-6 | Works |
| Photo post create | `CreatePostSheet` + presigned | **Partial** | P0-6 | Upload often fails → text-only fallback (#24) |
| Glaze recipe in post (HTML comment block) | Share glaze flow | **Local parse** | P1-11 | No structured `post_type` yet |
| **Challenge tab (Festivals)** | `FestivalsTab.tsx` | **Mock** | **P0-8** | Falls back to `MOCK_UNDERWATER_CHALLENGE` when no API; `useMockChallengeStore` drives join/submit/phase |
| **Challenge gallery + voting** | `ChallengeGalleryScreen.tsx` | **100% mock** | **P0-9** | Entire screen uses `mockChallengeStore` — no API |
| **Hall of Fame tab** | `HallOfFameTab.tsx` | **Mock** | **P1-6** | Renders `MOCK_HALL_OF_FAME_CYCLES` from `challengeMockData.ts` |
| Challenge phase dev bar | `FestivalsTab` when `isMock` | **Dev/mock** | P0-8 | Remove when API drives `status` |
| Dead static seeds | `data.ts` — `WALL_OF_FAME`, `ACTIVE_CHALLENGE`, `POLL_OPTIONS`, `FOLLOW_CREATORS` | **Unused** | — | Safe to delete; superseded by API or mock modules |
| Drops / Events | `DropsTab.tsx` | **Placeholder** | — | Not V1; static card copy |
| Admin news cards | — | **Not started** | P1-7 | #29 |

**Mock module map** (remove when P0-8/9 + P1-6 land):

| File | Replace with |
|------|----------------|
| `src/screens/community/mock/mockChallengeStore.ts` | `GET /challenges`, entries, votes API |
| `src/screens/community/mock/challengeMockData.ts` | `GET /challenges/:id/entries`, `GET /hall-of-fame` |
| `src/screens/community/mock/challengeMockTypes.ts` | API types in `challenges.ts` |
| `src/screens/community/utils/mockUnderwaterChallenge.ts` | Real challenge from `GET /challenges` |
| `app/challenge-gallery.tsx` → `ChallengeGalleryScreen.tsx` | Wire gallery + `POST …/votes` |

---

### Premium, notifications & ops

| Data | FE location | Status | BE task | Notes |
|------|-------------|--------|---------|-------|
| RevenueCat entitlement (device) | `useEntitlements()`, `checkPremium()` | **Local SDK** | P1-13 | Webhook not verified — server `isPremium` may drift |
| Photo / analytics / companion swap gates | Various | **FE gap** | P1-13, P2-5 | Gates not wired (#61–64) |
| Push tokens | Settings toggle | **Local only** | P1-14 | #86 not sending tokens |
| Challenge deadline push | — | **Missing** | P2-6 | Depends on P1-14 |
| Local kiln/drying/studio-rhythm notifications | `notificationMessages.ts` | **Local only** | — | No server; OK for V1 |

---

### Recommended BE order (sync + mock replacement)

Aligns with [Recommended implementation order](#recommended-implementation-order) above — focused on **data survival** and **mock removal**:

1. **P0-1, P0-2, P1-2** — Profile identity + friends + public share
2. **P0-3** — Confirm pieces sync; extend payload for journal/pricing when ready
3. **P0-4** — Firing log fields + piece assignment on firings
4. **P0-10, P0-11** — Piece↔glaze + glaze batch metadata
5. **P0-6 presigned + P0-8/9** — Photo posts + replace challenge mock
6. **P1-3, P1-6** — Privacy enforcement + Hall of Fame archive
7. **P1-8–P1-12** — Glaze version chain, tests, images, recipe posts, provenance
8. **P1-13, P1-14** — Premium webhook + push tokens (App Store)

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
