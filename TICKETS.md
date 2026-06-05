# V1 Release Tickets

**Total: 85 tickets** — 20 BE · 63 FE · 2 FE+BE  
**Last updated:** May 1, 2026

---

## Key Decisions

### User Roles
- Keep all 5 onboarding archetypes — collect segmentation data now for V2 prioritisation
- Renamed: `studio-owner-technician` → "I run a ceramics studio" · `business-owner` → "I make and sell pottery"
- V1 behavioural differences only: kiln tab default view, pricing screen labels, analytics card order

### Monetization
- **Freemium** · €4.99/month · €34.99/year
- **RevenueCat** for IAP (free up to €2,500 MTR, then 1%)
- Free tier: unlimited piece tracking, full kiln ops, community, 1 cover photo per piece, 15 glazes, 1 companion (chosen freely at onboarding, locked post-onboarding)
- Premium: unlimited photos, unlimited glazes + collections, all 4 companions + swap, analytics screen, full pricing presets, kiln analytics, data export, unlimited missions

### Kilnkins
- 4 companions — one per element: Fire, Earth, Air, Water
- All 4 selectable freely during onboarding
- Companion swap post-onboarding = premium gate
- Notification tone derived from chosen element/personality
- Default free companion: Earth (most universally approachable)

### Community
- Real backend required for V1: UGC feed, reactions, challenge join/submit/leaderboard, polls, Hall of Fame, pottery news
- All current static/hardcoded data replaced

### Analytics
- FE-computed from local store (no new BE beyond pieces sync)
- New screen: `src/screens/overview/studioAnalytics/StudioStatsScreen.tsx`
- New route: `app/studio-stats.tsx`
- New utility: `src/utils/computeStudioStats.ts`

### Onboarding
- Reduced to 3 steps: Welcome → Role → Kilnkin
- Entry celebration overlay replaces ReadyStep
- Pricing onboarding removed from flow → becomes an Overview Setup Quest

### Library Tab
- Cut from V1 entirely — V2 feature

---

## 🔴 Critical Bugs (2)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 1 | **[FE] Bug — Remove dev onboarding reset** | `app/index.tsx` no longer calls `reopenGeneralOnboarding()`. Fresh install goes through onboarding once; subsequent cold launches redirect directly to Overview. |
| 2 | **[FE] Bug — Replace hardcoded profile stats** | `ProfileScreen` KEY_STATS, ACHIEVEMENTS, TIMELINE sourced from computed store values (pieces count, survival rate, firing count). `mockedData/data.ts` either deleted or fully unused. |

---

## 🔐 Auth (4)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 3 | **[FE] Auth — Password Reset Screen** | "Forgot password?" link on login screen opens a new screen at `app/forgot-password.tsx`. User enters email, taps submit. Success state shown. Error state shown on invalid email or API failure. |
| 4 | **[BE] Auth — Password Reset via Ory Kratos recovery flow** | Ory recovery flow endpoint triggered on submit. Recovery email sent to user. Session invalidated on success. |
| 5 | **[FE] Auth — Real account deletion API call** | "Delete account" two-step confirmation in `AccountSettingsScreen` calls `DELETE /users/me` on confirm, then calls `oryLogout` + `clearSession`. Not just sign-out. Loading + error states shown. |
| 6 | **[BE] Auth — DELETE /users/me endpoint** | Endpoint soft/hard deletes user data per privacy policy. Returns 204. Cascades to pieces, firings, glazes. Required for App Store compliance. |

---

