# Kiln Tab — Implementation Tasks

**Purpose:** Complete the **KILN (CORE)** feature — log what fired, when, and if it worked; track kiln performance over time.

**Last updated:** June 19, 2026  
**Current completion:** ~55–60% (kiln CRUD, session workflow, and per-kiln history exist; retroactive firing log, temp/hold fields, and spec UX do not)

### Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| 🟡 | Partial — started, gaps remain |
| ❌ | Not started |

### What exists today

- Tab: **Kiln** (`app/(tabs)/kiln.tsx` → `KilnScreen`)
- Sub-tabs: **Sessions** / **Queue** / **Kilns**
- Kiln CRUD: `AddKilnModal` + `AddKilnModalForm` (rich studio profile, not spec-minimal form)
- Firing **session** workflow: `StartFiringModal` → schedule → timeline states → complete in `FiringDetailModal`
- Per-kiln history: `KilnHistoryScreen` (`app/kiln-history.tsx`)
- Piece queue: bisque / glaze ready pieces, assign at schedule time
- Store: `kilns`, `firings` in `appStore.ts`; sync via `src/services/kilns.ts`, `useKilnsSync.ts`, `useFiringsSync.ts`
- Stage advance on complete: `bone-dry` → `bisque`, `glazing` → `glaze-fired` (`completeFiring`)

### Key gaps vs CORE spec

- No **retroactive “Log Firing”** flow (date, peak temp, hold time, photo, outcome)
- No **`maxTemp`** on kiln or **`peakTemp` / `holdTimeMinutes` / `photoUri`** on firing records
- Kiln cards missing **last fired date**; no **one-tap last-fire lookup**
- History cards show session metadata (cone, cost, duration) — not **peak temp, hold time, firing photo**
- Piece assignment is **upfront** (Start Firing), not **optional post-log** step
- UX differs: kilns buried in third tab; edit/delete via icons (not tap-to-edit / swipe-to-delete)
- Kiln type **`pit`** missing (app has `studio` instead)
- Outcome notes **optional** even for issues (spec requires notes when issue)

### Product decision (record before building)

The app today is a **studio session manager** (queue, ETAs, multi-state firings). The CORE spec is a **firing journal**. Choose one:

| Option | Approach |
|--------|----------|
| **A — Additive (recommended)** | Keep session workflow; add **Log Firing** as a second path that creates a `completed` firing with log fields |
| **B — Replace** | Simplify tab to spec-only (Active Kilns + history + log); demote or remove Sessions/Queue |

Tasks below assume **Option A** unless noted.

---

## Phase 0 — Data model & store

Foundation for log fields and last-fired lookup.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Add `maxTempC?: number` to `Kiln` (default 1300 on create) | ❌ | `src/types/kiln.ts` |
| 0.2 | Add `pit` to `KilnType` (`electric` \| `gas` \| `wood` \| `pit`); decide fate of `studio` | ❌ | Map `studio` → shared profile or keep both |
| 0.3 | Add firing log fields to `Firing`: `firedDate`, `peakTempC`, `holdTimeMinutes`, `photoUri` | ❌ | Distinct from `startedAt`/`completedAt` session timeline |
| 0.4 | Add `logSource?: 'session' \| 'manual'` to distinguish workflow vs retroactive log | ❌ | Helps UI and analytics |
| 0.5 | Derive / persist `lastFiredAt` on kiln (computed on save or stored denormalized) | ❌ | Update when any firing completes or manual log saves |
| 0.6 | Store helper: `getLastFiringForKiln(kilnId)`, `getKilnPerformanceStats(kilnId)` | ❌ | Success rate, avg peak temp, avg hold — for history header |
| 0.7 | `logFiring(kilnId, payload)` action — creates completed firing + updates kiln `lastFiredAt` | ❌ | `appStore.ts` |
| 0.8 | `assignPiecesToCompletedFiring(firingId, pieceIds)` — advance stages + link outcome | ❌ | See Phase 5 |
| 0.9 | Migration in persist layer for existing kilns/firings (defaults, no breakage) | ❌ | Bump persist version |
| 0.10 | Update `src/services/kilns.ts` + firings sync mappers for new fields | ❌ | Coordinate with backend API |

**Acceptance:** New fields persist locally; existing kilns and firings load without breakage.

---

## Phase 1 — Add / edit kiln (spec-aligned fields)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Add **Max temp (°C)** number input, default 1300 | ❌ | Required field per spec |
| 1.2 | Add **`pit`** to type dropdown | ❌ | `src/screens/kiln/constants.ts`, `AddKilnModalForm` |
| 1.3 | Spec-minimal mode OR simplify form: Name*, Type*, Max temp*, Notes | 🟡 | Today: photo, cone, shelves, pricing, queue delays — keep advanced fields collapsed? |
| 1.4 | Validate: name + type + max temp required before save | ❌ | |
| 1.5 | Show max temp on `KilnCard` and history header | ❌ | Replace or supplement cone range on card |

