# Community Challenge — Backend Tasks

**Purpose:** API work to power seasonal/monthly challenges: track-based join, submission, community voting, and Hall of Fame winner archive.

**Last updated:** June 21, 2026  
**FE status:** Mock preview implemented — see `src/screens/community/mock/` and [`COMMUNITY-CHALLENGE-BACKEND-TASKS.md`](./COMMUNITY-CHALLENGE-BACKEND-TASKS.md) (this file). Replace mock store with real endpoints below.

**Related FE tickets:** TICKETS.md #16–20, #26, #28, #70, #87

---

## Product flow (target)

1. **Open** — user joins a track, makes a piece, submits (creates/links a community post).
2. **Voting** — community browses submissions per track; one vote per user per track.
3. **Closed** — server freezes winners (top vote per track); Hall of Fame entries created.
4. **Archive** — `GET /hall-of-fame` returns winner cards with challenge + artist + submission metadata.

---

## Priority legend

| Priority | Meaning |
|----------|---------|
| P0 | Required for challenge loop to work end-to-end |
| P1 | Required for Hall of Fame archive fidelity |
| P2 | Notifications, analytics, moderation |

---

## P0 — Challenge model + lifecycle

| # | Task | Notes |
|---|------|-------|
| BE-C1.1 | Extend `GET /challenges` response | Fields: `status` (`open` \| `voting` \| `closed`), `starts_at`, `submissions_close_at`, `voting_close_at`, `hero_image_url`, `emoji`, `label` |
| BE-C1.2 | Persist challenge **tracks** | `beginner`, `intermediate`, `advanced` (or admin-defined). Return on challenge detail/list. |
| BE-C1.3 | Server-driven phase transitions | Cron or scheduled job: `open → voting` at `submissions_close_at`, `voting → closed` at `voting_close_at` |
| BE-C1.4 | Join contract on challenge list | Per user: `is_joined`, `track_id`, `entry_id`, `has_submitted`, `submission_deadline` (ticket #87) |

**Acceptance:** FE can render phase chip + CTAs from API alone (no mock phase switch).

---

## P0 — Entries (join + submit)

| # | Task | Notes |
|---|------|-------|
| BE-C2.1 | `POST /challenges/:id/entries` — join | Body: `{ track_id }`. Creates entry row; idempotent if already joined same challenge. |
| BE-C2.2 | Submit/update entry | Body: `{ post_id, note?, piece_id? }`. Requires existing join. Sets `submitted_at`. |
| BE-C2.3 | `DELETE /challenges/:id/entries/:entryId` — withdraw | Already wired on FE; confirm cascade rules. |
| BE-C2.4 | Validate `post_id` | Must belong to user; must include challenge tag/metadata; must have ≥1 image asset before voting opens. |
| BE-C2.5 | `GET /challenges/:id/entries` | Paginated gallery. Filter `?track_id=`. Sort by `vote_count desc`. Include artist display name, studio, piece title, process note, image URL, rank. |

**Acceptance:** Gallery screen loads real submissions; join → submit → appears in gallery.

---

## P0 — Voting

| # | Task | Notes |
|---|------|-------|
| BE-C3.1 | `POST /challenges/:id/votes` | Body: `{ entry_id }`. Enforce: voting window open, voter ≠ entry owner, **one vote per user per track** (upsert/switch vote within same track allowed). |
| BE-C3.2 | `DELETE /challenges/:id/votes/:voteId` or replace via POST | Optional; FE mock allows changing vote within track. |
| BE-C3.3 | Return `my_vote_by_track` on gallery or challenge detail | `{ beginner: entry_id \| null, ... }` |
| BE-C3.4 | Denormalized `vote_count` on entries | Updated transactionally on vote change. |

**Acceptance:** User votes in gallery; counts persist; revote in same track updates count.

---

## P0 — Media

| # | Task | Notes |
|---|------|-------|
| BE-C4.1 | Reuse `POST /uploads/presigned` (ticket #22) | Submission photos flow through post creation first. |
| BE-C4.2 | Challenge hero image | Admin upload or static CDN URL on challenge row. |

---

## P1 — Hall of Fame archive

Replace aggregated “top potters” (#20) with **winner archive** rows.

| # | Task | Notes |
|---|------|-------|
| BE-C5.1 | `GET /hall-of-fame` redesign | Returns `{ cycles: [{ challenge_id, title, label, emoji, hero_image_url, closed_at, winners: [...] }] }` |
| BE-C5.2 | Winner row schema | `id`, `challenge_id`, `track_id`, `track_title`, `entry_id`, `post_id`, `user_id`, `artist_name`, `studio_name`, `piece_title`, `process_note`, `image_url`, `vote_count`, `won_at` |
| BE-C5.3 | Winner computation job | On `voting → closed`: pick max votes per track; tie-breaker: earliest `submitted_at` or curator flag. |
| BE-C5.4 | Immutable archive | Winners not recalculated after publish (unless admin override). |
| BE-C5.5 | `GET /hall-of-fame/winners/:id` | Single winner detail for deep link (`/hall-of-fame-winner/[id]`). |

**Acceptance:** Hall of Fame tab matches mock cycles; winner detail screen loads from API.

---

## P1 — Leaderboard (live, optional separate endpoint)

| # | Task | Notes |
|---|------|-------|
| BE-C6.1 | Keep `GET /challenges/:id/leaderboard` | Per-track ranked entries during voting only. Same shape as gallery sort. |
| BE-C6.2 | Hide leaderboard after close | FE shows archive instead. |

---

## P2 — Notifications & feed

| # | Task | Notes |
|---|------|-------|
| BE-C7.1 | Push 48h before submission deadline (ticket #70) | Joined + not submitted. |
| BE-C7.2 | Push when voting opens | All joined users. |
| BE-C7.3 | Push to winners on close | Optional celebration. |
| BE-C7.4 | Feed injection | `GET /feed` may include `type: challenge_prompt` card during voting (or FE-only until BE-C2.5). |

---

## P2 — Moderation & security

| # | Task | Notes |
|---|------|-------|
| BE-C8.1 | Rate limit votes | e.g. 30/min per user. |
| BE-C8.2 | Report entry endpoint | Future; hide from gallery pending review. |
| BE-C8.3 | Admin: disqualify entry | Removes from vote totals + winner eligibility. |

---

## Suggested API shapes (reference)

### Challenge (list item)

```json
{
  "id": "uuid",
  "title": "Underwater Forms",
  "description": "Let the ocean move your hands…",
  "label": "Seasonal Challenge",
  "emoji": "🌊",
  "hero_image_url": "https://…/under.jpg",
  "status": "voting",
  "starts_at": "2026-05-01T00:00:00Z",
  "submissions_close_at": "2026-05-28T23:59:59Z",
  "voting_close_at": "2026-06-04T23:59:59Z",
  "participant_count": 162,
  "tracks": [
    { "id": "beginner", "title": "Beginner Track", "participant_count": 86 }
  ],
  "my_entry_id": "uuid-or-null",
  "my_track_id": "beginner-or-null",
  "has_submitted": true
}
```

### Entry (gallery item)

```json
{
  "id": "uuid",
  "track_id": "intermediate",
  "user_id": "uuid",
  "artist_name": "Tariq B.",
  "studio_name": "Iron Red Works",
  "piece_title": "Reef Vessel",
  "process_note": "Altered form with carved barnacle marks…",
  "image_url": "https://…",
  "post_id": "uuid",
  "vote_count": 52,
  "rank": 1
}
```

### Hall of Fame cycle

```json
{
  "challenge_id": "uuid",
  "title": "Underwater Forms",
  "label": "Seasonal Challenge · Jun 2026",
  "emoji": "🌊",
  "hero_image_url": "https://…",
  "closed_at": "2026-06-01T00:00:00Z",
  "winners": [ /* winner rows */ ]
}
```

---

## FE integration checklist (when BE lands)

| Screen | Mock module today | Wire to |
|--------|-------------------|---------|
| Challenges tab | `useMockChallengeStore` | `GET /challenges` + phase fields |
| Challenge gallery | `MOCK_CHALLENGE_ENTRIES` | `GET /challenges/:id/entries` + vote POST |
| Hall of Fame tab | `MOCK_HALL_OF_FAME_CYCLES` | `GET /hall-of-fame` |
| Winner detail | `findMockWinner` | `GET /hall-of-fame/winners/:id` |
| Join sheet | local mock join | `POST …/entries` with `track_id` |
| Submit sheet | local mock submit | entry update with `post_id` |

Remove `ChallengePhaseDevBar` in production builds once API drives `status`.

---

## Testing notes

- Integration tests: one vote per track, vote switch, self-vote rejected, submit without join rejected, winner job tie-break.
- Seed script: one open, one voting, one closed challenge for QA.
- Align with existing tickets #16–20 before adding duplicate endpoints.

---

## Out of scope (V1)

- Comments on entries
- Jury / curator override UI
- Cross-challenge “all-time” potter rankings (old #20 aggregate) — defer unless product wants both archive + stats tabs
