# Backend Tasks — By Priority

**Purpose:** Single prioritized backlog for all API, sync, and server-side work. The mobile app repo tracks FE wiring here; deployment is verified separately.

**Last updated:** June 26, 2026  
**Companion docs:** [`BACKEND.md`](./BACKEND.md) (overview + API surface) · [`FRONTEND.md`](./FRONTEND.md) (FE tickets + roadmaps)

**✅ Sprint A complete (BE):** P0-1 (friends `cover_url`), P0-2 (public profile), P1-2b (avatar/cover media), P1-3 (privacy toggles + enforcement). FE wiring for privacy toggles (#14) still pending.

---

## ✅ Done on backend (Jun 26) — ALL P0, P1, AND P2 shipped

**The entire V1 backend backlog is complete.** Every task below is shipped; remaining work is FE wiring only.

| Task | Status |
|------|--------|
| P0-1 Friends 500 · P0-2 Public profile · P1-3 Privacy | ✅ shipped |
| P0-3 Pieces sync · P0-4 Firing log fields · P0-10 Piece↔glaze · P0-11 Glaze batch | ✅ shipped |
| P0-6 Post/feed/media · P0-7 Reactions · P0-8 Challenge lifecycle · P0-9 Voting · P1-6 Hall of Fame | ✅ shipped |
| P0-5 Account delete (soft-delete + grace + revive) | ✅ shipped |
| P1-2 Editable identity · P1-13 RevenueCat · P1-15 Validation · P1-16 Upload hardening · P1-17 OG page · P2-1 Universal Links · P1-14 Push tokens | ✅ shipped |
| **P1-4 Studios** · **P1-5 Polls** · **P1-7 Admin news** | ✅ shipped |
| **P1-8 Glaze version chain** · **P1-9 Test tiles** · **P1-10 Glaze images** · **P1-11 Structured recipe posts** · **P1-12 Save provenance** | ✅ shipped |
| **P2-2 Discover catalog** · **P2-3 Mix logs** · **P2-4 Batch scaler** · **P2-5 Server glaze count** · **P2-6 Challenge push** · **P2-7 Moderation** · **P2-8 Delete full lifecycle** · **P2-9 Cloud upload quotas** | ✅ shipped |
| **Studio Rhythm premium gate** — `PUT /users/me/rythm` rejects sprint/freeform for free users (403); preferences path routes through same gate so neither path bypasses it. **FE thread:** write rhythm via `/users/me/rythm`, not the preferences blob | ✅ shipped |
| **Public entitlement GET** — `GET /users/me/entitlement` → `{ tier, expires_at? }`. Server-authoritative tier read. FE adopts when `premiumGate.ts` migrates off the RevenueCat device SDK. | ✅ shipped |

**FE must adopt these route changes** (shipped differently than this doc originally specified):

- `GET /feed` → **`GET /users/me/feed`** (no public `/feed`; 404 = empty is fine)
- `POST /posts` → **`POST /users/me/posts`**
- `POST /uploads/presigned` (presigned S3) → **`POST /uploads`** server-side multipart → `{ asset_id, public_url }`. FE uploads the file directly to the API; there is no presign step.
- Challenge `status` is **derived from dates** in the response (no status column, no cron).
- `DELETE /users/me` is **soft-delete**: 204, ~1wk grace, then 403 `account_deleted` on everything except **`POST /users/me/revive`**. Deleted users vanish from others' feed/friends/leaderboards; deleted challenge winners return `user_deleted: true`.

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
| Graceful API failure | Broken endpoints shouldn't white-screen tabs | ✅ P0-1 friends 500 fixed | #89 shows 0 friends on failure |

**Not TestFlight blockers (release builds):** `reopenGeneralOnboarding()` in `app/index.tsx` runs only under `__DEV__` — production/TestFlight builds are unaffected (#1 in FRONTEND.md).

### TestFlight — should fix (high tester pain)

Ship soon after first beta if the feature is visible in the UI.

| Item | User impact | BE | FE |
|------|-------------|----|----|
| Pieces / kiln / glaze basic sync | Reinstall or second device loses studio data | P0-3, P0-4 (basic fields) | Wired |
| Friends list 500 | Clay Friends always empty | ✅ **P0-1** done | — |
| Profile text fields (name, studio, location, bio) | Edits lost on reinstall | ✅ **P1-2** done | #91 wire `PUT /users/me` |
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
| Public profile API | Share button copies `potterynook.app/user/{id}` — must resolve | ✅ **P0-2** done | Route exists |
| Privacy toggles enforced server-side | `profile_public` must gate public profile (404 when private) | ✅ **P1-3** done (FE wiring #14 pending) | #14 |
| Real community OR hide mock UI | V1 decision: real UGC backend; mock gallery/voting is misleading | **P0-8, P0-9, P1-6** | Remove `src/screens/community/mock/` |
| Cross-device core sync | Auth landing promises "Cloud backup" / "Sync across devices" | P0-3, P0-4, P0-10, P0-11 | Wired |
| Premium purchase + entitlement | IAP must unlock paid features reliably | ✅ **P1-13** webhook done (entitlement still read from device SDK) | #61–64 gates |
| Profile identity on server | Name/studio/bio on shared public profile | ✅ **P1-2** done | #91 |
| Friends list + friend requests | Social features advertised on auth gate | ✅ **P0-1** done, friend APIs | — |

### App Store — should fix (polish / conversion)

| Item | Why | BE | FE |
|------|-----|----|----|
| OG share preview page | WhatsApp/iMessage shares look broken without unfurl | ✅ **P1-17** done | Optional env only |
| Universal Links | Tap shared link opens app when installed | ✅ **P2-1** done (set env + Expo config) | Deep link verify |
| Glaze version chain + images + test tiles | Full atlas fidelity across devices | ✅ **P1-8, P1-9, P1-10** done | — |
| Structured glaze recipe posts | Feed stops parsing HTML comment blocks | ✅ **P1-11** done (field is `type`) | — |
| Push token storage + challenge deadline push | Notification permission with no delivery | ✅ **P1-14** storage + **P2-6** deadline/voting push done | #86 (send tokens) |
| RevenueCat webhook + server glaze count | Free-tier enforcement can't rely on client only | ✅ **P1-13** webhook + **P2-5** glaze count + **P2-9** cloud quotas done | #65 |
| Input validation + upload hardening | Production security baseline | ✅ **P1-15, P1-16** done | — |
| PostHog / no PII in logs | Ops + compliance | — | #47–48, #78 |

### App Store — explicitly deferrable (V1.1+)

Safe to ship V1 without blocking review if not prominently marketed.

| Item | Notes |
|------|-------|
| Discover catalog API (P2-2) | ✅ BE shipped (`GET /glazes/discover/*`); FE still bundled static recipes in `src/screens/library/discover/` |
| Mix logs / glaze stack / unload review (P2-3, FE roadmap) | ✅ BE mix logs shipped; FE roadmap depth still pending |
| Community news (P1-7) | ✅ BE `GET /news` shipped; FE not started (#29) |
| Events / Drops tab | Placeholder UI only (`DropsTab.tsx`) |
| Role-based kiln default view (#38–39) | Polish |
| Missions cap (#15), telemetry (#47–48), Jest/Maestro (#71–76) | Quality, not review gates |
| Challenge moderation (P2-7) | ✅ BE shipped (report/disqualify/vote-rate-limit); post-launch FE ops |

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

### P0-1 · Profile — Friends list 500 (`cover_url`) — ✅ Done (Sprint A)

**Shipped:** `cover_url` added to the `ListFriends` SELECT; 200 JSON array. Soft-deleted users are filtered out of the list.

**Observed (resolved):** `GET /users/me/friends` returned 500 — **cannot find field cover_url**.

**Impact:** Clay Friends tab, profile friend count, friend-status on public profiles.

**Fix (pick one):**
1. **Preferred:** Migrate nullable `cover_url` on `users`; persist from cover upload.
2. **Interim:** Remove `cover_url` from friends-list SELECT until migration ships.

**Acceptance:** `200` JSON array; objects match FE `BackendUser` in `src/services/friends.ts`.

**FE:** `src/services/friends.ts`, `ProfileHeader.tsx`, `useClayFriendStatus.ts`

---

### P0-2 · Profile — Public profile (`GET /users/:userId/profile`) — ✅ Done (Sprint A)

**Shipped:** handler returns public profile; 404 when `profile_public=false` or unknown user (no existence leak); ≤50 newest posts with images; never leaks `email`/`ory_id`/`is_deleted`. Soft-deleted users → 404.

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

### P0-3 · Core — Pieces REST API — ✅ Done (Sprint B, sync path)

`POST /users/me/pieces/sync` deployed; returns full `pieces` array + `client_ref_map`; idempotent (same item twice → same backend id). Sync payload today: `client_ref`, `name`, `status`, `description?`, `deleted?`, plus `glaze_id`/`glaze_outcome` (P0-10). Rich journal/pricing fields still local-only — extend payload when FE needs them.

**FE wired:** `src/services/pieces.ts`, `useOfflineSync`

**Status:** Deployed + verified. `POST /users/me/pieces/sync` returns full `pieces[]` + `client_ref_map`; idempotent upsert keyed on `(user_id, client_ref)`; `deleted:true` soft-deletes (gone from `pieces[]`, kept in map). Payload extend (journal/pricing/glaze link) tracked separately in B3/P0-10.

---

### P0-4 · Core — Kiln & firings REST API — ✅ DONE (log fields)

`/kilns`, `/firings` deployed. Log fields `peak_temp_c`, `hold_time_minutes`, `photo_uri` now round-trip (migration + model + repo INSERT/UPDATE/SELECT). `firedDate`/`statusOverride` already existed; **`pieceIds`/`result`/`resultNotes` also shipped** — `piece_ids[]` ARRAY_AGG in SELECT + `replacePieceLinks`/`ensurePiecesOwned` on write; `result`/`result_notes` round-trip in INSERT/UPDATE/SELECT. FE gap: `useFiringsSync` still strips these on pull — wire them.

**FE wired:** `src/services/kilns.ts`, `src/services/firings.ts` — **confirm FE stops stripping log fields on pull**

---

### P0-5 · Auth — Account deletion — ✅ DONE

`DELETE /users/me` → **soft-delete** (`is_deleted=true`), 204, session invalidated. ~1-week grace period; during grace all endpoints return **403 `account_deleted`** except **`POST /users/me/revive`** (restores, 200). Cascade of pieces/firings/glazes/friends/posts handled by DB `ON DELETE CASCADE` on hard delete; soft-deleted users are hidden from others' feeds/friends/leaderboards immediately. Out of scope: push-token removal (no push table yet), hard-purge cron after grace.

**FE wired:** `AccountSettingsScreen` — **FE should handle 403 `account_deleted` + offer the revive flow during grace.**

---

### P0-6 · Community — Post + feed + media — ✅ DONE (routes changed)

| Task | Endpoint (shipped) | Notes |
|------|--------------------|-------|
| Create post | **`POST /users/me/posts`** | text + image; image via `post_assets` |
| Feed | **`GET /users/me/feed`** | Paginated; returns `user_name`/`user_avatar_url` + `reactions[]` + `assets[]` public URLs. No public `/feed` (FE treats 404 as empty) |
| Delete own post | `DELETE /posts/:id` | own-post-only, else 404 |
| Upload | **`POST /uploads`** (server-side multipart) | Returns `{ asset_id, public_url }`. **No presigned flow** — FE POSTs the file directly |

**FE action:** repoint to `/users/me/feed`, `/users/me/posts`, and the direct `POST /uploads` (drop presign logic, #24).

---

### P0-7 · Community — Reactions — ✅ DONE

`POST/DELETE /posts/:id/reactions`. DB unique `(post_id, user_id)` prevents duplicates; `DELETE` is own-reaction-only; count returned in feed payload.

**FE wired**

---

### P0-8 · Community — Challenge lifecycle — ✅ DONE

| Task | Status |
|------|--------|
| `GET /challenges` | ✅ `status` **derived from dates** (open/voting/closed via SQL CASE — no column, no cron) |
| Join contract | ✅ `is_joined`, `track_id`, `has_submitted`, `submission_deadline` exposed (OptionalAuth) |
| `POST /challenges/:id/entries` | ✅ idempotent (upsert by user+challenge): 201 first join, 200 if already joined |
| Submit entry | ✅ **`PUT /challenges/:id/entries/:entryId`** → sets `submitted_at` |
| `DELETE …/entries/:entryId` | ✅ Withdraw |
| `GET /challenges/:id/entries` | ✅ gallery; `?track_id=`; sort by votes |
| Phase transitions | ✅ Not needed — derived from `submission_deadline`/`end_date` |

**FE:** **Remove** `src/screens/community/mock/` and wire the real API.

---

### P0-9 · Community — Voting — ✅ DONE

| Task | Status |
|------|--------|
| `POST /challenges/:id/votes` | ✅ `{ entry_id }`; unique `(challenge_id, user_id, track_id)`; revote updates existing row |
| `my_vote_entry_id` per track | ✅ on `GET /challenges/:id/entries` |
| Denormalized `vote_count` | ✅ recalculated transactionally on vote change |
| Self-vote | ✅ rejected |

Note: soft-deleted users' entries drop out of the leaderboard (everyone shifts up).

---

### P0-10 · Glaze — Piece ↔ glaze link sync — ✅ DONE

Shipped: `glaze_id` (FK `ON DELETE SET NULL`) + `glaze_outcome` on pieces; in `SyncPieceItem` + `Piece`; validated to same user (else 400). Outcome enum: success/crawling/underfired/crack.

| Task | Notes |
|------|-------|
| Add `glaze_id`, `glaze_outcome` to piece sync + DB | Enum: success, crawling, underfired, crack |
| Return on GET/sync | FE mappers in `src/services/pieces.ts` |
| Validate glaze belongs to user | Null or reject orphaned refs |
| Cascade on glaze delete | Block or null refs |

**Acceptance:** Link glaze on device A → sign in on B → same link and outcome.

---

### P0-11 · Glaze — Batch metadata persistence — ✅ DONE

Shipped: sync handler maps and persists all batch fields: `batch_id`, `date_mixed`, `status`, `best_clay_type`, `best_firing_temp_c`, `atmosphere`, `ingredients_text`. (Version chain P1-8, images P1-10 still pending.)

**Acceptance:** Create glaze with batch ID on A → pull on B → batch chip matches.

---

## P1 — V1 fidelity

### P1-1 · Auth — Password recovery (Ory Kratos) — ✅ Verified

Recovery flow on submit. Email sent. Session invalidated on success.

**Status (Jun 24):** Verified end-to-end on device for both Google and email/password accounts — request → emailed code → new password → signed in. Runs on Ory **Recovery V2**

**FE:** `oryRecoveryStart` / `oryRecoverySubmitCode` in `src/services/auth.ts`.

---

### P1-2 · Profile — Editable identity (name, studio, location, bio) — ✅ DONE (BE)

**Shipped:** `PUT /users/me` (`UpdateMe`) — partial update, omitted fields unchanged. Validation matches the contract below: `name` trimmed 1–80 (reject empty/oversize), `studio_name`/`location` max 120, `bio` max 500, empty string clears to null. Returns the full updated user. Migration added `studio_name`/`location`/`bio`; `GET /users/me` and public profile (P0-2) return them. **FE gap:** wire `updateProfile()` from `EditProfileModal` (#91) — still local-only today.

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

### P1-2b · Profile — Media (avatar + cover) — ✅ Done (Sprint A)

| Task | Notes |
|------|-------|
| `cover_url` column + migration | Unblocks P0-1 |
| `GET /users/me` returns `cover_url` | FE: `useCurrentUser` |
| `POST /users/me/avatar` | FE: `uploadAvatar()` |
| `POST /users/me/cover` | FE: `uploadCover()` |
| Cascade delete avatar/cover assets on account delete | |

---

### P1-3 · Profile — Privacy sync — ✅ Done (Sprint A)

`PUT /users/me/privacy` — `profile_public`, `pieces_public`. (Analytics opt-in not persisted server-side yet.)

Enforce on `GET /users/:userId/profile` → 404 when `profile_public=false`; `pieces_public=false` hides the posts array.

**BE shipped Sprint A.** **FE gap:** toggles still local only — wire `PUT /users/me/privacy` (#14 in FRONTEND.md).

---

### P1-4 · Profile — Studios API — ✅ DONE

Shipped: `GET /users/me/studios/owned`, `/member-of`; `POST /users/me/studios/:studio_id/invites`; `GET /users/me/studios/join-requests/incoming`; `POST /users/me/studios/:studio_id/join-requests`; `POST /users/me/studios/join-requests/:request_id/accept|reject`. BE paths follow the FE `studios.ts` contract (not the abstract `/studios/:id/` brief). Non-owner accept → 403 (`ErrNotStudioOwner`); no auth → 401.

**FE wired:** `src/services/studios.ts`, `StudiosTab`

---

### P1-5 · Community — Polls — ✅ DONE

Shipped: `GET /polls` (`ListActive` → `ends_at > NOW()`, options batched), `POST /polls/:id/vote` (DB `UNIQUE(poll_id, user_id)` → PG 23505 → `ErrPollAlreadyVoted` → 409), `GET /polls/:id/results` (LEFT JOIN tally, zero-vote options included).

**Create polls:** Admin only — `POST /api/polls` (admin-gated) + migration `20260626000100_create_polls.sql`. No in-app composer.

**FE wired**

---

### P1-6 · Community — Hall of Fame (winner archive) — ✅ DONE

`GET /hall-of-fame` → `{ cycles: [{ challenge_id, title, winners[] }] }`. Winner row: track, artist, piece, image, vote_count, `won_at`. Archive job on challenge close: max votes per track, tie-break earliest `submitted_at`. `GET /hall-of-fame/winners/:id` for deep links.

**Deleted-winner behavior:** a winner whose account is deleted is **not** dropped and the runner-up is **not** promoted — the row returns `user_deleted: true` with name/image nulled, so FE should render a "winner account deleted" tombstone rather than treat it as an error.

**FE:** #28 ✅ — `HallOfFameTab` + `HallOfFameWinnerScreen` use live API in prod; mock data dev-only. Handle `user_deleted: true` tombstone.

---

### P1-7 · Community — Admin news — ✅ DONE

Shipped: `GET /news` — curated pottery news (title, source, url, image_url, published_at), public route, `ORDER BY published_at DESC` + `idx_news_published_at`. Migration `20260626000200_create_news.sql` seeds 10 example rows.

**FE:** not started (#29)

---

### P1-8 · Glaze — Version chain — ✅ DONE

Shipped: `version_number` (`DEFAULT 1`), `root_glaze_id`, `parent_glaze_id` (both FK `ON DELETE SET NULL`) on `glazes`; persisted in `POST /users/me/glazes/sync`; `GET /users/me/glazes/:id/versions` returns the chain ordered by `version_number`.

---

### P1-9 · Glaze — Test tiles sync — ✅ DONE

Shipped: `POST /users/me/glazes/sync` persists test snapshots — clay_type, cone, kiln_type, application_method, defects, `result_rating`, photo_ref. Linked to glaze via `glaze_client_ref`.

---

### P1-10 · Glaze — Images — ✅ DONE

Shipped: `POST /users/me/glazes/:id/images` (multipart `file` + `type`: `bucket`/`test-tile`/`finished-piece`/`accident`) → `{id, url, type}`; `DELETE …/glazes/:id/images/:imageId` → 204 idempotent; `images[]` with URLs in glaze detail/list payload. Invalid type → 400.

---

### P1-11 · Glaze — Community recipe posts — ✅ DONE

Shipped. **Field is `type` (not `post_type`)** — it already lives on `posts`, so the prefix is redundant.

| Task | Status |
|------|--------|
| `type TEXT NOT NULL DEFAULT 'text'` on posts | ✅ (`text` \| `glaze_recipe`) |
| `glaze_recipe` JSONB column | ✅ mirrors `CommunityGlazeRecipePayload` |
| Accept on `POST /users/me/posts` | ✅ strips HTML comment block from `content` when `glaze_recipe` present |
| Return on feed | ✅ feed returns `type` + `glaze_recipe` |

**FE note:** live FE code still embeds the recipe inside `content` and parses it back out, so no FE change is required — only the FE planning docs still say `post_type`.

---

### P1-12 · Glaze — Save provenance — ✅ DONE

Shipped: `source_post_id` (FK `ON DELETE SET NULL`), `source_user_id` (FK `ON DELETE SET NULL`), `source_discover_recipe_id` (text) on `glazes`; persisted in glaze sync; idempotent on `(user_id, source_post_id)` so the same post can't be saved twice.

---

### P1-13 · Premium — RevenueCat webhook — ✅ DONE

`POST /webhooks/revenuecat` shipped — secret-verified (`REVENUECAT_WEBHOOK_SECRET`), rate-limited 10/min. Records subscription events into a `subscriptions` table. Server now **reads** the active tier internally via `GetActiveTier` and gates routes/quotas with `middleware.RequirePremium()` (export P2-8, glaze count P2-5, cloud quotas P2-9). Public **`GET /users/me/entitlement`** → `{ tier: "basic"|"premium", expires_at? }` is also shipped; FE still reads `isPremium` from the device SDK and adopts the GET when hardening against SDK spoofing.

---

### P1-14 · Notifications — Push token storage — ✅ DONE (BE)

`POST /users/me/push-tokens` shipped → `{ token, platform }` (platform `ios`|`android`), returns 204. Token is globally unique; re-register upserts (`ON CONFLICT (token)`) and reassigns to the current user — covers dedupe + rotation. A user may register multiple device tokens. Cascade-deletes with the user.

**FE:** #86 ✅ — `usePushTokenSync` + `syncPushTokenWithBackend` register on launch, pref change, and token rotation.

---

### P1-15 · Security — Validation & rate limiting — ✅ DONE

Global limiter (1000/min) + tighter per-route limits (e.g. webhook 10/min). Request bodies validated in-handler (typed structs + length/enum checks); image uploads capped at 10MB with byte-sniff validation. Go-side typed enums (`Valid()`) enforce allowed values, not DB CHECK constraints.

---

### P1-16 · Security — Media upload hardening — ✅ DONE

Authenticated only; image type whitelist + byte-sniff validation (`util.ReadImageUpload`); 10MB server-side cap; UUID object keys via `BuildObjectKey`/`SanitizePathSegment`; code sets no bucket ACLs.

---

### P1-17 · Profile — Share link preview (Open Graph web page) — ✅ DONE

**Shipped:** `GET /user/:userId` (`ServeUserOGPage`) serves server-rendered HTML — no auth, 404 on private/missing (same rules as P0-2). Emits `og:title`/`description`/`image`/`url`/`type`/`site_name` + `twitter:*` tags, image falls back cover → avatar → newest post → logo, plus a human body with grid + store CTA. **FE:** no change needed; optional `EXPO_PUBLIC_PROFILE_WEB_URL` override.

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

### P2-1 · Profile — Universal Links / App Links — ✅ DONE (BE)

**Shipped:** `GET /.well-known/apple-app-site-association` and `GET /.well-known/assetlinks.json` — public, no redirect, `Content-Type: application/json`. iOS components path `/user/*` with appID from `APPLE_APP_ID` env; Android package `com.ariane.potterylife` with fingerprint from `ANDROID_SHA256_FINGERPRINT` env. **Set both env vars in prod** (placeholders today) and add the Expo `associatedDomains` / `intentFilters` config before tap-to-open resolves.

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

### P2-2 · Glaze — Discover catalog API — ✅ DONE

Shipped: `GET /glazes/discover/recipes` (versioned, CDN preview URLs) + `GET /glazes/discover/inspirations`, both public. Admin publish (upsert + delete for recipes and inspirations) at `/api/glazes/discover`.

---

### P2-3 · Glaze — Mix logs — ✅ DONE

Shipped: `glaze_mix_logs` table (`id, user_id, glaze_id, mixed_at, target_batch_g, ingredient_snapshot_json, notes, created_at`, FK `glaze_id ON DELETE CASCADE`); `POST /users/me/glazes/sync` accepts `mix_logs[]` per glaze item. Per-material child rows deferred (YAGNI — `ingredient_snapshot_json` holds the recipe-as-mixed).

---

### P2-4 · Glaze — Batch scaler sync — ✅ DONE

Shipped: `default_grams_per_piece`, `default_waste_percent` on `glazes`; persisted + returned in `POST /users/me/glazes/sync`.

---

### P2-5 · Glaze — Analytics & limits — ✅ DONE

Shipped: server-side active-glaze count enforced on `POST /users/me/glazes/sync` — free tier capped at **15** (`enforceGlazeLimit`); new glazes over cap → 403 `glaze_limit_reached`; updates to existing glazes + premium users pass through. `GET /users/me/glazes/usage` → `{ count, limit, is_premium }`.

---

### P2-6 · Community — Notifications — ✅ DONE

Shipped (background job, piggybacks the jobs ticker): push 48h before `submission_deadline` to joined-but-unsubmitted users; push to all joined users when voting opens; optional winner push on close. Expo Push API. Depends on P1-14 (done) + FE sending tokens (#86).

---

### P2-7 · Community — Moderation — ✅ DONE

Shipped: per-user vote rate limit (same in-memory limiter pattern → 429 on burst); `POST /challenges/:id/entries/:entryId/report` (`{ reason, note? }`) → 204; admin `POST /admin/challenges/:id/entries/:entryId/disqualify` → 204 (disqualified entries hidden from gallery + vote totals; non-admin → 403).

---

### P2-8 · Account lifecycle — ✅ DONE

Shipped: hard-purge piggybacks the existing 10m background-jobs ticker (new `deleted_at` drives a 30-day grace), wipes the whole `{userID}/` storage prefix, then FK-cascade clears child DB rows. `GET /users/me/export` (premium-gated) returns the user's glazes + piece-glaze links. Storage purge runs only at hard-purge, so `/revive` keeps images through the grace period.

---

### P2-9 · Premium — Cloud upload quotas (server-side enforcement) — ✅ DONE

The FE gated two free-tier cloud limits in `cloudStorage.ts`, but the BE upload endpoints enforced neither — a free user could bypass both via direct API calls. Now mirrored server-side (`internal/quota/cloud.go`). Premium skips both checks.

- **Account storage cap** — free tier = **500 MB** total cloud media (`FreeCloudStorageBytes`); BE sums live object sizes under `{userID}/` and rejects over-cap uploads with **413**. Enforced on all four upload paths: piece assets, glaze images, avatar, cover.
- **Per-piece photo slot** — free tier = **1** cloud-backed photo per piece (`FreePiecePhotoLimit`); a 2nd cloud photo on a piece → **403**. PUT-replace path untouched (no new slot). Glaze images only hit the storage cap, not this slot.

`swag init` run; 403/413 documented on all four endpoints.

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
| `avatar_url` | `uploadAvatar()` | **Synced** | P1-2b ✅ | Works when BE deployed |
| `cover_url` | `uploadCover()` | **Synced** | P1-2b ✅, **P0-1** ✅ | `cover_url` column shipped; friends list 500 fixed |
| `profile_public`, `pieces_public` | `PrivacySettingsScreen`, `privacyPrefs` | **Local only** | P1-3 ✅ (BE) | BE shipped `PUT /users/me/privacy` + enforcement; FE toggles still local (#14) |
| `analyticsEnabled`, `personalizedSuggestions` | `PrivacySettingsScreen` | **Local only** | P1-3 (optional) | Not in BE contract yet |
| Public profile grid (posts, counts) | `PublicUserProfileScreen`, share URLs | **Synced** | **P0-2** ✅ | `GET /users/:userId/profile` shipped Sprint A |
| OG / web preview | Share to WhatsApp/iMessage | **Missing** | P1-17 | Plain-text shares until HTML page ships |
| Clay friends list | `friends.ts`, `ProfileHeader` | **Synced** | **P0-1** ✅ | `cover_url` fix shipped; list returns 200 |
| Friend requests | `friends.ts` | **FE wired** | — | Blocked by friends list / public profile |
| Studios (owned, member-of, invites) | `studios.ts`, `StudiosTab` | **Synced** | P1-4 ✅ | BE shipped (owned/member-of, invites, join-request accept/reject); verify in-app |

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
| `firedDate`, `peakTempC`, `holdTimeMinutes` | Log Firing modal, `FiringDetailModal` | **API ready** | **P0-4** ✅ | BE round-trips; `useFiringsSync` still strips on pull — wire |
| `photoUri`, `statusOverride` | Kiln history / log firing | **API ready** | **P0-4** ✅ | BE round-trips; FE must stop stripping |
| `pieceIds` on firing | Firing detail, piece assignment | **API ready** | P0-4 ✅ | **In `BackendFiring`** (`piece_ids[]` ARRAY_AGG + `replacePieceLinks`); FE wire assignment |
| `result`, `resultNotes` | Firing completion | **API ready** | P0-4 ✅ | BE round-trips; FE wire completion |
| `logSource` | Kiln history | **Local only** | P3 | FE-only discriminator (`session` vs `manual`); no BE column by design |

---

### Glaze library

| Data | FE location | Status | BE task | Notes |
|------|-------------|--------|---------|-------|
| Core glaze fields (name, finish, cone, ingredients, tags, collections) | `useGlazesSync`, `GlazeSyncItem` | **Synced** | P0-3 glazes path | Via `POST /users/me/glazes/sync` |
| Batch metadata: `batchId`, `dateMixed`, `status`, `bestClayType`, `bestFiringTempC`, `atmosphere`, `ingredientsText` | Glaze batch UI | **Synced** | **P0-11** ✅ | Persists server-side; verify FE round-trip |
| Version chain: `versionNumber`, `rootGlazeId`, `parentGlazeId` | `glazeVersionUtils.ts` | **Synced** | P1-8 ✅ | Persists + `GET …/glazes/:id/versions` |
| Discover save provenance: `discoverSourceRecipeId`, `discoverSavedAt` | Save from Discover | **Synced** | P1-12 ✅ | Persists, idempotent on `(user_id, source_post_id)` |
| Test tiles (clay, cone, defects, rating, photo) | Atlas test logging | **Synced** | P1-9 ✅ | Persists via sync, linked by `glaze_client_ref` |
| Glaze gallery images (bucket, test-tile, finished-piece, accident) | Glaze detail | **Synced** | P1-10 ✅ | `…/glazes/:id/images` upload/delete; `images[]` in payload |
| `default_grams_per_piece`, `default_waste_percent` (batch scaler) | Batch scaler UI | **Synced** | P2-4 ✅ | Persists in sync |
| Mix log sessions | Not built on FE | **API ready** | P2-3 ✅ | `mix_logs[]` accepted in glaze sync; FE not built |
| Discover recipes & inspirations | `discover/recipes.ts`, `inspirations.ts` | **Static** | P2-2 ✅ | BE `GET /glazes/discover/*` ready; FE still bundled JSON |

---

### Community — real API vs mock

| Surface | FE location | Status | BE task | Notes |
|---------|-------------|--------|---------|-------|
| Feed + pagination | `ForYouFeed`, `community.ts` | **Synced** | P0-6 | Real API |
| Reactions | Feed cards | **Synced** | P0-7 | Optimistic + persisted |
| Polls | Community UI | **Synced** | P1-5 | FE wired |
| Text post create | `CreatePostSheet` | **Synced** | P0-6 | Works |
| Photo post create | `CreatePostSheet` | **API ready** | ✅ P0-6 | Repoint to `POST /uploads` (direct multipart) + `POST /users/me/posts`; drop presign fallback (#24) |
| Glaze recipe in post (HTML comment block) | Share glaze flow | **Local parse** | P1-11 | No structured `post_type` yet |
| **Challenge tab (Festivals)** | `FestivalsTab.tsx` | **API ready** | ✅ P0-8 | Backend live (`status` derived from dates). **Remove** `MOCK_UNDERWATER_CHALLENGE` / `useMockChallengeStore`; wire `GET /challenges` |
| **Challenge gallery + voting** | `ChallengeGalleryScreen.tsx` | **API ready** | ✅ P0-9 | Wire `GET /challenges/:id/entries` + `POST …/votes`; drop `mockChallengeStore` |
| **Hall of Fame tab** | `HallOfFameTab.tsx` | **API ready** | ✅ P1-6 | Wire `GET /hall-of-fame`; handle `user_deleted: true` winner tombstone. Drop `MOCK_HALL_OF_FAME_CYCLES` |
| Challenge phase dev bar | `FestivalsTab` when `isMock` | **Dev/mock** | P0-8 | Remove when API drives `status` |
| Dead static seeds | `data.ts` — `WALL_OF_FAME`, `ACTIVE_CHALLENGE`, `POLL_OPTIONS`, `FOLLOW_CREATORS` | **Unused** | — | Safe to delete; superseded by API or mock modules |
| Drops / Events | `DropsTab.tsx` | **Placeholder** | — | Not V1; static card copy |
| Admin news cards | — | **API ready** | P1-7 ✅ | BE `GET /news` shipped; FE not started (#29) |

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
| RevenueCat entitlement (device) | `useEntitlements()`, `checkPremium()` | **Local SDK** | P1-13 ✅ | Webhook + server reads tier (`GetActiveTier`); gates export/quotas. No public `GET /entitlement` — FE still device SDK |
| Photo / storage / glaze-count gates | Various | **BE enforced** | P2-9, P2-5 ✅ | Server-side: 500 MB + 1-photo/piece (P2-9), 15-glaze cap (P2-5). FE gates #61–64 still to wire |
| Data export (premium) | Privacy → export | **API ready** | P2-8 ✅ | `GET /users/me/export` (premium-gated) — glazes + piece glaze links |
| Push tokens | Settings toggle | ✅ FE wired | P1-14 ✅ | `usePushTokenSync` → `POST /users/me/push-tokens` (#86) |
| Challenge deadline push | Background job | **API ready** | P2-6 ✅ | BE push 48h-before-deadline + voting-opens shipped; needs FE tokens (#86) |
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
| DELETE | `/users/me` | ✅ P0-5 | Account settings — soft-delete + grace |
| POST | `/users/me/revive` | ✅ P0-5 | Restore during grace (handle 403 `account_deleted`) |
| GET | `/users/me` | ✅ P1-2 | `fetchMe()` — extend with studio/location/bio |
| PUT | `/users/me` | ✅ P1-2 | Identity edit shipped; FE not wired yet — `EditProfileModal` local only (#91) |
| POST | `/users/me/cover` | ✅ P1-2b | `uploadCover()` |
| POST | `/users/me/avatar` | ✅ P1-2b | `uploadAvatar()` |
| PUT | `/users/me/privacy` | ✅ P1-3 | Not wired (#14) — toggles local only |
| GET | `/users/me/friends` | ✅ P0-1 | `apiListFriends()` — 500 fixed |
| POST | `/users/me/friends/requests` | ✅ P1 | `apiSendFriendRequest()` |
| GET | `/users/:userId/profile` | ✅ P0-2 | `apiGetPublicProfile()` |
| GET | `/user/:id` | ✅ P1-17 | Share / OG preview — server-rendered HTML (web, not JSON API) |
| GET | `/.well-known/apple-app-site-association` · `/.well-known/assetlinks.json` | ✅ P2-1 | Universal Links / App Links (set env vars in prod) |
| POST | `/users/me/pieces/sync` | ✅ P0-3 | `src/services/pieces.ts` |
| GET/POST | `/kilns`, `/firings` | ✅ P0-4 | `src/services/kilns.ts` — log fields round-trip |
| GET | `/users/me/feed` | ✅ P0-6 | Community feed (was `/feed`) |
| POST | `/users/me/posts` | ✅ P0-6 | Post create (was `/posts`) |
| POST | `/uploads` | ✅ P0-6 | Server-side multipart → `{asset_id, public_url}` (no presign) |
| POST/DELETE | `/posts/:id/reactions` | ✅ P0-7 | Reactions |
| GET | `/challenges` | ✅ P0-8 | Challenge tab — `status` derived from dates |
| POST | `/challenges/:id/entries` | ✅ P0-8 | Join (idempotent); submit = `PUT …/entries/:id` |
| POST | `/challenges/:id/votes` | ✅ P0-9 | Gallery voting |
| GET | `/hall-of-fame` | ✅ P1-6 | Hall of Fame tab; `/hall-of-fame/winners/:id` for deep links |
| GET/POST | `/polls`, `/polls/:id/vote`, `/polls/:id/results` | ✅ P1-5 | Poll voting (admin create via `/api/polls`) |
| GET | `/news` | ✅ P1-7 | News cards (public) |
| GET/POST | `/users/me/studios/*` | ✅ P1-4 | Owned/member-of, invites, join-requests accept/reject |
| POST | `/webhooks/revenuecat` | ✅ P1-13 | Secret-verified, rate-limited 10/min |
| POST | `/users/me/push-tokens` | ✅ P1-14 | `{token, platform}` → 204; FE wired (#86 ✅) |
| GET/POST | `/users/me/glazes/sync` | ✅ P0-10/11, P1-8/9/12, P2-3/4 | `src/services/glazes.ts` — versions, tests, provenance, scaler, mix logs all persist |
| POST/DELETE | `/users/me/glazes/:id/images` | ✅ P1-10 | Gallery images (`bucket`/`test-tile`/`finished-piece`/`accident`) |
| GET | `/users/me/glazes/:id/versions` · `/users/me/glazes/usage` | ✅ P1-8 / P2-5 | Version chain · `{count, limit, is_premium}` |
| GET | `/glazes/discover/recipes`, `/inspirations` | ✅ P2-2 | Versioned Discover catalog (public; admin publish `/api/glazes/discover`) |
| GET | `/users/me/export` | ✅ P2-8 | Premium-gated data archive (glazes + piece glaze links) |
| POST | `/challenges/:id/entries/:entryId/report` · admin `…/disqualify` | ✅ P2-7 | Moderation: report → 204; disqualify hides entry |
| PUT | `/users/me/rythm` | ✅ shipped | Studio rhythm — sprint/freeform premium-gated (403 for free); FE must use this route, not preferences blob |

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