**Acceptance:** User can create a kiln matching spec fields (name, type, max temp, notes).

---

## Phase 2 — Kiln management screen (tab home UX)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | **Active Kilns** as primary/default view (not third sub-tab) | ❌ | Reorder or replace Sessions/Queue/Kilns layout |
| 2.2 | Kiln card: **name**, **max temp**, **last fired date** (“Never fired” if empty) | ❌ | `KilnCard.tsx` |
| 2.3 | **Tap card → edit kiln** (not only ⋮ icon) | ❌ | |
| 2.4 | **Swipe to delete** kiln (with confirm sheet) | ❌ | Today: trash icon + `ConfirmSheet` |
| 2.5 | **+ Add Kiln** button prominent at top of Active Kilns section | 🟡 | Exists in Kilns sub-tab header |
| 2.6 | One-tap **last fired** on card (e.g. “Last fired June 15, 2026” tappable → history) | ❌ | Satisfies quick-lookup acceptance criterion |
| 2.7 | Decide placement of Sessions/Queue (keep as secondary tabs or move under kiln detail) | ❌ | Product decision (Option A vs B) |

**Acceptance:** User sees all kilns at a glance with max temp and last fire date; edit/delete match spec gestures.

---

## Phase 3 — Log Firing screen

Core missing feature.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | **+ Log Firing** entry point on kiln detail / history screen | ❌ | `KilnHistoryScreen` — no button today |
| 3.2 | New `LogFiringModal` or screen: **Date** (picker, default today) | ❌ | |
| 3.3 | **Peak temp (°C)** number input | ❌ | |
| 3.4 | **Hold time (minutes)** number input | ❌ | Display as “Hold: 45 min” in history |
| 3.5 | **Photo** optional (camera / gallery via `usePhotoPicker`) | ❌ | Store on `Firing.photoUri` |
| 3.6 | **Outcome** radio: success / issue (map `issue` → `issues` in model) | 🟡 | Completion form has success/issues/failure; spec is binary success/issue |
| 3.7 | **Outcome notes** textarea — **required if issue** | ❌ | Validate before save |
| 3.8 | Save → `logFiring()` creates `state: 'completed'` record with timestamps | ❌ | |
| 3.9 | Optional: also expose Log Firing from main Kiln tab header (alongside New Firing) | ❌ | Product decision |

**Acceptance:** User can record a past firing with date, temp, hold, photo, and outcome without scheduling a session.

---

## Phase 4 — Firing history (per kiln)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Header: **“{Kiln name} — Firing History”** | 🟡 | Shows kiln name; add “Firing History” suffix |
| 4.2 | Chronological list, **newest first** | ✅ | `KilnHistoryScreen` |
| 4.3 | History card: **date** (e.g. “June 15, 2026”) from `firedDate` or `completedAt` | 🟡 | Uses `formatReadyDate(completedAt)` today |
| 4.4 | History card: **peak temp** (e.g. “1240°C”) | ❌ | |
| 4.5 | History card: **hold time** (e.g. “Hold: 45 min”) | ❌ | Not cycle duration |
| 4.6 | History card: **outcome badge** (🟢 Success / ⚠️ Issue) | 🟡 | Text badge exists; add emoji per spec |
| 4.7 | History card: **thumbnail photo** when `photoUri` set | ❌ | |
| 4.8 | **Tap card → expand inline** for full details | ❌ | Today opens `FiringDetailModal` |
| 4.9 | Expanded detail: all log fields + linked pieces + outcome notes | 🟡 | Modal has session/piece info; add log fields |
| 4.10 | **+ Log Firing** FAB or header button on history screen | ❌ | |
| 4.11 | Performance summary: success rate over time, avg peak temp (when log fields exist) | 🟡 | Partial stats (success %, avg cost) — extend for temp |

**Acceptance:** History reads like a firing log, not only a session receipt.

---

