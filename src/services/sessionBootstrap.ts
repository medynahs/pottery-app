/** Suppress reactive 401 sign-out while login / cold-start auth settles. */
const SESSION_BOOTSTRAP_MS = 30_000;
let sessionBootstrapUntil = 0;

export function markSessionBootstrap() {
  sessionBootstrapUntil = Date.now() + SESSION_BOOTSTRAP_MS;
}

export function isSessionBootstrapActive(): boolean {
  return Date.now() < sessionBootstrapUntil;
}
