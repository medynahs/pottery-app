# Kiln Tab — Implementation Tasks

**Purpose:** Complete the **KILN (CORE)** feature — log what fired, when, and if it worked; track kiln performance over time.

**Last updated:** June 19, 2026  
**Current completion:** ~80–85% (Option A largely built locally; backend sync and session/log unification remain)

### Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| 🟡 | Partial — started, gaps remain |
| ❌ | Not started |

### What exists today

- Tab: **Kiln** (`app/(tabs)/kiln.tsx` → `KilnScreen`)
- Sub-tabs: **Active Kilns** (default) / **Sessions** / **Queue**
- Kiln CRUD: `AddKilnModal` + `AddKilnModalForm` (max temp, pit type, rich studio profile)
- **Log Firing** (retroactive): `LogFiringModal` — date, peak temp, hold, photo, outcome, inline piece picker + cost breakdown
- Firing **session** workflow: `StartFiringModal` → schedule → auto timeline → manual status overrides → complete in `FiringDetailModal`
- Per-kiln history: `KilnHistoryScreen` with `FiringLogHistoryCard` (manual logs) + session cards
- Piece assignment: at schedule time, in Log Firing modal, and editable on completed firings via `setCompletedFiringPieces`
- Store: `logFiring`, `setCompletedFiringPieces`, `setFiringStatusOverride`, persist **v7**, `kilnHelpers.ts`
- Sync: local-first via `useKilnsSync` / `useFiringsSync` — **log fields not sent to API yet**

### Remaining gaps vs CORE spec

- Session completion does not backfill **peak temp / hold / photo** (Phase 6)
- Two history card types — manual logs vs session receipts not fully unified
- **Backend sync** for new kiln/firing fields and firing photos (Phase 7)
- Overview hero **last-fired** cross-link not wired
- `StartFiringModal` vs **Log Firing** labeling still easy to confuse
- Firings API / `useFiringsSync` do not round-trip `peakTempC`, `holdTimeMinutes`, `firedDate`, `photoUri`, `statusOverride`

### Product decision (recorded)

**Option A — Additive** (in use): keep session workflow; **Log Firing** is a second path for retroactive journal entries.

---

## Phase 0 — Data model & store

Foundation for log fields and last-fired lookup.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Add `maxTempC?: number` to `Kiln` (default 1300 on create) | ✅ | `src/types/kiln.ts`, `normalizeKiln()` |
| 0.2 | Add `pit` to `KilnType`; keep `studio` for shared profiles | ✅ | `electric` \| `gas` \| `wood` \| `pit` \| `studio` |
| 0.3 | Add firing log fields: `firedDate`, `peakTempC`, `holdTimeMinutes`, `photoUri` | ✅ | On `Firing` type |
| 0.4 | Add `logSource?: 'session' \| 'manual'` | ✅ | Set to `'manual'` in `logFiring()` |
| 0.5 | Derive / persist `lastFiredAt` on kiln | ✅ | Updated on complete + manual log |
| 0.6 | Helpers: `getLastFiringForKiln`, `getKilnPerformanceStats`, etc. | ✅ | `src/screens/kiln/utils/kilnHelpers.ts` |
| 0.7 | `logFiring(kilnId, payload)` | ✅ | Creates completed firing + economics |
| 0.8 | `assignPiecesToCompletedFiring` + `setCompletedFiringPieces` | ✅ | Full add/remove with cost recalc |
| 0.9 | Persist migration v7 for existing kilns/firings | ✅ | `appStore.ts` |
| 0.10 | Update `src/services/kilns.ts` + firings sync mappers | ❌ | Local fields preserved on merge only; not sent to API |

**Acceptance:** ✅ New fields persist locally; existing records load without breakage.

---

## Phase 1 — Add / edit kiln (spec-aligned fields)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | **Max temp (°C)** input, default 1300 | ✅ | `AddKilnModalForm` |
| 1.2 | **`pit`** in type dropdown | ✅ | `constants.ts`, form |
| 1.3 | Spec-minimal mode OR collapse advanced fields | 🟡 | Full form kept (photo, cone, shelves, pricing, queue delays) |
| 1.4 | Validate: name + type + max temp required | ✅ | `AddKilnModal.tsx` |
| 1.5 | Show max temp on `KilnCard` and history header | ✅ | `getKilnMaxTempLabel()` |

**Acceptance:** ✅ User can create a kiln with name, type, max temp, notes (+ advanced fields).

