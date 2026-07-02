# pottery-app FE audit + lean refactor plan

Audited 2026-07-02. 601 TS/TSX files, **81,788 lines**. Product definition this plan optimizes for:

> An offline-first pottery journalling and profile app with BE cloud sync, and a social wrapper
> on top so you can post your journals. Dead simple.

Everything below is ranked biggest cut first. Three end states, pick your stop:

| End state | What it takes | Est. size |
|---|---|---|
| **A. Mechanical** | Delete dead code + dead deps, zero product decisions | ~72k lines, -13 deps |
| **B. Lean product** | A + rip features outside the product sentence + arch cleanup | ~40-45k lines |
| **C. Dead simple** | B + slim the surviving screens to plain components | ~18-22k lines |

Honest note on "one tenth": 8k lines means C **plus** reducing kiln + glaze atlas to bare CRUD
and dropping most decorative/branded UI. The plan gets you to C mechanically; the last 2x is a
product call, flagged in Phase 3.

Where the lines live today:

```
src/screens   60,525   (74%)     overview 18,916 | pieces 10,445 | community 7,785
                                 kiln 7,522 | library 6,150 | glazes 3,571
                                 analytics 3,097 | onboarding 1,568 | premium 890 | auth 581
src/components 8,653             (ui template kit: 2,931)
src/services   3,766   src/store 2,417   src/utils 2,392   src/hooks 1,899   src/types 992
app/             768   (router wrappers, fine)
```

---

## Phase 0 - Mechanical deletions (no product decisions, ~6,000 lines, 13+ deps)

Verified with knip + import greps. Nothing here is reachable from `app/`.

### 0.1 Dead files (31 files, 3,064 lines)

Knip-confirmed unreachable. Highlights, full list from `npx knip`:

- `src/hooks/useNotificationTriggers.ts` (376) and `src/hooks/usePushTokenSync.ts` (59): these
  are the ONLY drivers of local notifications and push-token registration, and nothing imports
  them. **The entire notifications feature has never run.** See 1.6.
- `src/screens/overview/components/StudioScene.tsx` (562) + `studioScene/layerManifest.ts` (229)
- Dead profile-gamification iterations: `TrophyShelfScreen`, `Journey*`, `trophyShelf/*`,
  `AchievementsPreview`, `JourneyAchievementsTeaser`, `ViewAllBadgesCard` (~900 lines of
  abandoned redesigns sitting next to the live one)
- `OverviewMissionsScreen` (211), `Kilnkin.tsx` (188), `AtlasCoverageCard` (105),
  `WidgetCard` (76), plus ~15 small orphaned components
- `scripts/svg-to-png.js` + devDep `@resvg/resvg-js`

### 0.2 Dead dependencies (uninstall, ~40MB of native/bundle weight)

| Package | Evidence | Action |
|---|---|---|
| `axios` | 0 imports (everything uses fetch) | remove |
| `rive-react-native` | 0 imports | remove |
| `expo-custom-assets` | only bundles `assets/rive/` (4.4MB) for the unused Rive | remove plugin + dep + `assets/rive/` |
| `expo-blur`, `expo-symbols`, `expo-haptics` | 0 imports | remove |
| `react-native-worklets-core` | 0 imports (`react-native-worklets` is the real one) | remove |
| `@expo/vector-icons` | 0 imports (lucide is the icon system, 208 files) | remove |
| `expo-camera`, `expo-location`, `expo-media-library` | only imported by dead `ui/permission-requester.tsx` | remove after 0.3 |
| `moti` | 1 import (`ui/toast-overlay`); reanimated already installed | rewrite one fade-in, remove |
| `@gorhom/bottom-sheet` | only real usage is `BottomSheetModalProvider` in the tab layout wrapping nothing (the `ui/sheet.tsx` consumer is dead) | remove provider + dep |
| `expo-notifications` | only dead code imports it (see 1.6) | remove with 1.6 |
| `prettier-plugin-tailwindcss` | no prettier config in repo | remove (or add config and keep) |
| `react-native-web` + `react-dom` | app is iOS/Android; website is a separate brief | remove + drop `web` block from app.json |

Keep even though "unused" by grep: `expo-application`, `expo-device`, `expo-localization`
(optional runtime peers of posthog-react-native), `expo-updates` (OTA configured in app.json),
`expo-dev-client`, `babel-preset-expo`. `@react-navigation/bottom-tabs`, `/native`, `/elements`:
expo-router pulls these transitively; try removing and confirm with `npx expo-doctor` + a build.