## 🧱 Pieces & Backend Sync (5)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 7 | **[BE] Pieces — REST API (list, create, update, delete)** | `GET /pieces`, `POST /pieces`, `PUT /pieces/:id`, `DELETE /pieces/:id`. Authenticated. Returns all piece fields from `src/types/pieces.ts`. |
| 8 | **[FE] Pieces — Wire `useOfflineSync` to real API** | `useOfflineSync.ts` calls real API endpoints instead of `setTimeout`. Sync status indicator updates on success/failure. `// TODO` comment removed. |
| 9 | **[FE] Pieces — `backendId` population + login reconciliation** | On piece create, `backendId` (UUID from server) stored on the local piece. On login, local pieces without `backendId` pushed to server; server pieces missing locally pulled down. |
| 10 | **[BE] Kiln — REST API (kilns + firings CRUD)** | `GET/POST/PUT/DELETE /kilns`, `GET/POST/PUT/DELETE /firings`. Authenticated. All fields from `src/types/kiln.ts` supported. |
| 11 | **[FE] Kiln — Wire kiln/firing mutations to real API** | Creating, editing, and deleting kilns and firing mutations call real endpoints. Loading/error states shown. Local-first with sync. |

---

## 👤 Profile (1)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 12 | **[FE] Profile — Compute real stats** | KEY_STATS strip shows live values from `appStore.pieces` + `appStore.firings` (total count, finished count, survival rate, firing count). ACHIEVEMENTS uses badge unlock state from `JourneyTab`'s `BadgeContext`. TIMELINE derived from piece timeline milestones (first firing date, etc.). `mockedData/data.ts` unused. |

---

## ⚙️ Settings (2)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 13 | **[FE] Settings — Implement or hide notification toggles** | Either: push token registered via `expo-notifications` on first toggle enable, with scheduled local notifications for key events. OR: toggles hidden behind "coming soon" label until notifications feature is fully built (tickets 66–69). No toggle that does nothing silently. |
| 14 | **[FE] Settings — Wire privacy toggles to backend** | Privacy settings (analytics opt-in, public profile, public pieces) sent to `PUT /users/me/privacy` on change. Persisted remotely, not just in Zustand. |

---

## 🎭 User Roles (4)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 37 | **[FE] Roles — Onboarding role picker revamp** | `studio-owner-technician` card: label "I run a ceramics studio", description "You fire pieces for members and manage kiln schedules". `business-owner` card: label "I make and sell pottery", description "Markets, commissions, online shop — pottery earns". All 5 cards have distinct, self-identifiable copy. |
| 38 | **[FE] Roles — Kiln tab default view by role** | `studio-owner-technician` opens Kiln tab to "Operations / Manage Load" section. `business-owner` and others open to "Ready Pieces / Pending Pickup". Driven by `appStore.role`. |
| 39 | **[FE] Roles — Pricing screen labels by role** | When `userType === 'studio-owner-technician'`: labels read "Firing Fee Income / Fee Schedule". For `business-owner`: labels read "Piece Pricing / Sales Revenue". Same underlying component, conditional label strings. |
| 40 | **[FE] Roles — Analytics card emphasis by role** | Studio owner: Kiln Utilisation and Firing Fee Revenue cards shown first. Business owner: Sales Revenue and Cost-Per-Piece cards shown first. All cards accessible to both but order/emphasis differs. |

---

## 🌱 Community — Backend (7)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 16 | **[BE] Community — Post + Feed API** | `POST /posts` (create with image URL), `GET /feed` (paginated, 20 items/page, sorted by recency). Post model: userId, imageUrl, caption, pieceId?, tags[], createdAt. `DELETE /posts/:id` (own posts only). |
| 17 | **[BE] Community — Reaction API** | `POST /posts/:id/reactions` (add like), `DELETE /posts/:id/reactions` (remove). Reaction count returned in feed response. Duplicate reaction for same user prevented at DB level. |
| 18 | **[BE] Community — Challenge API** | `GET /challenges` (active + upcoming), `POST /challenges/:id/entries` (submit piece with postId), `DELETE /challenges/:id/entries/:entryId` (withdraw), `GET /challenges/:id/leaderboard` (sorted by votes or curator pick). |
| 19 | **[BE] Community — Polls API** | `GET /polls` (active polls), `POST /polls/:id/vote` (one vote per user per poll, enforced at DB level), `GET /polls/:id/results`. Prevents double-voting. |
| 20 | **[BE] Community — Hall of Fame API** | `GET /hall-of-fame` returns top-N potters with piece count, challenge wins, survival rate aggregated server-side. Updated daily via cron or on-demand recompute. |
| 21 | **[BE] Community — Admin News API** | `GET /news` returns curated pottery world news items (title, source, url, imageUrl, publishedAt). Admin-managed table or CMS. |
| 22 | **[BE] Community — Media upload** | `POST /uploads/presigned` returns a signed S3/CDN URL. Client uploads image directly. Authenticated users only. File type restricted to image/jpeg, image/png, image/webp. Max 10MB enforced server-side. Filenames UUID-generated (never user-supplied). |

