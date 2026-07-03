# Frontend — V1 Release & Feature Roadmaps

**Total: 86 tickets** — 63 FE · 21 BE · 2 FE+BE  
**Last updated:** June 26, 2026  
**Backend work:** [`BACKEND-TASKS.md`](./BACKEND-TASKS.md) · [`BACKEND.md`](./BACKEND.md)

---

## Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done — acceptance criteria met |
| 🟡 | Partial — started, gaps remain |
| ❌ | Not started |
| 🔶 | Backend only — see BACKEND-TASKS.md (FE client may exist) |

## Progress snapshot

| Status | Count |
|--------|-------|
| ✅ Done | 36 |
| 🟡 Partial | 12 |
| ❌ Not started | 23 |
| 🔶 BE only | 15 |

> BE tickets marked 🔶 are tracked in [`BACKEND-TASKS.md`](./BACKEND-TASKS.md).

---

## Recommended next (FE priority)

1. **#1** — Remove `reopenGeneralOnboarding()` from `app/index.tsx` (still under `__DEV__`)
2. **#61, #62** — Verify premium gates in UI (photo cloud sync + analytics nav from Profile)
3. ~~**#28, #20**~~ — Hall of Fame winner detail API; prod mock fallbacks removed
4. **#38, #39** — Role-based kiln default view + pricing screen labels
5. **#15** — Free-tier missions cap (3/week)
6. **#47–48** — PostHog telemetry
7. **#71–72** — Jest setup + utility unit tests
8. **#88–90** — Notification lifecycle tests, quiet hours, deep links
9. ~~**Account revive UX**~~ ✅ — `AccountDeletedGate` + soft-delete copy
10. **BE parallel** — `GET /users/me/preferences` + extended pieces sync (journal, pricing)

---

## Key decisions

### User roles
- Keep all 5 onboarding archetypes for V2 segmentation
- V1 behavioural differences: kiln tab default view, pricing labels, analytics card order
- Studio member linking needs product study before deeper onboarding integration

### Monetization
- Freemium · €4.99/mo · €34.99/yr · RevenueCat
- Free: unlimited pieces, kiln ops, community, 1 photo/piece, 15 glazes, 1 companion (Earth default)
- Premium: unlimited photos/glazes, all companions + swap, analytics, full pricing, kiln analytics, export, unlimited missions

### Kilnkins
- 4 elements: Fire, Earth, Air, Water — all selectable at onboarding; swap post-onboarding = premium

### Community
- Real backend required for V1 UGC
- **Events sub-tab hidden for V1** — focus on feed → challenge → vote → Hall of Fame
- Challenge gallery/voting: mock store today → wire when BE P0-8/9 lands

