# Pottery Nook — Website Brief

**Purpose:** Standalone marketing + compliance site at `https://potterynook.app`.  
**Not in scope:** Rebuilding the mobile app as a website. Expo web (`localhost:8081`) is dev-only and should not be the public site.

**App identity (for cross-linking):**
| Field | Value |
|-------|--------|
| Product name | **Pottery Nook** |
| Subscription name | **Pottery Nook Pro** |
| iOS bundle ID | `com.ariane.potterylife` |
| Android package | `com.ariane.potterylife` |
| URL scheme | `potterynook://` |
| Public web base | `https://potterynook.app` (see `src/screens/overview/profile/utils/profileLinks.ts`) |
| Support email | `support@pottery-life.app` (or env `EXPO_PUBLIC_FEEDBACK_EMAIL`) |
| App version (v1) | 1.0.0 |

---

## 1. Why this site exists

1. **App Store / Play Store compliance** — privacy policy URL, support contact, subscription terms.
2. **Marketing** — explain the product to people who find you before installing.
3. **Shared profile links** — `https://potterynook.app/user/{id}` must render a real page (Open Graph previews for WhatsApp/iMessage/Slack).
4. **Future studio owner portal** — billing, statements, member admin (referenced in-app; not V1).

The app will open these pages via `Linking.openURL()` from settings, paywall footnotes, and legal footers. **Subscription checkout stays in the app** (RevenueCat / App Store / Play Store) — the website describes Premium; it does not sell digital subscriptions on web for iOS users.

---

## 2. Brand & visual direction

Match the app’s warm pottery-studio aesthetic:

| Token | Value | Usage |
|-------|--------|--------|
| Page background | `#FBF0E0` / `#fff7ea` | Main canvas |
| Card surface | `#FFFBF2` / `rgba(255, 252, 246, 0.94)` | Cards, sections |
| Primary accent (gold) | `hsl(39 57% 51%)` / `#C4A052` | CTAs, highlights |
| Ink / headings | `#2f1c12`, `hsl(24 55% 22%)` | Titles |
| Body / muted | `#5d3b25`, `hsl(24 20% 45%)` | Subcopy |
| Display font | **Fraunces** (600/700) | Headlines |
| Body font | **DM Sans** (400/500) | UI text |

**Tone:** Calm, craft-focused, personal (“small team building tools for potters”), not corporate SaaS. Kilnkins (elemental studio companions) are a differentiator — warm and playful, not childish.

**Assets to reuse from repo:**
- `assets/PotteryNookLogo.png` — logo, favicon, OG fallback image
- App screenshots (capture from iOS simulator / TestFlight for landing page)
- Kilnkin companion art if available under `assets/`

---

## 3. Site map (V1 — ship before / with TestFlight)

### Required pages

| Route | Priority | Purpose |
|-------|----------|---------|
| `/` | P0 | Landing / marketing home |
| `/premium` | P0 | Full Premium feature breakdown + pricing (no web checkout) |
| `/privacy` | P0 | Privacy policy — **required in App Store Connect** |
| `/terms` | P0 | Terms of service (subscriptions, acceptable use) |
| `/support` | P0 | Contact, FAQ, account help |
| `/user/:userId` | P0 | Public profile preview + OG tags (see §6) |

### Recommended for V1

| Route | Purpose |
|-------|---------|
| `/delete-account` | How account deletion works (mirrors in-app flow; links to app settings) |
| `/press` or `/about` | Short story: who built it, mission |

### V2+ (do not block V1)

| Route | Purpose |
|-------|---------|
| `/studio` or `/owner` | Studio owner portal (billing, member admin) |
| `/blog` | Release notes, pottery tips |
| `/challenge` | Public challenge gallery embed |

---

## 4. Page-by-page content requirements

### 4.1 Home (`/`)

**Hero**
- Headline idea: *Your cozy pottery studio, in your pocket.*
- Subhead: Track pieces, firings, glazes, and rhythm — with a little help from your Kilnkin companion.
- Primary CTA: **Download on the App Store** / **Get it on Google Play** (badges; hide until live).
- Secondary CTA: **See Premium** → `/premium`

**Who it’s for** — mirror onboarding archetypes (`src/config/onboardingOptions.ts`):

| Audience | One-liner |
|----------|-----------|
| Home potter | Throw, dry, and fire in your own space — full kiln and piece tracking. |
| Studio potter | Piece flow and glaze library at a shared studio. |
| Studio owner / technician | Kiln schedules, firing logs, member context. |
| Business potter | Production tracking, pricing, and sales-oriented analytics. |

**Feature pillars** (with screenshot each):

1. **Pieces** — Stage-based journal (throw → trim → bisque → glaze → finished), timeline photos, notes.
2. **Kiln** — Kiln registry, firing sessions, history, load tracking.
3. **Glaze atlas** — Recipe library, test tiles, collections (unlimited on-device).
4. **Studio Rhythm** — Weekly schedule, drying timers, events, rituals; Premium adds sprint & freeform modes.
5. **Analytics** — Studio ledger: costs, materials, firing trends (Premium unlocks full dashboards).
6. **Community** — Feed, challenges, Hall of Fame; free text posts, Premium photo posts.
7. **Kilnkins** — Pick Fire, Earth, Air, or Water companion; Premium unlocks all four + swap anytime.