---

## Phase 2 — Kiln management screen (tab home UX)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | **Active Kilns** as primary/default view | ✅ | Default `sectionMode === 'kilns'` |
| 2.2 | Kiln card: name, max temp, last fired date | ✅ | `KilnCard.tsx` |
| 2.3 | **Tap card → edit kiln** | ✅ | Card `onPress` opens edit modal |
| 2.4 | **Swipe to delete** kiln (confirm sheet) | ✅ | `KilnSwipeCard` + `ConfirmSheet` |
| 2.5 | **+ Add Kiln** prominent in Active Kilns header | ✅ | `LogFiringButton`-style Add Kiln pill |
| 2.6 | One-tap **last fired** → history | ✅ | Tappable label on card |
| 2.7 | Sessions/Queue placement decision | ✅ | Kept as secondary tabs (Option A) |

**Acceptance:** ✅ Kilns at a glance with max temp, last fire, edit/delete gestures.

---

## Phase 3 — Log Firing screen

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | **+ Log Firing** on kiln card + history screen | ✅ | `LogFiringButton` on `KilnCard`, `KilnHistoryScreen` |
| 3.2 | `LogFiringModal`: **Date** picker (default today) | ✅ | `DatePickerField` |
| 3.3 | **Peak temp (°C)** | ✅ | Required |
| 3.4 | **Hold time (minutes)** | ✅ | Required; `formatHoldTime()` in history |
| 3.5 | **Photo** optional | ✅ | `usePhotoPicker` + `MediaSlot` |
| 3.6 | **Outcome**: success / issue | ✅ | Maps to `issues` in model; session form still has failure too |
| 3.7 | **Outcome notes** required if issue | ✅ | Validated before save |
| 3.8 | Save → `logFiring()` completed record | ✅ | Includes pieces, costs, stage advance |
| 3.9 | Log Firing from main tab header | ❌ | Only via kiln card / history today |

**Acceptance:** ✅ Retroactive firing log without scheduling a session.

---

## Phase 4 — Firing history (per kiln)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Header: **“{Kiln name} — Firing History”** | ✅ | `KilnHistoryScreen` |
| 4.2 | Chronological list, newest first | ✅ | |
| 4.3 | History card date from `firedDate` or `completedAt` | ✅ | `getFiringDisplayDate()` |
| 4.4 | History card: **peak temp** | ✅ | `FiringLogHistoryCard` summary line |
| 4.5 | History card: **hold time** | ✅ | |
| 4.6 | History card: **outcome badge** | 🟡 | Icons in detail modal; log cards still use emoji in collapsed line |
| 4.7 | History card: **thumbnail photo** | ✅ | Collapsed + expanded |
| 4.8 | **Tap card → expand inline** | ✅ | `FiringLogHistoryCard` expand; session cards open modal |
| 4.9 | Expanded: log fields + pieces + cost receipts | ✅ | Inline expand + `FiringDetailModal` |
| 4.10 | **+ Log Firing** on history screen | ✅ | Header + empty state CTA |
| 4.11 | Performance summary (success %, avg temp/hold) | ✅ | Stats row when log data exists |

**Acceptance:** 🟡 Manual logs read as firing journal; session entries still use separate card style.

---

## Phase 5 — Piece assignment (post-log)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Post-log piece assign prompt | ✅ | **Merged inline** into `LogFiringModal` (no separate step) |
| 5.2 | Checkbox list: glaze/bisque-ready pieces | ✅ | `FIRING_SOURCE_STAGE` filtering |
| 5.3 | On confirm: advance stage + timeline | ✅ | `logFiring`, `setCompletedFiringPieces`, `completeFiring` |
| 5.4 | Link piece outcome to firing result on issue | ✅ | `buildFiringEconomics`, `applyGlazeOutcomeToPiece`, `survived` on receipts |
| 5.5 | Show assigned pieces on history + detail | 🟡 | Count + receipt table; thumbnails in detail modal |
| 5.6 | Assign/edit pieces on completed firings | ✅ | **Edit pieces** in `FiringDetailModal` |

**Acceptance:** ✅ Optional piece tagging at log time and after the fact.

---

