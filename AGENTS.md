# Kilnkins app (pottery-app) — agent conventions

Expo / React Native (expo-router, NativeWind, TypeScript). Client for the Go API in the sibling `pottery-api` repo. **Offline-first:** the local Zustand store is the source of truth, synced to the backend.

## Docs — read, don't duplicate

- `FRONTEND.md` — V1 tickets, product decisions, per-tab roadmaps.
- `BACKEND.md` — API overview + sync patterns. `BACKEND-TASKS.md` — BE backlog. `README.md` — setup.

## Codebase map

- `app/` — expo-router file-based routes. Tabs in `app/(tabs)/` (overview, pieces, kiln, community). Root providers + React Query client in `app/_layout.tsx`.
- `src/screens/<feature>/` — screen UI plus `hooks/use*Sync.ts`, the offline sync bridges (pull on sign-in, debounced push, merge by `client_ref` / `backendId`).
- `src/services/<feature>.ts` — typed API clients (`services/api.ts`, `services/pieces.ts`, …). Each fn takes `sessionToken`, attaches auth, and throws `ApiError` (`.status`; 401 ⇒ session expired). `services/index.ts` is thin/legacy + holds base-URL resolution.
- `src/store/` — Zustand `appStore.ts` (+ AsyncStorage persist) holds local state incl. `sessionToken` / `backendUserId`. `secureStorage.ts` keeps the session token + Ory identity in expo-secure-store (Keychain/Keystore), **not** AsyncStorage.
- `src/hooks/` — cross-feature hooks (`useCurrentUser` = `GET /users/me` via React Query, key `['me']`).
- `src/components/ui/` — UI primitives (NativeWind + CVA). `src/types/` — shared types.

## Conventions

- Server state = React Query (per-feature query keys); local/offline state = Zustand. Sync hooks reconcile the two.
- API base URL from `EXPO_PUBLIC_API_BASE_URL` (`src/services/index.ts`), defaults to prod; localhost needs `EXPO_PUBLIC_ALLOW_LOCAL_API=true`.
- Local piece **stage** ≠ API **status** — map via `LOCAL_STAGE_TO_API` / `API_TO_LOCAL_STAGE` (`services/pieces.ts`).
- Always pass `sessionToken` to service fns; treat `ApiError.status === 401` as sign-out (`clearSession`).