**Kilnkin section** — name all four:
- **Ember** (Fire / Kiln Fox)
- **Terra** (Earth / Studio Hare) — free default at onboarding
- **Wisp** (Air / Glaze Sprite)
- **Drift** (Water / River Cat)

**Social proof placeholder** — testimonials or “built by potters” until you have reviews.

**Footer** — Privacy, Terms, Support, Premium, © Pottery Nook, version.

---

### 4.2 Premium (`/premium`)

Align copy with in-app paywall (`src/utils/premiumGate.ts`, `src/constants/premium.ts`). **Must stay in sync** when app limits change.

**Pricing (list prices, EUR)**
- Monthly: **€4.99/month**
- Yearly: **€34.99/year** (~42% vs 12× monthly)
- Note: “Price may vary by App Store region and currency.”

**Critical explainer** (use prominently — this is the current product model):

> **Free:** Unlimited pieces, kiln logs, and glazes on your device. Journal text syncs across devices. Cloud photo backup is limited (500 MB total, 1 cloud-backed photo per piece). Community text posts. One Kilnkin companion. Studio Rhythm weekly mode. Analytics preview only.  
> **Premium (Pottery Nook Pro):** Unlimited cloud photo backup, unlimited cloud-backed photos per piece, photo posts in community, all four Kilnkins + swap, full analytics & kiln analytics, data export, Studio Rhythm sprint & freeform. Yearly pottery wrap — coming soon.

**Comparison table** (match app):

| | Free | Premium |
|---|------|---------|
| Pieces, kiln & glazes | Unlimited on device | Unlimited on device |
| Text sync across devices | Included | Included |
| Cloud photo storage | 500 MB | Unlimited |
| Photos backed up per piece | 1 | Unlimited |
| Community posts | Text | Text + photos |
| Studio analytics | Preview only | Full dashboards |
| Data export | — | Included |
| Studio Rhythm | Weekly | Sprint & freeform |
| Companions | Your pick (1) | All 4 + swap anytime |

**CTA:** “Subscribe in the app” — explain that billing is through Apple/Google after install. **Do not** embed Stripe/RevenueCat web checkout for iOS digital content.

**Studio owner footnote** (from app paywall):

> Studio member queue & schedule stay free. Studio billing, statements, and member admin will live on the web owner portal.

**Archetype-specific blurbs** (optional accordions) — reuse `PREMIUM_HEADLINES` from `premiumGate.ts` for home / studio / owner / business potter angles.

---

### 4.3 Privacy policy (`/privacy`)

**P0 for App Store.** Cover at minimum:

**Data collected**
- Account: email, name (via Ory auth), profile fields (studio, location, bio, avatar).
- Studio content: pieces, firings, kilns, glazes, journal entries, photos uploaded to cloud.
- Usage: analytics & crash reporting (opt-in via in-app Privacy Settings).
- Device: push notification tokens, OS version.
- Purchases: handled by Apple/Google/RevenueCat — you receive entitlement status, not full card data.

**How data is used**
- Sync across devices, cloud backup (Premium), community features, notifications (Kilnkin firing reminders, etc.).

**Storage & processors**
- Backend API (document host when known, e.g. Render).
- Auth: Ory.
- Subscriptions: RevenueCat.
- File storage: cloud media CDN (document provider).

**User rights**
- Access, correction, export (Premium export feature), **account deletion** (in-app → `DELETE /users/me`).
- Privacy toggles: profile public, pieces public, analytics opt-in (sync to backend when wired).

**Retention** — state policy for deleted accounts and backup media.

**Children** — not directed at under 13 (or applicable age).

**Contact** — `support@pottery-life.app` for privacy requests.

**Last updated** date on page.

---

### 4.4 Terms of service (`/terms`)

Cover:

- License to use the app; acceptable use (no illegal content, harassment in community).
- User-generated content — users retain rights; license to host/display for service operation.
- **Subscriptions:** auto-renewal, cancellation via App Store / Play Store, no refunds through developer (per store policies), feature access while active.
- Disclaimer: pottery/kiln safety — app is organizational tool, not safety equipment.
- Limitation of liability.
- Governing law / jurisdiction (your choice).
- Changes to terms — notification approach.

Link to Privacy policy and Support.

---

### 4.5 Support (`/support`)

- Email: `support@pottery-life.app`
- FAQ topics:
  - How to reset password (in-app forgot password → Ory).
  - How to cancel Premium (App Store / Play Store subscription settings; app also links to platform settings).
  - How to delete account (Settings → Account → Delete).
  - Cloud backup limits (500 MB free, what counts toward quota).
  - Sync troubleshooting (login required, network).
  - Report a bug / send feedback (same email).
- App version compatibility note.
- No phone support required for V1.

---

### 4.6 Public profile (`/user/:userId`)