---

## 🌱 Community — Frontend (7)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 23 | **[FE] Community — Wire ForYouFeed to real API** | Feed items fetched from `GET /feed` with pagination (infinite scroll / load more). Pull-to-refresh works. Loading skeleton on first load. Empty state when no posts. Hardcoded static feed data removed. |
| 24 | **[FE] Community — Post creation flow** | FAB or "+" button in Community tab opens: photo picker → caption input → optional piece tag → submit. Calls `POST /uploads/presigned` then `POST /posts`. On success routes back to feed with new post visible at top. |
| 25 | **[FE] Community — Real reactions** | Tapping like calls `POST/DELETE /posts/:id/reactions`. Optimistic update shown immediately. Reaction count reflects server state on next feed refresh. Liked state persists across sessions. |
| 26 | **[FE] Community — Challenge join/submit/withdraw** | Join button calls `POST /challenges/:id/entries`. Submit piece sheet (already built) calls real endpoint with selected piece + postId. Withdraw calls `DELETE`. Confirmation states shown. Joined/submitted state persisted. |
| 27 | **[FE] Community — Poll voting** | Tapping a poll option calls `POST /polls/:id/vote`. Results bar updates optimistically. Voted state persists across sessions (no re-voting). |
| 28 | **[FE] Community — Hall of Fame with real data** | `HallOfFameTab` fetches from `GET /hall-of-fame`. Loading + error + empty states. Hardcoded `WALL_OF_FAME` data removed. |
| 29 | **[FE] Community — Pottery news section** | New card type in `ForYouFeed` renders news items from `GET /news`. Tapping opens external URL in in-app browser (`expo-web-browser`). |

---

## 📊 Analytics — Frontend (7)

All cards computed locally from store. No new BE tickets required.

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 30 | **[FE] Analytics — Screen shell + nav entry** | `app/studio-stats.tsx` + `src/screens/overview/studioAnalytics/StudioStatsScreen.tsx` created. Entry point added in Profile screen ("Studio Stats" settings row). Section scroll layout. Loading state. Premium-gated via ticket 62. |
| 31 | **[FE] Analytics — Studio Summary card** | Shows: Total Pieces, Active (non-cemetery), Finished, Survival Rate (finished / (finished + cemetery) × 100). Computed live from `appStore.pieces`. |
| 32 | **[FE] Analytics — Kiln & Firing Costs card** | Monthly firing cost computed from `appStore.firings` filtered by `createdAt` for current + last 3 months. Shows total YTD, cost this month, avg cost/firing, pieces-per-firing avg. |
| 33 | **[FE] Analytics — Avg Time in Stage** | For each stage transition (forming→leather-hard, bone-dry→bisque, glazing→glaze-fired), compute median hours from piece `timeline` entries. Shown as list or horizontal bar. |
| 34 | **[FE] Analytics — Clay Body Usage** | Group all non-cemetery `piece.clayBody` values, count occurrences, render as ranked list with percentage bar. "Unspecified" bucket for blank values. |
| 35 | **[FE] Analytics — Glaze Usage** | Group `appStore.glazeTests` by `glazeId`, count tests per glaze, join with glaze name. Render as ranked list. |
| 36 | **[FE] Analytics — XP / Badge Progress summary** | Extract badge computation from `JourneyTab.tsx` into `src/utils/computeStudioStats.ts`. Analytics screen shows badges unlocked count, next badge + progress %, level + XP bar. `JourneyTab` consumes same utility — no duplication. |