## Phase 6 — Integrate with existing session workflow

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | On session **complete**, prompt peak temp + hold (+ photo) | ❌ | Session path still skips log fields |
| 6.2 | Unified history card for session + manual logs | ❌ | `FiringLogHistoryCard` vs `FiringHistoryCard` |
| 6.3 | Session firings: photo at completion | ❌ | |
| 6.4 | Clarify **Schedule Firing** vs **Log Firing** labels | 🟡 | “New Firing” header unchanged |
| 6.5 | Wire `handleStartFiringFromKiln` from kiln card/history | ❌ | Hook exists, not in UI |
| 6.6 | Require outcome notes on issues in completion form | ✅ | Disabled submit until notes entered |
| 6.7 | Manual **session status overrides** (early fire / ready / picked up) | ✅ | `SessionStatusPanel` + `setFiringStatusOverride` |

**Acceptance:** 🟡 Sessions trackable with manual overrides; not yet unified with journal history format.

---

## Phase 7 — Backend sync & polish

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Extend firings API: log fields + `statusOverride` | ❌ | `src/services/firings.ts` |
| 7.2 | Upload firing photo to backend | ❌ | |
| 7.3 | Overview hero: last kiln fire → history link | ❌ | `LiveStudioStateHero` |
| 7.4 | Notifications with log-only firings | 🟡 | Not verified end-to-end |
| 7.5 | Premium gate audit for kiln/firing limits | 🟡 | |
| 7.6 | Empty history CTA | ✅ | “Log a firing” + `LogFiringButton` |
| 7.7 | Accessibility: labels, swipe, forms | 🟡 | Partial (`accessibilityLabel` on some controls) |

---

## Recommended build order (remaining)

1. **Phase 6** — Session completion log fields + unified history cards + label clarity
2. **Phase 7** — Backend sync for new fields + firing photo upload
3. **Phase 7.3** — Overview last-fired link
4. **Polish** — Outcome icons on history cards (replace emoji), optional Log Firing in tab header (3.9)

---

## Spec acceptance checklist

| Criterion | Status |
|-----------|--------|
| Create kiln | ✅ |
| View all kilns + edit/delete | ✅ |
| Log firing (date, temp, hold time, photo, outcome) | ✅ |
| View firing history per kiln (chronological) | ✅ |
| Assign pieces to firing | ✅ |
| Quick lookup: “When did I last fire?” (one tap) | ✅ |

---

## Key files

| Area | Path |
|------|------|
| Tab entry | `app/(tabs)/kiln.tsx` |
| Main screen | `src/screens/kiln/KilnScreen.tsx` |
| Screen hook | `src/screens/kiln/hooks/useKilnScreen.ts` |
| Kiln history | `app/kiln-history.tsx`, `src/screens/kiln/KilnHistoryScreen.tsx` |
| Add / edit kiln | `src/screens/kiln/components/AddKilnModal.tsx`, `AddKilnModalForm.tsx` |
| Kiln card / swipe | `KilnCard.tsx`, `KilnSwipeCard.tsx` |
| Log firing | `LogFiringModal.tsx`, `LogFiringButton.tsx` |
| History cards | `FiringLogHistoryCard.tsx`, `FiringHistoryCard` in `KilnHistoryScreen.tsx` |
| Firing detail | `FiringDetailModal.tsx`, `FiringDetailContent.tsx`, `FiringPieceRow.tsx`, `FiringOutcomeBadge.tsx` |
| Session status | `SessionStatusPanel.tsx` |
| Schedule firing | `StartFiringModal.tsx`, `StartFiringModalContent.tsx` |
| Helpers / theme | `utils/kilnHelpers.ts`, `utils/kilnTheme.ts`, `firingEstimations.ts` |
| Types | `src/types/kiln.ts` |
| Constants | `src/screens/kiln/constants.ts` |
| Store | `src/store/appStore.ts` (persist v7) |
| Sync | `src/services/kilns.ts`, `useKilnsSync.ts`, `useFiringsSync.ts` |
| Piece stages | `src/types/pieces.ts`, `FIRING_TARGET_STAGE` in constants |

---

## Recent implementation notes (June 2026)

- **Log Firing UX:** Shared `LogFiringButton`, brown-themed sheets, inline piece/cost picker (replaced post-save `AssignPiecesToFiringModal`).
- **Firing detail:** Brown journal-style UI, full-screen photo lightbox, journal navigation fix, editable completed pieces.
- **Session status:** Plain-language overrides (`SessionStatusPanel`) — early fire, ready early, picked up → completion form; `getScheduledAutoStatus()` for schedule vs adjusted status.