**Backend dependency:** `GET /users/:userId/profile` (see `BACKEND-TASKS.md` P0-2, P1-17).

**For crawlers (SSR or static generation — JS-only is not enough for WhatsApp previews):**

```html
<meta property="og:title" content="{name} · Pottery Nook" />
<meta property="og:description" content="{bio or Studio: {studio_name} or tagline}" />
<meta property="og:image" content="https://… absolute URL" />
<meta property="og:url" content="https://potterynook.app/user/{id}" />
<meta property="og:type" content="profile" />
<meta property="og:site_name" content="Pottery Nook" />
<meta name="twitter:card" content="summary_large_image" />
```

**Image fallback order:** cover → avatar → newest post image → app logo.

**Human-visible page:**
- Avatar, name, studio, bio.
- 3×3 grid preview of public posts.
- **Open in Pottery Nook** → `potterynook://user/{id}` (until universal links ship).
- App Store / Play Store badges if app not installed.
- 404 for private or missing users (same rules as API).

**Later (P2-1):** `/.well-known/apple-app-site-association` and `assetlinks.json` so `https://potterynook.app/user/*` opens the app when installed.

---

## 5. App ↔ website URL contract

Define these constants in the app once the site is live (`src/constants/urls.ts` or similar):

| Constant | URL |
|----------|-----|
| `WEB_BASE` | `https://potterynook.app` |
| `PRIVACY_URL` | `https://potterynook.app/privacy` |
| `TERMS_URL` | `https://potterynook.app/terms` |
| `SUPPORT_URL` | `https://potterynook.app/support` |
| `PREMIUM_URL` | `https://potterynook.app/premium` |
| `PROFILE_URL(id)` | `https://potterynook.app/user/${id}` |

**Wire in app (follow-up task):**
- Account Settings → Privacy Policy, Terms of Service rows.
- Premium screen → “Learn more” → `/premium`.
- Register / onboarding footer → Privacy + Terms links (if not already).
- App Store Connect → Privacy Policy URL field.

---

## 6. Technical requirements

| Requirement | Notes |
|-------------|--------|
| **HTTPS** | Required everywhere. |
| **Mobile-first responsive** | Most profile links open on phones. |
| **Fast static pages** | Astro, Next.js static export, Cloudflare Pages, Vercel, etc. |
| **SSR or SSG for `/user/:id`** | OG tags must be in initial HTML. |
| **No auth on marketing pages** | Public profile page is public-by-design. |
| **Analytics** | Optional Plausible/Fathom; respect app analytics opt-out on marketing only. |
| **Cookie banner** | Only if using non-essential cookies (EU). |
| **robots.txt + sitemap.xml** | Index `/`, `/premium`, `/support`; noindex private error states. |
| **favicon** | From Pottery Nook logo. |
| **404 page** | Branded, link home + support. |

**Do not rely on** Expo `expo export` web output — it bundles the React Native app and hits Metro/`import.meta` issues with Zustand persist.

---

## 7. Legal & store checklist

Before TestFlight / App Store submission:

- [ ] `https://potterynook.app/privacy` live and linked in App Store Connect
- [ ] Support URL live (`/support` or mailto)
- [ ] Terms linked from app (recommended)
- [ ] Premium description matches in-app paywall (no over-promising “coming soon” features as shipped)
- [ ] Subscription name **Pottery Nook Pro** consistent
- [ ] Account deletion documented on web + works in app
- [ ] Export / data portability mentioned in privacy (Premium export)

---

## 8. Content you must not claim (honesty alignment)

| Status | Feature |
|--------|---------|
| **Shipped** | Cloud backup limits, piece/kiln/glaze tracking, Kilnkins, community feed, challenges, analytics preview/full, export, Studio Rhythm modes |
| **Coming soon** | Yearly pottery wrap |
| **Future / web only** | Studio owner billing portal, member admin statements |
| **Partial / beta** | Public profile sharing (needs backend), privacy toggle server sync |

Keep marketing copy aligned with `PAYWALL_INCLUDED_FEATURES` and `PAYWALL_COMING_SOON_FEATURES` in `premiumGate.ts`.

---

## 9. Suggested build order

1. **Day 1:** `/privacy`, `/terms`, `/support` — unblock App Store.
2. **Day 2:** `/` landing + `/premium` — marketing ready.
3. **Day 3:** `/user/:userId` SSR shell — wire to profile API when ready.
4. **Later:** Universal links, studio owner portal, blog.

---

## 10. Success criteria

- App Store Connect accepts privacy policy URL.
- Pasting `https://potterynook.app/user/{id}` in WhatsApp shows name + image card (after API live).
- A non-technical potter understands free vs Premium in under 30 seconds on `/premium`.
- All in-app “learn more” / legal links open real pages on mobile Safari/Chrome.
- No dependency on Expo web dev server for any public URL.

---

*Brief derived from app source: `app.json`, `premiumGate.ts`, `cloudStorage.ts`, `onboardingOptions.ts`, `FRONTEND.md`, `BACKEND-TASKS.md` (P1-17, P2-1). Update this doc when monetization or compliance rules change.*