---

## 🎨 Onboarding Redesign (7)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 49 | **[FE] Onboarding — Restructure to 3 steps** | `steps[]` set to `['welcome', 'role', 'kilnkin']`. `ReadyStep` removed from flow. 6 unused step files (`HomeSetup`, `KilnStep`, `Preferences`, `Pricing`, `Routines`, `StudioPreview`) deleted. Progress bar shows 3 steps. Pricing onboarding removed from flow entirely (see ticket 55). |
| 50 | **[FE] Onboarding — Illustration layout architecture** | Each step has a top-zone `IllustrationSlot` component (`height: screenHeight * 0.42`). Accepts `imageSource` prop with `resizeMode: cover`. Placeholder grey block used until final assets arrive. Content scrolls below. Consistent safe-area + notch handling on iOS/Android. |
| 51 | **[FE] Onboarding — Welcome step redesign** | `IllustrationSlot` at top (`welcome-hero.png` placeholder). Studio name input preserved (optional). Value prop highlights visible below illustration. Floating clay-pet sticker preserved as illustration overlay. |
| 52 | **[FE] Onboarding — Role step redesign** | Role cards updated with new copy per ticket 37. Each card has illustration/icon slot. Selection state animates on press. `studio-potter` studio code input preserved. `not-sure` expansion preserved. |
| 53 | **[FE] Onboarding — Kilnkin step redesign (4 elements)** | Before selection: `IllustrationSlot` shows all 4 elemental companions together (`kilnkin-all.png` placeholder). After selection: illustration transitions to chosen companion's scene (4 slots: `kilnkin-fire-scene.png`, `kilnkin-earth-scene.png`, `kilnkin-air-scene.png`, `kilnkin-water-scene.png`). Spring bounce on card tap preserved. Swipe paging with 4 dot indicators. |
| 54 | **[FE] Onboarding — Entry celebration transition** | After "Enter Studio" tap on Kilnkin step: `completeGeneralOnboarding()` called, brief celebration overlay (companion name + "Your studio is ready") fades in/out over 1400ms, then `router.replace('/overview')` fires. No navigation delay felt. |
| 55 | **[FE] Onboarding — Pricing setup moved to Overview quest** | `PricingOnboardingScreen` no longer triggered from `_layout.tsx` guard. Overview setup quest "Set your pricing profile" links to `app/pricing-onboarding.tsx` as standalone entry. After completion: `router.back()` returns to Overview. |

---

## 🐾 Kilnkins — 4 Elements (2)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 84 | **[FE] Kilnkins — Rebuild companion system for 4 elements** | `KilnkinPersonality` type updated to `'fire' \| 'earth' \| 'air' \| 'water'`. `KilnkinCompanion` type gains `element` field. `AVAILABLE_KILNKIN_COMPANIONS` has 4 entries with element-appropriate `name`, `species`, `notificationToneLabel`, `loves`, `collects`, `napSpot`, `favoriteSnack`. Default/free companion: Earth. `getPrefix(personality)` returns 4 elemental voice prefixes (Fire: "Yes! Time to act:" · Earth: "Worth noting:" · Air: "Oh! Something fun:" · Water: "Gently, a reminder:"). `getKilnkinVoiceLine()` signature unchanged. |
| 85 | **[FE] Kilnkins — Companion swap UI in Profile** | Settings row "Your Kilnkin" in Profile shows current companion name + element icon. Tapping opens a companion picker bottom sheet (same swipe-card UI as onboarding step 3). On confirm: updates `appStore.kilnkinCompanion`. Gate via ticket 64 — free users intercepted before sheet opens and shown `PremiumPaywallSheet`. |

