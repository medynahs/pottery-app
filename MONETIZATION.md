# Monetization principles

**Last updated:** June 2026

## Tiers

| Tier | Price (EUR) | Who pays | Channel |
|------|-------------|----------|---------|
| **Free** | €0 | Everyone | App |
| **Premium** | €4.99/mo · €34.99/yr | Individual potters | App IAP (RevenueCat `PotteryNook Pro`) |
| **Studio Free** | €0 | Studio owners | App (≤10 active members) |
| **Studio Pro** | €24/mo · €199/yr | Studio owners | Web SaaS + Stripe (future) |

## Locked principles

1. **Members never pay** to link to a studio — adoption depends on frictionless member onboarding.
2. **Core studio loop stays free** — join, opt-in queue submit, read-only schedule, basic alerts.
3. **Personal Premium ≠ Studio** — photos, atlas depth, personal analytics on IAP; ops ledger and statements on Studio Pro (web).
4. **Solo-in-studio is first-class** — members whose studio has not adopted PN get full personal journal + community; invite-owner flow, not dead ends.
5. **One app, role-based UX** — five onboarding archetypes change defaults and copy, not separate app SKUs.

## What is gated

### Free (all personas)

- Piece journal, personal kiln ops, community feed, challenges, friends
- Studio join + queue submit + schedule (when studio loop ships)
- Member fee balance view (read-only)

### Premium (individual IAP)

- Unlimited photos per piece
- Glaze atlas beyond 15 entries
- Analytics, export, backup
- Companion swap, unlimited missions, Studio Rhythm advanced

### Studio Pro (owner, web — future)

- Member firing ledger + mark paid
- Monthly PDF statements, CSV export
- Intake at scale, shelf map, push templates
- \>10 active members (Studio Free cap)

## Archetype paywall copy

Contextual headlines use `getPremiumUpgradeHeadline()` and `getPremiumFeatureDescription()` in [`src/utils/premiumGate.ts`](src/utils/premiumGate.ts) based on `onboardingProfile.userType`.

## Related docs

- [`FRONTEND.md`](FRONTEND.md) — V1 release tickets
- [`.cursor/plans/monetization_persona_split_a76d203e.plan.md`](../.cursor/plans/monetization_persona_split_a76d203e.plan.md) — full persona matrix
