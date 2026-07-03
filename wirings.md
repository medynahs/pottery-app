# BE/FE Wiring Audit

Sanity check of every BE/FE handshake after the lean refactor. Backend = `pottery-api` (Go/Gin), frontend = `pottery-app` (Expo/TS). Goal: catch schema drift, path/method mismatches, and dropped fields before calling the refactor done.

**Bottom line:** every data-moving domain (pieces, glazes, kilns, firings, friends, studios, me/preferences/rhythm/entitlement) is clean end to end. All the drift is clustered in **community display surfaces** (challenges + hall-of-fame), where BE responses no longer carry fields the FE still reads. Nothing crashes (FE guards with `?? 0` / `|| 'fallback'`), so the screens silently render stale or placeholder data. Plus a set of orphaned BE endpoints with zero FE consumers.

---

## Clean domains (verified both sides, no drift)

| Domain | Endpoints | Notes |
|---|---|---|
| Pieces + assets + sync | 6 | `file` multipart field + `pieces[]` wrapper + `client_ref_map` all match; PieceStage + Visibility enums identical |
| Glazes + tests + images + sync | 5 | every camelCase field matches; 4 image buckets (`bucket`/`test-tile`/`finished-piece`/`accident`) round-trip |
| Kilns / Firings (doc twins) | 4 | wrapper keys `kilns`/`firings` correct on each side, not swapped; doc treated opaque both ways |
| Friends / Studios | 23 | zero GET/POST inversions across the near-identical `invites/incoming` vs `:studio_id/invites` and `join-requests/incoming` vs `:studio_id/join-requests` paths; correct path params + body keys; pending-row 204 semantics agree |
| Me / preferences / rhythm / entitlement / push / revive / change-password / public-profile | 13 | profile fields match; preferences + rhythm are FE-owned blobs, both sides agree on the only contract keys (`version` / `type`); entitlement tier literals match |

---

## Real handshake gaps: FE reads it, BE never sends it

These degrade to hard-coded fallbacks, so they've been invisible. Could be lean-pass regressions or FE surfaces built ahead of the BE (some read against mock stores). Fix either way: wire the BE field or cut the FE read.

### Challenges

- **`challenge.participant_count` (top-level)** never sent. BE only computes it per-track ([internal/repo/challenges/challenges.go:95](../pottery-api/internal/repo/challenges/challenges.go)). FE reads top-level at `src/screens/community/utils/challengeDisplay.ts:75` and `challengeFestival.ts:20`. Result: hero "joined" badge stuck at **0**.
- **`challenge.winners`** not a field on the struct. FE reads it at `src/screens/community/tabs/ChallengesTab.tsx:581-582` to render the inline "this challenge's winners" block. Result: block never renders from API data.
- **Gallery entry `piece_title` / `studio_name` / `rank`** never sent (`ChallengeGalleryEntry`, `models.go:315-328`). FE reads them at `src/screens/community/utils/challengeWinners.ts:131-136`. Result: every gallery card titled **"Untitled piece"**, studio label blank, rank undefined.
- **Soft (mitigated by BE `status`):** `voting_ends_at`, `winners_display_until`, `next_challenge_starts_at` all absent. Phase resolution still works because BE always emits `status`, but phase subtitles ("X days left to vote", "new challenge in N days") go blank and `isChallengeActive` treats closed challenges as active indefinitely (`challengeDisplay.ts:42`).

### Hall of Fame

Six dropped keys, all falling back to placeholders (`services/community.ts` types vs `models.go` HOF structs):

- `cycle.label` never sent -> always renders "Past challenge" (`HallOfFameTab.tsx:31`)
- `cycle.emoji` never sent -> always 🏆 (`HallOfFameTab.tsx:33`)
- `winner.studio_name` never sent -> always "" (`challengeWinners.ts:48,88`)
- `winner.piece_title` never sent -> always **"Winning piece"** (`challengeWinners.ts:49`). This is the prominent 2xl card/detail title, the most user-visible of the set.
- detail `winner.challenge_label` -> always "Past challenge" (`HallOfFameWinnerScreen.tsx:132`)
- detail `winner.challenge_emoji` -> always 🏆 (`HallOfFameWinnerScreen.tsx:129`)

---

## Lower-priority / latent

- **`comment_count`** typed as non-optional `number` on `BackendFeedPost` (`src/services/community.ts:28`), BE never sends it. Consumed at `src/screens/overview/profile/components/ProfilePostCard.tsx:140,211`, so profile always shows "0 comments". The type is lying (a `number` that's actually `undefined` at runtime). Make it optional or cut it.
- **Glaze batch-scaler never reaches cloud.** BE accepts + has columns for `defaultGramsPerPiece` / `defaultWastePercent`, but the FE glaze sync item never sends them. Local-only values; those two columns stay perpetually NULL.
- **Glaze `firingDate: ''` -> 400 on the whole batch.** FE sends `toRfc3339(firingDate) ?? ''`; an empty string fails to unmarshal into the BE's required `time.Time`, 400-ing the entire glaze+test batch. Latent (firingDate is normally populated).
- **Glaze `glaze_client_ref` can carry a backend UUID** instead of a client_ref on re-sync of a freshly-pulled test, producing a 400 "matches no glaze". Edge case on the merge path.
- **Account `is_deleted` / `deleted_at`** read by the FE grace-detection path (`accountGrace.ts:76-83`), BE never emits them, and `/me` sits behind `BlockDeleted` (403 before any body) so the path is unreachable anyway. Grace only ever fires via the 403 `account_deleted` error path. Harmless but a dead handshake.
- **Reaction type not persisted.** FE offers 4 reaction kinds, BE hardcodes `'like'`, and `has_reacted` is a single bool so reload always maps back to `'fired'`. The wire contract is internally consistent (no reaction-type param on either side); the 4-way UI is effectively cosmetic. Only a problem if per-type reactions were an intended product goal.

---

## Orphaned BE endpoints (live, zero FE consumers)

Written-never-read from the client. Either the FE features got cut or never shipped. Candidates for a "ship it or flatline it" call:

- `GET /me/export` (AccountExport)
- `GET/POST /me/missions` — the missions UI is entirely client-side off Studio Rhythm, never hits the BE
- `GET /me/wrap/:year` (WrapReport)
- `GET /public/news` — nothing in the app fetches it
- `GET /public/events` — nothing fetches it (the studio-rhythm calendar is a different, local domain)

---

## Cosmetic (noting, not urging)

- Dead `'image'` upload-retry fallback in `communityUpload.ts` (BE only ever reads the `file` field, so the retry 400s again).
- Stale auth-provider comments: `friends.ts:2` says "SuperTokens session token", `studios.ts:2` says "Ory session token". One is stale after an auth migration; no runtime effect.
- `publicProfile.ts` FE type silently drops `location`, which the BE does send on the public profile.
- Hall-of-fame endpoints are `OptionalAuth` public but the FE gates them behind sign-in (`useHallOfFameArchive.ts:17`), so signed-out users see nothing the BE would otherwise serve. Confirm intent.
- FE types `piece.stage` as plain `string` rather than the `Stage` union, so an out-of-vocab stage is caught only by BE's `PieceStage.Valid()` -> 400.