---

## 💳 Monetization & Premium (9)

Pricing: **€4.99/month · €34.99/year** · Platform: **RevenueCat** (free up to €2,500 MTR, then 1%)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 56 | **[FE] Premium — RevenueCat SDK integration** | `react-native-purchases` installed + initialized on app launch with `EXPO_PUBLIC_REVENUECAT_API_KEY` (separate iOS + Android keys in `.env`). Products configured in RC dashboard: `pottery_premium_monthly` (€4.99/mo) + `pottery_premium_annual` (€34.99/yr). `useEntitlements()` hook in `src/hooks/` returns `{ isPremium: boolean, purchase: fn, restore: fn, isLoading: boolean }`. `isPremium` persisted in `appStore`. |
| 57 | **[BE] Premium — RevenueCat webhook + entitlement sync** | `POST /webhooks/revenuecat` receives: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`. Webhook secret validated via header. Updates `users.isPremium` + `users.premiumExpiresAt` in DB. Returns 200. |
| 58 | **[FE] Premium — `checkPremium()` gate utility** | `src/utils/premiumGate.ts` exports `PremiumFeature` enum: `'analytics'`, `'unlimited-photos'`, `'full-glaze-atlas'`, `'companion-swap'`, `'full-pricing'`, `'kiln-analytics'`, `'export'`, `'unlimited-missions'`. `checkPremium(feature)` reads `appStore.isPremium`. Free users return false for gated features. |
| 59 | **[FE] Premium — Contextual paywall sheet** | `PremiumPaywallSheet` bottom sheet. Props: `featureName`, `featureDescription`. Shows: premium feature list, monthly/annual price toggle (€4.99/mo · €34.99/yr), subscribe CTA (calls `purchase()`), restore purchases link, close button. Loading + error states handled. Reusable across the app. |
| 60 | **[FE] Premium — Dedicated upgrade screen** | `app/premium.tsx` + `PremiumUpgradeScreen`. Full free vs. premium comparison. Monthly/annual toggle. Subscribe CTA + restore purchases. "Manage Subscription" shown if already premium (opens RC customer portal). Accessible from Profile via "Upgrade to Premium" / "Manage Subscription" settings row. Feature list includes: unlimited photos, full glaze atlas, all 4 elemental companions + swap, analytics, full pricing, kiln analytics, data export. |
| 61 | **[FE] Premium — Photo gate** | Free users: 1 cover photo per piece. Tapping "Add photo" in journal entries or `StageAdvanceFlowModal` when free triggers `PremiumPaywallSheet` with `featureName: 'unlimited-photos'`, description: "Document every stage of your process." Cover photo always free. Gate checks `photos.length >= 1 && !isPremium`. |
| 62 | **[FE] Premium — Analytics screen gate** | Tapping Studio Stats entry in Profile checks `checkPremium('analytics')`. Free users see `PremiumPaywallSheet` with `featureName: 'analytics'`. Screen does not render for free users. |
| 64 | **[FE] Premium — Kilnkin companion swap gate** | All 4 companions selectable freely during onboarding (no gate). Post-onboarding: "Change Companion" option in Profile/Settings checks `checkPremium('companion-swap')`. Free users see `PremiumPaywallSheet` with `featureName: 'companion-swap'`, description: "Switch between your elemental companions anytime." Premium users can swap freely. |
| 65 | **[FE] Premium — Glaze atlas gate (15 glazes)** | When free user attempts to add a 16th glaze, `AddGlazeModal` intercepts and triggers `PremiumPaywallSheet` with `featureName: 'full-glaze-atlas'`, description: "Build your complete glaze library without limits." Gate: `appStore.glazes.length >= 15 && !isPremium`. |

> Note: Ticket 63 removed — Library tab cut from V1.

---

## 📈 Product Telemetry (2)

Recommended tool: **PostHog** (free up to 1M events/month, React Native SDK, GDPR-compliant with existing opt-out toggle)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 47 | **[FE] Telemetry — PostHog SDK integration** | `posthog-react-native` installed. Initialized only when `EXPO_PUBLIC_ENABLE_ANALYTICS=true` AND `privacyPrefs.analyticsEnabled=true`. `useAnalytics()` hook in `src/hooks/` wraps `capture()` with gate check. User identified on login with `{ userId, role, userType }` — no PII (no email, no name). Opt-out clears PostHog identity. |
| 48 | **[FE] Telemetry — Key feature events** | Events fired at: `onboarding_step_viewed` (stepKey), `onboarding_completed` (role, userType, kilnkinId, element), `piece_created`, `piece_stage_advanced` (stage), `firing_started`, `firing_completed`, `challenge_joined`, `community_post_created`, `tab_viewed` (tabName), `premium_paywall_shown` (featureName), `premium_purchase_initiated`, `premium_purchase_completed`, `premium_purchase_failed`. All via `useAnalytics()`. |

---

## 🔔 Notifications (5)

Notification text uses `getKilnkinVoiceLine(companion, message)` — tone matches chosen element:
- **Fire** → "Yes! Time to act: …"
- **Earth** → "Worth noting: …"
- **Air** → "Oh! Something fun: …"
- **Water** → "Gently, a reminder: …"

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 66 | **[FE] Notifications — Push token registration + permissions** | On first app launch after onboarding completes, request notification permissions via `expo-notifications`. Push token registered and stored in `appStore`. If denied, Settings notification toggles remain off. Never auto-reprompts — only user-initiated via Settings. |
| 67 | **[FE] Notifications — Kilnkin-voiced local notification service** | `src/services/notifications.ts` exports `scheduleKilnkinNotification({ companion, trigger, message })`. Builds notification body via `getKilnkinVoiceLine(companion, message)`. Uses companion name as notification title (e.g. "Ember"). Schedules via `expo-notifications`. Android notification channel label uses element name. |
| 68 | **[FE] Notifications — Kiln + drying event triggers** | Schedules: (1) Firing completion → fires when `firing.state → 'completed'`, delivery delayed by `kiln.pickupDelayDays`. (2) Drying too long → daily check: pieces in `drying`/`bone-dry` > 3 days trigger once-per-piece notification. (3) Piece stuck at stage beyond custom threshold → fires once per piece per stage overage. (4) Firing scheduled today → morning notification when `firing.scheduledAt` date matches today. All respect `notificationPrefs.kilnAlerts` toggle. |
| 69 | **[FE] Notifications — Studio Rhythm + weekly summary triggers** | (1) Daily mission reminder → scheduled at user-configurable time (default 9am) when missions incomplete that day. Respects `notificationPrefs.studioRhythm` toggle. (2) Weekly studio summary → Sunday evening, fires with pieces-made-this-week count. (3) All notifications use Kilnkin voice via `scheduleKilnkinNotification`. |
| 70 | **[BE] Notifications — Community challenge deadline push** | Server-side cron job 48h before `challenge.submissionDeadline`: sends push via Expo Push API to users who joined but haven't submitted. Message uses element-based personality template stored on user profile. Respects opt-out flag. |

---

## 🔔 Notifications — Completion Backlog (5)

These tickets close the remaining reliability + production-delivery gaps after local notification triggers were implemented.

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 86 | **[FE/BE] Notifications — Device push token sync + rotation handling** | FE registers Expo push token after permission grant and sends it to BE (`POST /users/me/push-tokens`). BE stores multiple device tokens per user with platform + updatedAt. Token refresh and logout de-registration are handled. Duplicate tokens are deduped server-side. |
| 87 | **[BE] Notifications — Joined challenge contract endpoint** | `GET /challenges` (or companion endpoint) includes an explicit joined/submitted contract for current user (`isJoined`, `hasSubmitted`, `submissionDeadline`). FE no longer relies on ad-hoc fields like `my_entry_id` casting. API contract documented and covered by integration test. |
| 88 | **[FE] Notifications — Trigger/unit test coverage** | Add Jest tests for notification trigger behavior: per-event dedupe, stage-overage thresholding, daily mission scheduling, weekly summary scheduling, challenge reminder window, and cancellation on toggle-off. Include timezone boundary tests (midnight/day rollover). |
| 89 | **[FE] Notifications — App lifecycle reschedule guard** | On app foreground/resume, reconcile scheduled notifications against current state to prevent stale reminders and missed reminders after long background periods. Ensure no duplicate schedules across repeated resumes. Add logging guard behind dev flag only. |
| 90 | **[FE] Notifications — Delivery controls (quiet hours + deep links)** | Add notification settings for quiet hours window and reminder time customization (daily mission). Notification taps deep-link to relevant screens: kiln, piece detail/stage, missions, challenge. Respect quiet hours for non-urgent local reminders. |

---

## 🧪 Testing (6)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 71 | **[FE] Testing — Jest setup + testing library config** | `jest` + `@testing-library/react-native` + `jest-expo` added as dev deps. `jest.config.js` configured for Expo. `babel.config.js` updated for test transform. `npm test` runs and passes. `__tests__/` folder created at repo root. |
| 72 | **[FE] Testing — Unit tests: pure utility functions** | Tests for: `computeStudioStats()`, `getStudioAlerts()`, `mapPiecesToStudioPositions()`, `calculatePiecePricingSnapshot()`, `getKilnkinVoiceLine()`, `generateStudioRhythmSuggestions()`, `generateSetupQuests()`, `buildActivityFeed()`, `checkPremium()`. Each: happy path + empty input + edge case. |
| 73 | **[FE] Testing — Unit tests: Zustand store actions** | Tests for: `addPieces`, `updatePiece`, `deletePiece`, `advancePieceStage`, `sendToCemetery`, `completeGeneralOnboarding`, `setPrivacyPref`. Store initialised with `createStore()` per test. AsyncStorage mocked. |
| 74 | **[FE] Testing — E2E critical flows (Maestro)** | Maestro installed. Flows: (1) Onboarding → role select → companion select → enter studio. (2) Create piece → advance to bone-dry → send to bisque. (3) Add kiln → start firing → complete firing. (4) Sign up → log in → log out. Runs on iOS simulator + Android emulator before each release. |
| 75 | **[FE] Testing — Responsiveness audit** | All screens tested on: iPhone SE (375pt), iPhone 16 Pro (393pt), iPhone 16 Pro Max (430pt), iPad (768pt). Issues logged. NativeWind responsive prefixes (`md:`, `lg:`) applied where layouts break. Bottom sheets, modals, grids validated on tablet. |
| 76 | **[FE] Testing — Pre-release QA checklist** | Internal manual QA checklist (not in repo) covering: auth flows, piece CRUD, kiln lifecycle, community post/react/challenge, onboarding, settings toggles, premium gate points, empty states, offline behaviour. Run on physical iOS + Android device before every TestFlight/Play beta. |

---

## 🔒 Security (4)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 77 | **[FE] Security — Session token storage audit** | Confirm `sessionToken` stored via `expo-secure-store` (encrypted), not plain `AsyncStorage`. If currently in Zustand persist + AsyncStorage, migrate `sessionToken` and `oryIdentityId` to SecureStore. Non-sensitive prefs remain in AsyncStorage. |
| 78 | **[FE] Security — No PII in logs or telemetry** | Audit all `console.log`, PostHog events, crash reports. Confirm: no email addresses, no session tokens, no user names in any telemetry or logs. PostHog identity uses only opaque `userId` + non-PII props (`role`, `userType`). |
| 79 | **[BE] Security — Input validation + rate limiting** | All BE endpoints validate input shape (Zod or equivalent). `POST /posts`, `POST /pieces`, `POST /firings` reject oversized payloads (body size limit enforced). Auth endpoints (`/login`, `/register`, `/recovery`) rate-limited (e.g. 10 req/min per IP). |
| 80 | **[BE] Security — Media upload security** | `POST /uploads/presigned`: authenticated users only, file type restricted to image/jpeg + image/png + image/webp, 10MB max enforced server-side, filenames UUID-generated (user-supplied filenames never used), no public-write S3 bucket policy. |

---

## ⚡ Performance (3)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 81 | **[FE] Performance — FlashList migration** | `@shopify/flash-list` installed. Pieces list, Kiln ready-pieces queue, Glaze atlas, Community feed all migrated from `FlatList` to `FlashList`. `estimatedItemSize` tuned per list. JS thread frame drops < 3 on a list of 200 pieces (Expo Profiler). |
| 82 | **[FE] Performance — Image lazy loading + caching** | All piece photos and community post images use `expo-image` (already installed) with `cachePolicy: 'memory-disk'`. No raw `<Image>` from React Native used for remote URLs. Blurhash or low-res placeholder shown while loading. |
| 83 | **[FE] Performance — App startup time audit** | Cold start time measured on mid-range Android (Pixel 6a equivalent). Target: JS bundle evaluated + first meaningful paint < 3s. If exceeded: identify heavy synchronous store hydration or font loading and defer. Measured via Expo Profiler + `console.time`. |

---

## 🚀 App Store & Quality (5)

| # | Ticket | Acceptance Criteria |
|---|---|---|
| 41 | **[FE] App — Splash screen production config** | `app.json` has production splash asset (not placeholder), background colour matches brand. Splash dismisses cleanly after font + store hydration. Tested on iOS + Android physical devices. |
| 42 | **[FE/BE] App — Privacy Policy URL** | A real Privacy Policy URL configured in `app.json` or env. `PrivacySettingsScreen` links to it. Required for App Store submission. |
| 43 | **[FE] App — Empty states** | All major list screens (Pieces, Kiln, Glaze Atlas, Community feed, Glaze Tests) show an illustrated or descriptive empty state with a primary CTA when the list is empty. |
| 44 | **[FE] App — Error states** | Network error and API failure states handled on: Pieces list, Kiln list, Community feed, Glaze Atlas. Shows retry button. Uses existing `NetworkError` component from `src/components/error-boundary/`. |
| 15 | **[FE] Studio Rhythm missions — Free tier gate (3/week)** | Free users see up to 3 missions per week. After all 3 completed, remaining missions show a locked inline card (soft gate — no paywall sheet). Tapping the nudge opens `PremiumPaywallSheet` with `featureName: 'unlimited-missions'`. |

---

## Ticket Count Summary

| Area | FE | BE | FE+BE | Total |
|---|---|---|---|---|
| Critical Bugs | 2 | — | — | 2 |
| Auth | 2 | 2 | — | 4 |
| Pieces & Kiln Sync | 3 | 2 | — | 5 |
| Profile | 1 | — | — | 1 |
| Settings | 2 | — | — | 2 |
| User Roles | 4 | — | — | 4 |
| Community | 7 | 7 | — | 14 |
| Analytics | 7 | — | — | 7 |
| Onboarding Redesign | 7 | — | — | 7 |
| Kilnkins (4 elements) | 2 | — | — | 2 |
| Monetization / Premium | 8 | 1 | — | 9 |
| Product Telemetry | 2 | — | — | 2 |
| Notifications | 4 | 1 | — | 5 |
| Testing | 6 | — | — | 6 |
| Security | 2 | 2 | — | 4 |
| Performance | 3 | — | — | 3 |
| App Store & Quality | 4 | — | 1 | 5 |
| **Total** | **66** | **15** | **1** | **82** |

> Ticket 63 intentionally skipped — Library tab cut from V1.
> Tickets 15, 37–40 included in their respective sections.
> **85 tickets total including all numbered entries across this document.**