### 0.3 Template UI kit (`src/components/ui/`, 2,931 lines, ~1,800 dead)

This repo started from a starter template (package.json still says
`keywords: [template, starter, ui-components]`, author "Ariane Medina"). Actually used:
`text` (238 imports), `card` (25), `input` (22), `button` (17), `SelectChip` (6),
`pressable` (5), `select` (3), `keyboard-form-scroll-view` (3), `keyboard-avoiding-view`,
`badge`, `toast-overlay`, `checkbox`, `OfflineBanner`, `utils/cn`.

Delete the rest: `data-table.tsx` (472!), `drawer.tsx` (292), `dialog`, `sheet`, `flat-list`,
`label`, `permission-requester`, `safe-area-view`, `scroll-view`, `spinner`, `switch` +
`switch.ios`, `checkbox.ios`, `theme`, `view`, `lib/icons`, `utils/platform`, and the barrel
`index.ts` (nothing should import a barrel; two files do, fix them).

### 0.4 Dead store machinery (~350 lines in `appStore.ts`)

- **Legacy sync-op queue**: `SyncOperation`, `SyncOperationType` (13 variants!), `enqueueSyncOp`
  (never called), `pendingSyncOps`, `clearSyncQueue`, the legacy branches in `useOfflineSync`,
  and the `pendingCount` read in `OfflineBanner`. The real sync is `syncDirty` flags +
  `flushPiecesSync`/`flushGlazesSync`. The queue is a fossil of the pre-doc-sync design.
- **Persist migrations v3-v10 + `merge` normalize ladder**: you have zero users. Reset
  `version: 1`, delete `migrate` entirely, shrink `merge` to defaults-spreading, delete
  `LEGACY_SEED_GLAZE_IDS` / `LEGACY_SEED_TEST_IDS` / `migrateStudioRituals` /
  `normalizeGlazeItem`-on-load. Testers reinstall.
- **No-op state**: `markPostDeleted: () => set({})`, `communityFeedRevision` (declared,
  never incremented by anything, forever 0), `communityPostSaveCounts` ("local stub for
  BE-8.5"), `tasks`/`toggleTask`/`addTask`/`clearCompletedTasks` (Today's Routine, superseded
  by rhythm/missions), `devDiscoverGlazeIds` (dev-only, persisted for everyone).

### 0.5 Mock/dev code shipping in src (~700 lines)

- `src/screens/community/mock/` (451) + `mockUnderwaterChallenge` + `challengeWinners` mock
  paths. `ChallengesTab` falls back to these under `__DEV__`; the BE has real challenge
  endpoints. Delete the mock store, let dev hit the real API (or cut challenges entirely, 1.4).
- `src/components/dev/DevPremiumPanel.tsx` + `NotificationDebugPanel.tsx` +
  `src/services/notificationDebug.ts`: keep only if you actively use them this month.

### 0.6 Dead exports and repo hygiene

- 133 unused exports + 48 unused exported types (knip list). Most die with the phases above;
  sweep the rest, then make `npx knip` part of your routine.
- package.json: fix `name`/`author`/`description`, delete template keywords, dedupe
  `start`/`start:dev`/`dev` scripts.
- Delete empty `design/` dir. Move `FRONTEND.md` (402), `MONETIZATION.md`, `WEBSITE-BRIEF.md`
  to `notes/` (same convention as pottery-api).

---

## Phase 1 - Product cuts (the big lever, ~20,000 lines)

Your product sentence keeps: **pieces journal + photos + sync, kilns/firings, glaze atlas,
profile, auth, community feed (post journal, friends)**. Everything below is outside it.
BE endpoints for cut features stay as roadmap surface (decision already made on the API side).

### 1.1 Gamification layer (~6,500 lines) - CUT

The single biggest non-core mass, spread across overview/profile:

- `badgeRegistry.ts` (1,164 lines of badge definitions) + live badges UI
  (`components/badges/*`, `BadgeDetailSheet`, badges route)
- Journey/Chronicle screens (`JourneyScreen`, `chronicle/*`, `journeyTheme`, `profileTheme`
  extras, `app/profile/journey.tsx`)
- Setup quests (`setupQuests/`, `setupProgress`, `initialSetupQuestCount`,
  `SetupModeSection` 373, quest tracking in store)