## Phase 5 — Piece assignment (post-log)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | After Log Firing save: prompt **“Assign pieces to this firing?”** (optional, skippable) | ❌ | Second step or bottom sheet |
| 5.2 | Checkbox list: pieces in **`glazing`** stage (spec: `glaze_applied` — align naming in copy or add alias) | 🟡 | Queue already filters `glazing`; reuse `ReadyPieceRow` patterns |
| 5.3 | On confirm: set piece stage → **`glaze-fired`**, update timeline timestamp | 🟡 | `completeFiring` does this for session path |
| 5.4 | Link **piece outcome** to firing result (e.g. piece `status` or timeline note from firing outcome) | ❌ | On issue, propagate to assigned pieces |
| 5.5 | Show assigned pieces on history card and expanded detail | 🟡 | Piece count exists; show thumbnails/names |
| 5.6 | Allow assign/edit pieces on manual logs after the fact | ❌ | Session path allows add/remove during active firing only |

**Acceptance:** User can optionally tag glaze-ready pieces immediately after logging a firing.

---

## Phase 6 — Integrate with existing session workflow

Avoid two disconnected systems.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | On session **complete**, prompt for peak temp + hold time (optional or required) | ❌ | Backfill log fields from session path |
| 6.2 | Map session completion → same history card format as manual logs | ❌ | Unified `FiringHistoryCard` component |
| 6.3 | Session firings: capture firing photo at completion (optional) | ❌ | |
| 6.4 | `StartFiringModal`: clarify label **“Schedule Firing”** vs **“Log Firing”** to reduce confusion | 🟡 | Header says “New Firing” / “Start Firing” today |
| 6.5 | Wire `handleStartFiringFromKiln` from kiln card or history (currently unused in UI) | ❌ | Hook exists in `useKilnScreen` |
| 6.6 | Require outcome notes when `issues` selected in `FiringDetailContent` completion form | ❌ | Placeholder says “optional” today |

**Acceptance:** Scheduled sessions and manual logs appear in one history list with consistent fields where available.

---

## Phase 7 — Backend sync & polish

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Extend firings API payload with `peakTempC`, `holdTimeMinutes`, `photoUri`, `firedDate` | ❌ | Mirror in sync hooks |
| 7.2 | Upload firing photo to backend if other photos are synced | ❌ | Follow piece/glaze photo patterns |
| 7.3 | Overview / hero widgets: last kiln fire date (cross-link to history) | ❌ | `LiveStudioStateHero` may reference kiln state |
| 7.4 | Notifications: kiln ready — ensure they still work with log-only firings | 🟡 | `useNotificationTriggers.ts` |
| 7.5 | Premium gate audit for kiln/firing limits | 🟡 | `premiumGate.ts` |
| 7.6 | Empty states: “Log your first firing” CTA on empty history | 🟡 | Empty state exists for completed firings |
| 7.7 | Accessibility: form labels, outcome radios, swipe actions | ❌ | |

---

## Recommended build order

1. **Phase 0** — Data model (`maxTemp`, log fields, `lastFiredAt`, store actions)
2. **Phase 1 + 2** — Kiln form + Active Kilns UX (unblocks quick lookup)
3. **Phase 3 + 4** — Log Firing + history cards (core spec value)
4. **Phase 5** — Post-log piece assignment
5. **Phase 6** — Unify session completion with log fields
6. **Phase 7** — Sync, overview hooks, polish

---

## Spec acceptance checklist

| Criterion | Status |
|-----------|--------|
| Create kiln | 🟡 |
| View all kilns + edit/delete | 🟡 |
| Log firing (date, temp, hold time, photo, outcome) | ❌ |
| View firing history per kiln (chronological) | 🟡 |
| Assign pieces to firing | 🟡 |
| Quick lookup: “When did I last fire Kiln 1?” (one tap) | ❌ |

---

## Key files

| Area | Path |
|------|------|
| Tab entry | `app/(tabs)/kiln.tsx` |
| Main screen | `src/screens/kiln/KilnScreen.tsx` |
| Screen hook | `src/screens/kiln/hooks/useKilnScreen.ts` |
| Kiln history | `app/kiln-history.tsx`, `src/screens/kiln/KilnHistoryScreen.tsx` |
| Add / edit kiln | `src/screens/kiln/components/AddKilnModal.tsx`, `AddKilnModalForm.tsx` |
| Kiln card | `src/screens/kiln/components/KilnCard.tsx` |
| Schedule firing | `src/screens/kiln/components/StartFiringModal.tsx`, `StartFiringModalContent.tsx` |
| Firing detail | `src/screens/kiln/components/FiringDetailModal.tsx`, `FiringDetailContent.tsx` |
| Types | `src/types/kiln.ts` |
| Constants | `src/screens/kiln/constants.ts` |
| Store | `src/store/appStore.ts` |
| Sync | `src/services/kilns.ts`, `useKilnsSync.ts`, `useFiringsSync.ts` |
| Piece stages | `src/types/pieces.ts`, `FIRING_TARGET_STAGE` in constants |