### Analytics
- FE-computed from local store at `app/analytics.tsx` + `computeStudioStats.ts`
- Premium-gated (#62 not wired)

### Onboarding
- 3 steps: Welcome → Role → Kilnkin; pricing moved to Overview setup quest
- Library tab cut from V1

### Profile (recent — June 2026)
- Photo grid, posts archive, journey screen, share URLs (`potterynook.app/user/{id}`)
- Public profile route `app/user/[id].tsx` — wired; verify privacy + friends in prod
- Feed author tap → `/user/{id}`
- Edit Profile modal: name, studio, location, bio — **`PUT /users/me` wired** (`useUpdateProfile`, #91 ✅)
- Privacy toggles — **`PUT /users/me/privacy` wired** (#14 ✅)
- Post creation — **multipart `POST /uploads` + `POST /users/me/posts`** (#24 ✅)

---

## 🔴 Critical bugs (2)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 1 | 🟡 | Remove dev onboarding reset | No `reopenGeneralOnboarding()` except intentional dev tooling. **Gap:** still in `__DEV__` in `app/index.tsx` |
| 2 | ✅ | Replace hardcoded profile stats | Stats from store; mocked data unused |

---

## 🔐 Auth (4)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 3 | ✅ | Password reset screen | `app/forgot-password.tsx` |
| 4 | ✅ | Password reset BE (Ory) | FE wired and BE working
| 5 | ✅ | Real account deletion call | `DELETE /users/me` + logout |
| 6 | ✅ | DELETE /users/me + revive grace | Soft-delete; `AccountDeletedGate` on 403 `account_deleted` |

---

## 🧱 Pieces & backend sync (5)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 7 | 🔶 | Pieces REST API | [BACKEND P0-3](./BACKEND-TASKS.md) — FE wired |
| 8 | ✅ | Wire offline sync to real API | `useOfflineSync` |
| 9 | ✅ | `backendId` + login reconciliation | |
| 10 | 🔶 | Kiln REST API | [BACKEND P0-4](./BACKEND-TASKS.md) |
| 11 | ✅ | Wire kiln/firing mutations | Local-first sync |

---

## 👤 Profile (3)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 12 | ✅ | Compute real stats | Live KEY_STATS from store |
| 91 | ✅ | Wire Edit Profile to backend | `EditProfileModal` → `useUpdateProfile()` → `PUT /users/me`; hydrate from `GET /users/me` |
| 89 | 🔶 | Friends list 500 | [BACKEND P0-1](./BACKEND-TASKS.md) — FE shows 0 on failure |

---

## ⚙️ Settings (2)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 13 | ✅ | Notification toggles | Implemented or hidden — no silent no-ops |
| 14 | ✅ | Wire privacy toggles | `PrivacySettingsScreen` → `useUpdatePrivacy()` → `PUT /users/me/privacy` |

---

## 🎭 User roles (4)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 37 | ✅ | Onboarding role picker revamp | 5 distinct cards |
| 38 | ❌ | Kiln tab default view by role | Studio owner → Operations; others → Ready Pieces |
| 39 | ❌ | Pricing screen labels by role | Firing fee vs sales revenue copy |
| 40 | ✅ | Analytics card emphasis by role | Card order differs by role |

---

## 🌱 Community — backend (7)

All tracked in [`BACKEND-TASKS.md`](./BACKEND-TASKS.md) P0-6 through P1-7.

| # | Status | Ticket |
|---|--------|--------|
| 16 | 🔶 | Post + feed API |
| 17 | 🔶 | Reaction API |
| 18 | 🔶 | Challenge API (+ tracks/voting: P0-8/9) |
| 19 | ✅ | Polls API |
| 20 | 🔶 | Hall of Fame (winner archive: P1-6) |
| 21 | 🔶 | Admin news API |
| 22 | 🔶 | Media upload | Server-side `POST /uploads` (multipart) — FE wired |

---

## 🌱 Community — frontend (7)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 23 | ✅ | Wire feed to real API | Pagination, refresh, skeleton |
| 24 | ✅ | Post creation flow | Text + photo via `uploadPostPhotoAsset` → `POST /uploads` → `asset_ids` on `POST /users/me/posts` |
| 25 | ✅ | Real reactions | Optimistic + persisted |
| 26 | ✅ | Challenge join/submit/withdraw | Basic flow wired |
| 27 | ✅ | Poll voting | |
| 28 | 🟡 | Hall of Fame real data | API wired; prod uses live archive; mock fallback dev-only. Winner detail via `GET /hall-of-fame/winners/:id` |
| 29 | ❌ | Pottery news section | `GET /news` cards in feed |

---

## 📊 Analytics — frontend (7)


| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 30 | 🟡 | Screen shell + nav | `app/analytics.tsx`; **Gap:** no Profile entry, no premium gate |
| 31 | ✅ | Studio summary card | |
| 32 | ✅ | Kiln & firing costs | |
| 33 | ✅ | Avg time in stage | |
| 34 | ✅ | Clay body usage | |
| 35 | ✅ | Glaze usage | |

---

## 🎨 Onboarding redesign (7)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 49 | ✅ | 3-step flow | welcome → role → kilnkin |
| 50 | 🟡 | Illustration layout | Only Welcome uses `IllustrationSlot` |
| 51 | 🟡 | Welcome step | Placeholder asset |
| 52 | 🟡 | Role step | Icons yes; illustration slots partial |
| 53 | 🟡 | Kilnkin step | 4 elements + swipe; scene illustrations partial |
| 54 | ✅ | Entry celebration | Overlay → Overview |
| 55 | ✅ | Pricing → Overview quest | |

---

## 🐾 Kilnkins (2)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 84 | ✅ | 4-element companion system | Fire/Earth/Air/Water |
| 85 | ✅ | Companion swap UI in Profile | Premium-gated picker in Account Settings |

---

## 💳 Monetization & premium (9)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 56 | ✅ | RevenueCat SDK | `useEntitlements()` |
| 57 | 🔶 | RC webhook | [BACKEND P1-13](./BACKEND-TASKS.md) |
| 58 | ✅ | `checkPremium()` utility | |
| 59 | 🟡 | Paywall sheet | Redirects to `/premium` vs inline sheet |
| 60 | ✅ | Upgrade screen | `app/premium.tsx` |
| 61 | ❌ | Photo gate | 1 cover free |
| 62 | ❌ | Analytics gate | |
| 64 | ❌ | Companion swap gate | |
| 65 | ✅ | Glaze atlas gate (15) | `canAddGlaze()` wired |

---

## 📈 Product telemetry (2)

| # | Status | Ticket |
|---|--------|--------|
| 47 | ❌ | PostHog SDK |
| 48 | ❌ | Key feature events |

---

## 🔔 Notifications (5 + backlog)

| # | Status | Ticket | Acceptance |
|---|--------|--------|------------|
| 66 | ✅ | Push token registration | `usePushTokenSync` + toggle sync → `POST /users/me/push-tokens` |
| 67 | ✅ | Kilnkin-voiced local service | |
| 68 | ✅ | Kiln + drying triggers | |
| 69 | ✅ | Studio rhythm + weekly summary | |
| 70 | 🔶 | Challenge deadline push | [BACKEND P2-6](./BACKEND-TASKS.md) |
| 86 | ✅ | Push token sync to BE | `syncPushTokenWithBackend` on launch, pref change, token refresh |
| 87 | 🔶 | Challenge join contract on API | [BACKEND P0-8](./BACKEND-TASKS.md) |
| 88 | ❌ | Trigger unit tests | |
| 89 | ❌ | Lifecycle reschedule guard | |
| 90 | ❌ | Quiet hours + deep links | |

---

## 🧪 Testing (6)

| # | Status | Ticket |
|---|--------|--------|
| 71 | ❌ | Jest setup |
| 72 | ❌ | Utility unit tests |
| 73 | ❌ | Store action tests |
| 74 | ❌ | Maestro E2E |
| 75 | ❌ | Responsiveness audit |
| 76 | ❌ | Pre-release QA checklist |

---

## 🔒 Security (4)

| # | Status | Ticket |
|---|--------|--------|
| 77 | ✅ | SecureStore for session token |
| 78 | ❌ | No PII in logs/telemetry |
| 79 | 🔶 | BE validation + rate limits → [BACKEND P1-15](./BACKEND-TASKS.md) |
| 80 | 🔶 | BE upload security → [BACKEND P1-16](./BACKEND-TASKS.md) |

---

## ⚡ Performance (3)

| # | Status | Ticket |
|---|--------|--------|
| 81 | ❌ | FlashList migration |
| 82 | 🟡 | expo-image lazy loading | Partial |
| 83 | ❌ | Startup time audit |

---

## 🚀 App store & quality (5)

| # | Status | Ticket |
|---|--------|--------|
| 41 | 🟡 | Production splash |
| 42 | 🟡 | Privacy policy URL |
| 43 | ✅ | Empty states |
| 44 | 🟡 | Error states + retry |
| 15 | ❌ | Free-tier missions cap (3/week) |

---

## Ticket count summary

| Area | ✅ | 🟡 | ❌ | 🔶 |
|------|---|---|---|---|
| Critical / Auth / Sync | 6 | 2 | 0 | 3 |
| Profile / Settings / Roles | 6 | 0 | 2 | 1 |
| Community | 5 | 1 | 1 | 7 |
| Analytics / Onboarding | 8 | 5 | 1 | 0 |
| Premium / Telemetry | 5 | 1 | 3 | 1 |
| Notifications / Testing / Security / Perf / App | 6 | 3 | 13 | 3 |
| **Total** | **36** | **12** | **23** | **15** |

---

# Feature roadmaps (post-V1 / in-progress)

Detailed phase tracking for major tabs. V1 ticket numbers above take precedence for release scope.

---

## Kiln tab (~80–85% complete)

**Entry:** `app/(tabs)/kiln.tsx` → `KilnScreen`  
**Product decision:** Option A — keep session workflow + separate **Log Firing** for retroactive journal entries.

### Done
- Kiln CRUD with max temp, pit type, rich studio profile
- Log Firing modal (date, peak temp, hold, photo, outcome, inline piece picker)
- Session workflow with manual status overrides
- Per-kiln history, performance stats, piece assignment on completed firings
- Local persist v7; local-first sync (basic fields)

### Remaining (recommended order)

| Phase | Task | Status |
|-------|------|--------|
| 6 | Session complete → prompt peak temp + hold + photo | ❌ |
| 6 | Unified history card (session + manual logs) | ❌ |
| 6 | Clarify Schedule vs Log Firing labels | 🟡 |
| 7 | Backend sync for log fields + firing photo | ❌ → [BACKEND P0-4](./BACKEND-TASKS.md) |
| 7 | Overview hero last-fired link | ❌ |
| 3 | Log Firing from main tab header | ❌ |
| Polish | Outcome icons on history cards (replace emoji) | 🟡 |

**Key files:** `src/screens/kiln/`, `src/types/kiln.ts`, `useKilnsSync`, `useFiringsSync`

---

## Glaze tab (~65–70% atlas · ~35–40% full tracker)

**Entry:** `app/(tabs)/library.tsx` → My Atlas / Discover  
**Vision:** Recipe library → full glaze tracker (mix log → glazing process → firing → unload).

### Done
- Add/edit batches, version chain, compare, collections, filters, batch scaler
- Test tile logging + stats; Discover recipes + layering ideas (bundled)
- Share/save community recipes with provenance; premium 15-glaze gate
- Single `glazeId` + `glazeOutcome` on piece (local); piece glaze link card

### Gap vs studio glaze journal

| Practice | Status |
|----------|--------|
| Per-mix session history | ❌ |
| Glaze stack on piece (over/under) | ❌ |
| Glazing process notes (dip time, coats) | ❌ |
| Unload review tied to glaze notes | ❌ |
| Piece glaze sync cross-device | ❌ → [BACKEND P0-10](./BACKEND-TASKS.md) |
| Batch metadata sync cross-device | ❌ → [BACKEND P0-11](./BACKEND-TASKS.md) |

### Recommended build order

1. **Mix log** (FE-1.x) — dated mix entries with scaled grams + notes
2. **Glaze stack + notes on piece** (FE-2.x)
3. **Unload review on firing complete** (FE-3.x) — ties to [Kiln tab](#kiln-tab-8085-complete)
4. **Test tile detail screen** (FE-5.1)
5. **Backend P0** — piece↔glaze + batch metadata sync

**Key files:** `src/screens/library/`, `src/screens/glazes/`, `useGlazesSync`, `PieceGlazeLinkSection.tsx`

---

## Community challenge (mock → real API)

| Screen | Replace mock with |
|--------|-------------------|
| Challenges tab | `GET /challenges` + phase/status |
| Gallery | `GET /challenges/:id/entries` + vote POST |
| Hall of Fame | `GET /hall-of-fame` winner cycles |
| Winner detail | `GET /hall-of-fame/winners/:id` |

Remove `ChallengePhaseDevBar` in production once API drives `status`.

---

## Documentation map

| File | Purpose |
|------|---------|
| **FRONTEND.md** (this file) | V1 tickets, decisions, FE roadmaps |
| **README.md** | Project setup + doc index |