- Ceremonies (`CeremonyOverlay` 238, `seenCeremonies`)
- Daily missions (`TodaysMissionsWidget` 509, `generateStudioRhythmSuggestions` 346,
  `dailyMissionCompletion`, mission analytics events)
- Achievement counters in store (`challengeWins`, `communityPostsCreated`, etc.)

### 1.2 Kilnkin companions (~2,500 lines) - DECIDE (brand mascot vs bloat)

`kilnkinVoice.ts` (766 lines of dialogue), `kilnkinCompanion`, `KilnkinProfileScreen`,
`KilnkinCompanionPickerSheet`, `KilnkinStep` (332) in onboarding, widget hooks, the
premium "companion swap" gate. It is charming but it is a tamagotchi bolted onto a journal.
If the mascot is the brand, keep ONE companion and delete voice-line variants (~400 lines
survive). If not, cut wholesale.

### 1.3 Studio Rhythm, both versions (~4,000 lines) - CUT

`studioRythm/` (3,205) + store slices for **v1 (`studioRhythmConfig`) AND v2 (`studioRhythm`)**
living side by side + `services/rhythm.ts` + `useRhythmSync` + 8 routes under
`app/profile/studio-rhythm/` + rituals/goals/sprints/drying timers. This is a scheduling app
embedded in a journal. Cutting it also drops 2 of the 3 `react-native-calendars` usages
(the third is `DatePickerField`; replace with a plain native date picker or keep the dep).

### 1.4 Community beyond the wrapper (~4,500 lines) - CUT for v1

The sentence says "post your journals". Keep: `ForYouFeed`, `FeedPostCard`, `CreatePostSheet`,
friends, public profiles, post-from-journal. Cut for now: challenges + gallery + voting +
Hall of Fame (`ChallengesTab` 978, `challenge/*` components, `HallOfFameTab`,
`hall-of-fame-winner/`, `services/challenges` 287), polls (`CommunityPollCard`), studios
(`StudiosTab` 803, `services/studios` 314, studio store slice, invite cards), and the
composer's kiln-share/glaze-share presets if their sources get cut.

### 1.5 Pricing rules engine (~3,000 lines) - CUT

`types/pricing.ts` (501), `PricingRulesScreen` (808), `PricingOnboardingScreen`, pricing
templates CRUD in store (~350), pricing sections in preferences blob, `PricingBreakdownCard`,
`PiecePricingAdjustSheet`, firing economics (`buildFiringEconomics`, receipts, cost-per-piece).
This is a small-business accounting tool inside a journalling app. If "sold price" matters,
keep a single `soldPrice` field on Piece and delete the engine.

### 1.6 Notifications stack (~900 lines + 1 native dep) - CUT (it already doesn't work)

Confirmed dead end to end: `useNotificationTriggers` and `usePushTokenSync` are never mounted,
so nothing schedules local notifications and no push token is ever registered. Yet you ship
`expo-notifications`, `services/notifications.ts` (156), `services/pushTokens.ts` (73),
`notificationMessages`, the debug panel, `notificationPrefs` in store, and a full settings
screen (`OverviewAlertsScreen`) whose toggles feed a system that never runs. Delete all of it;
re-add push in one afternoon when a real trigger exists (BE endpoints stay).

### 1.7 Analytics dashboards (~3,900 lines) - DECIDE (monetization pillar)

`screens/analytics/` (3,097) + `computeStudioStats.ts` (614) + `analyticsPeriods`. It is
premium's headline feature per MONETIZATION.md, so cutting is a business call, not a code
call. If kept: it survives Phase 2 untouched. If the premium pitch can be "unlimited photos +
glazes", cut and win 4k lines.

### 1.8 Discover / curated content (~2,300 lines) - DECIDE

`library/discover/` (2,021) + `services/discover` + dev-discover plumbing. Curated glaze
recipes are content ops, not journalling. Cut for v1 or keep if the content pipeline is real.

### 1.9 Small cuts

- **Custom text-scaling system** (~550): `textScaleStyle` (133), `TextScaleRoot`,
  `useTextScale`, `TextSizePicker`, `text-size` route, scale plumbing in onboarding + store.
  The OS already does this: set `allowFontScaling` (default true) and delete the subsystem.
- **Role archetypes** (~700): 5 onboarding user types + `roleBasedUx.ts` driving cosmetic
  differences. One user type until segmentation is real.
- **Onboarding** shrinks to Welcome + name (~400 lines keep, ~1,100 cut) once Kilnkin step,
  role step, pricing onboarding go.
- **Overview tab**: after 1.1-1.3 the widget zoo (`StudioJournalWidget` 573,
  `LiveStudioStateHero`, `GlazeTestWallWidget`, `FiringQueueWidget`...) collapses into one
  simple home screen (~600 lines keep from 18,916 in the dir; profile subtree moves under
  "profile" mentally but also shrinks per 1.1).

---

## Phase 2 - Architecture simplification (~4,000 lines, applies to whatever survives)

### 2.1 One API client (services 3,766 → ~1,200)

17 service files each hand-roll `fetch` + `res.ok` + error-body parsing, and there are
**8 near-identical error classes** (`ApiError`, `AuthError`, `CommunityApiError`,
`CommunityUploadError`, `FriendsApiError`, `PublicProfileApiError`, `StudiosApiError`...).
Replace with one helper in `services/api.ts`:

```ts
async function api<T>(path: string, init?: RequestInit): Promise<T>
// builds URL, sets JSON headers, throws ApiError(status, code) via apiErrorFromResponse
```

One `ApiError` everywhere (`instanceof` checks already exist for it). Each service becomes
thin typed calls: `apiListFriends = () => api<Friend[]>('/users/me/friends')`. Also delete
the `@deprecated` aliases (`updateMe`, `UpdateMePayload`) and `avatarDataUri` (unused).

### 2.2 Preferences sync: delete the mapper (355 lines)

`preferencesMapper.ts` hand-converts camelCase→snake_case field by field into a blob the BE
stores verbatim (same shape both ways). Apply the pieces-sync lesson: the FE is the source of
truth and the BE is a shoebox. PUT the persisted store slice as-is (`{ version, ...slice }`),
GET it back, spread it in. The mapper, its Api* mirror types, and the drift risk all vanish.

### 2.3 Store reset (2,339 → ~700 after Phase 1)

Not a rewrite. The god-store shrinks naturally when its dead slices (0.4) and cut features
(Phase 1) go: what remains is settings, auth flags, user, pieces, stages, clay bodies/forms,
glazes, kilns/firings, sync flags, toast. That is a fine single store. Do NOT split it into
per-feature stores; one persisted store with `partialize` is the simplest correct thing.

### 2.4 Session handling (`useCurrentUser.ts` 321 → ~120)

The 401-handling dance (`signOutCheckRef`, `sessionActivatedAtRef`, bootstrap-window guards,
double re-checks) is defensive programming against React Query races. Simplify: on `me` query
401 → `sessionExists()` → false? `clearSession()` + toast. Keep the deletion-grace path.

### 2.5 Deduplicate the copies

- `FormField`: `src/components/form/FormField.tsx` vs `src/screens/library/atlas/FormField.tsx`
- `SectionHeader`: `src/components/` vs `src/screens/kiln/components/`
- `formatDateShort`: `pieces/utils/journal.ts` vs `kiln/utils/kilnUtils.tsx`
- `todayIso`: `glazes/batchId.ts` vs `pieces/utils/journal.ts`
- `DropdownField`: standalone component AND re-exported through `AppSheets.tsx` (which is a
  349-line re-export/constants hub; inline its constants and delete it)
- `useColorScheme`: `src/hooks/` vs `src/components/ui/utils/` (and the app is light-only)

### 2.6 Keep (explicitly not bloat)

zustand + persist (offline truth), React Query (server reads), the doc-blob piece sync
(`usePiecesSync` 297 + `pieceAssetSync` 412 + `useGlazesSync` 392: this is the crown jewel,
leave it), expo-router file routes, NativeWind (260 files use className; going back to
StyleSheet would be a rewrite for zero gain; do convert the 21 straggler StyleSheet files as
you touch them), lucide icons, RevenueCat + PostHog (monetization + telemetry, both thin),
SuperTokens SDK, `cn`/cva (tiny, used by the kept ui kit).

---

## Phase 3 - The last 2x (decision gates, gets you from ~40k to ~20k)

The surviving screens are individually overweight: `FiringDetailContent` 1,109,
`PiecesScreen` 908, `GlazeDetailScreen` 832, `CemeteryGardenView` 660,
`PremiumUpgradeScreen` 643, `CreatePostSheet` 623, `usePiecesScreen` 504. The pattern is the
same everywhere: 4-6 local `useState` + inline sub-components + decorative SVG scenes +
animation choreography in one file. When you touch a screen, rewrite it lean; do not
big-bang rewrite screens that work.

Explicit taste calls only you can make:

1. **Cemetery/memorial** (CemeteryGardenView 660 + MemorialHeadstone 374 + sacrifice modal +
   headstone art): pure charm. Keep if it IS the brand; a lean version is ~200 lines.
2. **Decorative art-in-code** (~1,100: potteryStudioArt, StudioOrnamentBackdrop,
   AnimatedSplashScreen + SplashPotteryRing + AnimatedLogoHero): replace with static images
   or keep one splash animation.
3. **JournalBook page-flip spreads** (JournalBook 294 + CoverSpread + EntrySpread +
   masthead/rail/ledger components, ~1,500): a flat timeline list is ~300 lines.
4. **Kiln surface**: keep add kiln, log firing, complete firing, history. The checklists,
   maintenance logs, status overrides, timing estimations (`firingEstimations` 297) are
   power-user features nobody asked for yet.
5. **True 8k**: additionally collapse glaze atlas to name/photo/notes CRUD and kiln to a
   firing log. At that point you match the sentence exactly, and the app is ~8-10k lines.

`assets/` is 33MB (images 22MB, animations 6.6MB): audit after the feature cuts, most
onboarding/kilnkin/challenge art becomes orphaned. EAS build size will thank you.

---

## Security audit

**Good (keep doing):**
- Session tokens live in the SuperTokens SDK; email in SecureStore (Keychain/Keystore);
  nothing sensitive in AsyncStorage.
- No hardcoded secrets anywhere: PostHog key via `EXPO_PUBLIC_POSTHOG_API_KEY`, RevenueCat
  via env, Google iOS URL scheme in app.json is public by design.
- HTTPS-only; localhost API blocked unless `EXPO_PUBLIC_ALLOW_LOCAL_API=true`.
- `isPremium` never restored from disk (always re-derived from RevenueCat/BE).
- Avatar/cover URIs excluded from persistence (cross-account leak on shared device, handled).
- Password-reset flow does not leak account existence.

**Fix:**
1. **`clearSession` does not clear user data.** It resets auth flags but pieces, glazes,
   kilns, photos stay in AsyncStorage. Sign out on a shared device → next sign-in sees the
   previous user's journal. `clearLocalData.ts` exists and is unused (knip). Wire it: sign-out
   = clear store + query cache. (Biggest real issue found.)
2. `changePassword` requires only the session, not the current password. Someone holding an
   unlocked phone can take over the account (change password → revoke other sessions, which
   the BE does on password change). Require current password in the form and verify via
   signin before change, or accept the risk consciously for MVP.
3. `initializeAuth` swallows all errors silently (`catch {}`); at minimum log in `__DEV__`,
   otherwise a broken SecureStore looks like "signed out" with no trace.
4. `services/index.ts` env resolution (48 lines, 5 env vars, 3 fallback ladders) is complex
   enough to hide a mistake: `EXPO_PUBLIC_API_BASE_URL` vs `EXPO_PUBLIC_API_URL` vs
   `EXPO_PUBLIC_APP_ENV` vs `EXPO_PUBLIC_USE_PRODUCTION_API` vs `EXPO_PUBLIC_ALLOW_LOCAL_API`.
   Reduce to: `API_BASE_URL = env override ?? (__DEV__ ? DEV_URL : PROD_URL)` once the prod
   hostname is live; delete the rest.
5. Keep the `overrides` block in package.json (tar/postcss/js-yaml/uuid/ws pins): that is
   supply-chain hygiene, not bloat.

---

## Execution order

Each step ends green: `npx tsc --noEmit` + app boots in Expo Go/dev build.

1. **Phase 0** in one PR-sized pass (pure deletion, ~1 session). Re-run `npx knip` after; the
   first deletion wave orphans a second wave.
2. **Phase 1 cuts you have decided** (each feature = one focused pass: routes → screens →
   store slice → service → types → assets). Decision points to answer first: kilnkin (1.2),
   analytics (1.7), discover (1.8), cemetery (Phase 3.1).
3. **Phase 2** (api client first, it touches everything; then preferences blob, store reset,
   session hook, dedup).
4. **Phase 3** opportunistically, screen by screen, as you touch them.
5. On-device smoke test after phases 1-2: fresh install → onboard → create piece + photo →
   sync → sign out → sign in → hydrate. (The store version reset makes reinstall mandatory.)

Guardrails going forward: `npx knip` clean before merge; no new dependency if stdlib/expo
already ships it; no new error classes; every new screen starts as one file under 300 lines.
