// Ory Kratos native (API) flow helpers for React Native.
// Browser flows use cookies + redirects which don't work in RN, the native
// flow returns a session_token instead which we store and send as
// X-Session-Token on every authenticated request.
//
// Google OAuth uses Ory's "code exchange" pattern for native apps:
//   1. Init a native flow with return_session_token_exchange_code=true
//   2. Grab the request_url from the flow, open it in expo-web-browser
//   3. Ory redirects to potterynook://auth-callback?code=xxx
//   4. Exchange the code for a session_token via /self-service/login/exchange-code

import * as WebBrowser from 'expo-web-browser';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ORY_BASE = 'https://nostalgic-colden-731swclsox.projects.oryapis.com';
// Hardcoded, must match exactly what is registered in Ory's allowed redirect URIs.
// Linking.createURL() produces exp://... in Expo Go which Ory would reject.
const OAUTH_RETURN_TO = 'potterynook://auth-callback';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrySession {
  id: string;
  identity: {
    id: string;
    traits: { email: string };
  };
}

export interface OryLoginResult {
  session: OrySession;
  session_token: string;
}

export interface OryRegistrationResult {
  session: OrySession;
  session_token: string;
  identity: { id: string; traits: { email: string } };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** HTTP error from Ory, carries the status code so callers can distinguish
 *  an invalid/expired session (401) from network failures or other errors. */
export class OryHttpError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'OryHttpError';
  }
}

/** Last-resort messages when Ory's response body carried no usable text. */
function GENERIC_ERROR_BY_STATUS(status: number): string {
  switch (status) {
    case 400:
    case 422:
      return 'Some of the entered details were not accepted. Please check your E-Mail and password and try again.';
    case 401:
    case 403:
      return 'You are not signed in or your session has expired. Please sign in again.';
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return status >= 500
        ? 'The sign-in service is temporarily unavailable. Please try again in a moment.'
        : `Something went wrong (error ${status}). Please try again.`;
  }
}

async function oryFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${ORY_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      // credentials: 'omit' prevents React Native from attaching any Cookie header.
      // Ory's native API flow blocks requests that arrive with cookies (CSRF protection).
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Network error';
    throw new Error(`Ory request failed: ${msg}`);
  }

  if (!res.ok) {
    let detail = '';
    let redirectTo: string | undefined;
    try {
      const rawText = await res.text();
      if (__DEV__) console.warn(`[Ory] ${res.status} from ${path}:\n`, rawText.substring(0, 600));
      const body = JSON.parse(rawText) as {
        error?: { message?: string; reason?: string };
        ui?: {
          messages?: { text?: string; type?: string }[];
          // Field-level validation errors (weak password, malformed email, …)
          // are attached to the individual form nodes, not ui.messages.
          nodes?: Array<{ messages?: { text?: string; type?: string }[] }>;
        };
        message?: string;
        redirect_browser_to?: string;
      };
      redirectTo = body?.redirect_browser_to;
      if (redirectTo) {
        const err = new Error('OIDC_REDIRECT') as Error & { redirectUrl: string };
        (err as unknown as { redirectUrl: string }).redirectUrl = redirectTo;
        throw err;
      }
      const allMessages = [
        ...(body?.ui?.messages ?? []),
        ...(body?.ui?.nodes ?? []).flatMap((n) => n.messages ?? []),
      ];
      const uiMessage =
        allMessages.find((m) => m.type === 'error' && m.text)?.text
        ?? allMessages.find((m) => m.text)?.text;
      detail = uiMessage
        ?? body?.error?.reason
        ?? body?.error?.message
        ?? body?.message
        ?? '';
    } catch (inner) {
      if ((inner as Error).message === 'OIDC_REDIRECT') throw inner;
      // ignore json parse errors
    }
    throw new OryHttpError(detail || GENERIC_ERROR_BY_STATUS(res.status), res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ─── Login ───────────────────────────────────────────────────────────────────

async function initLoginFlow(): Promise<{ id: string }> {
  return oryFetch<{ id: string }>('/self-service/login/api');
}

export async function oryLogin(email: string, password: string): Promise<OryLoginResult> {
  const flow = await initLoginFlow();
  return oryFetch<OryLoginResult>(`/self-service/login?flow=${flow.id}`, {
    method: 'POST',
    body: JSON.stringify({ method: 'password', identifier: email.trim(), password }),
  });
}

// ─── Registration ─────────────────────────────────────────────────────────────

async function initRegistrationFlow(): Promise<{ id: string }> {
  return oryFetch<{ id: string }>('/self-service/registration/api');
}

export async function oryRegister(email: string, password: string): Promise<OryRegistrationResult> {
  const flow = await initRegistrationFlow();
  return oryFetch<OryRegistrationResult>(`/self-service/registration?flow=${flow.id}`, {
    method: 'POST',
    body: JSON.stringify({
      method: 'password',
      traits: { email: email.trim() },
      password,
    }),
  });
}

// ─── Session ─────────────────────────────────────────────────────────────────

export async function oryGetSession(sessionToken: string): Promise<OrySession> {
  return oryFetch<OrySession>('/sessions/whoami', {
    headers: { 'X-Session-Token': sessionToken },
  });
}

// ─── Account recovery (password reset via emailed code) ─────────────────────
//
// Ory native recovery flow:
//   1. Init:   GET  /self-service/recovery/api → flow id
//   2. Email:  POST { method: 'code', email }  → Ory emails a 6-digit code
//   3. Code:   POST { method: 'code', code }   → success returns continue_with
//      containing a fresh ory_session_token (+ a settings flow id)
//   4. Set the new password via the settings flow with that session token.
// The recovery-issued session was just authenticated, so it is privileged to
// change the password without re-entering the old one.

interface OryRecoveryFlow {
  id: string;
  state?: string;
  ui?: { messages?: OryUiMessage[] };
  continue_with?: Array<{
    action: string;
    ory_session_token?: string;
    flow?: { id: string };
  }>;
}

/** Step 1+2: starts a recovery flow and sends the code email. Returns the flow id. */
export async function oryRecoveryStart(email: string): Promise<string> {
  const flow = await oryFetch<{ id: string }>('/self-service/recovery/api');
  const result = await oryFetch<OryRecoveryFlow>(`/self-service/recovery?flow=${flow.id}`, {
    method: 'POST',
    body: JSON.stringify({ method: 'code', email: email.trim() }),
  });
  return result.id ?? flow.id;
}

export interface OryRecoveryResult {
  sessionToken: string;
  settingsFlowId: string | null;
}

/** Step 3: submits the emailed code. Returns a session token for the recovered account. */
export async function oryRecoverySubmitCode(flowId: string, code: string): Promise<OryRecoveryResult> {
  const result = await oryFetch<OryRecoveryFlow>(`/self-service/recovery?flow=${flowId}`, {
    method: 'POST',
    body: JSON.stringify({ method: 'code', code: code.trim() }),
  });
  const continueWith = result.continue_with ?? [];
  const sessionToken = continueWith.find((c) => c.action === 'set_ory_session_token')?.ory_session_token;
  if (!sessionToken) {
    // Invalid/expired codes come back as 200 with the error inside ui.messages.
    const message =
      result.ui?.messages?.find((m) => m.type === 'error')?.text
      ?? result.ui?.messages?.[0]?.text;
    throw new Error(message || 'That code is invalid or has expired. Please try again.');
  }
  const settingsFlowId = continueWith.find((c) => c.action === 'show_settings_ui')?.flow?.id ?? null;
  return { sessionToken, settingsFlowId };
}

// ─── Settings (password change) ──────────────────────────────────────────────

/**
 * Sets a new password for the session's identity via the native settings flow.
 * Used both at the end of account recovery and for "Change Password".
 * Throws OryHttpError 403 if the session is too old (privileged session expired).
 */
export async function orySetPassword(
  sessionToken: string,
  newPassword: string,
  settingsFlowId?: string | null,
): Promise<void> {
  let flowId = settingsFlowId;
  if (!flowId) {
    const flow = await oryFetch<{ id: string }>('/self-service/settings/api', {
      headers: { 'X-Session-Token': sessionToken },
    });
    flowId = flow.id;
  }
  await oryFetch<unknown>(`/self-service/settings?flow=${flowId}`, {
    method: 'POST',
    headers: { 'X-Session-Token': sessionToken },
    body: JSON.stringify({ method: 'password', password: newPassword }),
  });
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function oryLogout(sessionToken: string): Promise<void> {
  await oryFetch<void>('/self-service/logout/api', {
    method: 'DELETE',
    body: JSON.stringify({ session_token: sessionToken }),
  });
}

// ─── Google OAuth (code-exchange flow) ───────────────────────────────────────

interface OryFlowWithCode {
  id: string;
  request_url: string;
  session_token_exchange_code: string;
  ui?: {
    action?: string;
    nodes?: Array<{
      group?: string;
      attributes?: {
        name?: string;
        value?: string;
      };
    }>;
  };
}

interface OryCodeExchangeResult {
  session: OrySession;
  session_token: string;
}

interface OryUiMessage {
  id?: number;
  text?: string;
  type?: string;
}

interface OryLoginFlowContext {
  state?: string;
  ui?: {
    messages?: OryUiMessage[];
  };
}

// Response when submitting oidc method to a native flow, contains the Google redirect URL
interface OryOidcSubmitResult {
  redirect_browser_to: string;
}

// Tracks return_to_codes already exchanged in this JS runtime session.
// Stale iOS deep links are detected here (in-session) or via Ory's 404 (cross-restart).
// In both cases we restart oryGoogleOAuth, the stale URL was consumed by the first
// openAuthSessionAsync call, so the restart opens cleanly without any stale delivery.
const _consumedReturnToCodes = new Set<string>();

/**
 * Native Google OAuth via Ory code-exchange:
 *  1. Init native login flow with return_session_token_exchange_code=true
 *  2. POST {method:"oidc", provider:"google"} to get redirect_browser_to
 *  3. Open redirect_browser_to in in-app browser
 *  4. Ory redirects back to potterynook://auth-callback?code=xxx
 *  5. Exchange init_code + code for session_token
 *
 * Stale deep-link handling (iOS):
 *   iOS can deliver the previous sign-in's potterynook:// callback URL to the
 *   next openAuthSessionAsync call. The exchange then returns 404 because the
 *   code belongs to a different flow's STC.
 *
 *   Fix: up to MAX_ATTEMPTS outer retries. Each retry creates a completely fresh
 *   Ory flow (new STC + new Google OAuth URL). We NEVER re-open the same
 *   browserUrl on failure because Google's OAuth state is single-use, re-using
 *   it causes Ory to reject the callback as a replay, causing an infinite loop.
 *
 *   On the first retry the iOS-queued stale URL has already been consumed by
 *   attempt 0's openAuthSessionAsync, so the real browser opens on attempt 1.
 */
async function oryGoogleOAuth(
  flowType: 'login' | 'registration',
): Promise<OryLoginResult> {
  const MAX_ATTEMPTS = 3;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // 1. Init a fresh native flow on every attempt.
    let flow: OryFlowWithCode;
    try {
      flow = await oryFetch<OryFlowWithCode>(
        `/self-service/${flowType}/api?return_session_token_exchange_code=true&return_to=${encodeURIComponent(OAUTH_RETURN_TO)}`
      );
    } catch (e) {
      const msg = (e as Error).message;
      throw new Error(`Step 1 failed: ${msg}\n\nThe BE must add "${OAUTH_RETURN_TO}" to Ory's selfservice.allowed_return_urls.`);
    }

    if (!flow.session_token_exchange_code) {
      throw new Error(
        'Step 1 failed: Ory did not return a session_token_exchange_code. ' +
        'Ensure return_session_token_exchange_code=true is supported for this project and that ' +
        `"${OAUTH_RETURN_TO}" is in Ory's selfservice.allowed_return_urls.`
      );
    }

    const oidcProviderId = flow.ui?.nodes
      ?.find((node) => node.group === 'oidc' && node.attributes?.name === 'provider')
      ?.attributes?.value;
    if (!oidcProviderId) {
      throw new Error('Step 2 failed: OIDC provider is missing from flow UI nodes.');
    }

    // 2. Submit OIDC provider → get Google redirect URL.
    let browserUrl: string;
    try {
      const submitResult = await oryFetch<OryOidcSubmitResult>(
        `/self-service/${flowType}?flow=${flow.id}`,
        { method: 'POST', body: JSON.stringify({ method: 'oidc', provider: oidcProviderId }) }
      );
      browserUrl = submitResult.redirect_browser_to;
    } catch (e) {
      const oidcErr = e as Error & { redirectUrl?: string };
      if (oidcErr.message === 'OIDC_REDIRECT' && oidcErr.redirectUrl) {
        browserUrl = oidcErr.redirectUrl;
      } else {
        const msg = oidcErr.message;
        throw new Error(`Step 2 failed: ${msg}`);
      }
    }

    if (!browserUrl) throw new Error('Ory did not return a Google redirect URL.');

    // 3. Open the in-app browser once per attempt.
    // preferEphemeralSession: true → uses a sandboxed ASWebAuthenticationSession
    // that does NOT share cookies with Safari. Without this, after a logout the
    // stale Ory browser-session cookie is sent on the next sign-in, causing the
    // OIDC completion to be paired with the wrong flow → 404 on token exchange.
    const res = await WebBrowser.openAuthSessionAsync(browserUrl, OAUTH_RETURN_TO, {
      preferEphemeralSession: true,
    });
    if (res.type !== 'success' || !(res as { url?: string }).url) {
      throw new Error('Google sign-in was cancelled or failed.');
    }

    const callbackUrl = (res as { url: string }).url;
    // Stop at & or #, a fragment suffix would corrupt the code value
    const codeMatch   = callbackUrl.match(/[?&]code=([^&#]+)/);
    const flowMatch   = callbackUrl.match(/[?&]flow=([^&#]+)/);
    const code        = codeMatch?.[1] ? decodeURIComponent(codeMatch[1]) : null;
    const flowId      = flowMatch?.[1] ? decodeURIComponent(flowMatch[1]) : null;

    if (!code && !flowId) {
      throw new Error('No return_to_code (code/flow) found in the redirect URL.');
    }

    // OIDC completed but Ory returned a flow ID instead of an exchange code -
    // fetch the flow to surface a human-readable error message.
    if (!code && flowId) {
      let flowMessage = '';
      let duplicateIdentifierMessage = false;
      try {
        const continuedFlow = await oryFetch<OryLoginFlowContext>(
          `/self-service/${flowType}/flows?id=${encodeURIComponent(flowId)}`
        );
        const messages = continuedFlow.ui?.messages ?? [];
        flowMessage = messages.find((m) => !!m.text)?.text ?? '';
        duplicateIdentifierMessage = messages.some(
          (m) => m.id === 1010016 || /already used by another account/i.test(m.text ?? '')
        );
      } catch {
        // fall through
      }
      if (duplicateIdentifierMessage) {
        throw new Error(
          'This Google email is already linked to an existing account. Sign in with email/password first, then link Google from account settings.'
        );
      }
      throw new Error(
        flowMessage ||
        'Google sign-in did not return an exchange code. Please try again.'
      );
    }

    // Stale code already consumed in this JS session → retry with a fresh flow.
    // Do NOT re-open the same browserUrl: Google's OAuth state is single-use and
    // Ory would reject the callback as a replay.
    if (_consumedReturnToCodes.has(code as string)) {
      if (attempt < MAX_ATTEMPTS - 1) continue;
      throw new Error('Google sign-in failed: received a stale redirect. Please try again.');
    }

    // 5. Exchange STC + code for a session token.
    // "no session yet for this code" is a transient 422, Ory hasn't finished
    // creating the session after the OIDC callback yet. Poll with short retries.
    const exchangeUrl = `/sessions/token-exchange?init_code=${encodeURIComponent(flow.session_token_exchange_code)}&return_to_code=${encodeURIComponent(code as string)}`;
    const EXCHANGE_POLLS = 6;
    let retryWithFreshFlow = false;
    for (let ex = 0; ex < EXCHANGE_POLLS; ex++) {
      try {
        const exchangeResult = await oryFetch<OryLoginResult>(exchangeUrl, { cache: 'no-store' });
        _consumedReturnToCodes.add(code as string);
        return exchangeResult;
      } catch (e) {
        const msg = (e as Error).message;
        // Ory 422: "The native session hasn't been set yet, try again later."
        if (/no session yet|hasn't been set yet|wait for native session/i.test(msg)) {
          if (ex < EXCHANGE_POLLS - 1) {
            // Transient: Ory is still processing the OIDC callback, wait and poll
            await sleep(700);
            continue;
          }
          // Polls exhausted, code is a permanent mismatch (stale return_to_code),
          // restart with a completely fresh flow + new browser session
          if (attempt < MAX_ATTEMPTS - 1) {
            _consumedReturnToCodes.add(code as string);
            retryWithFreshFlow = true;
            break;
          }
        }

        if (/could not be found|no resumable session/i.test(msg) && attempt < MAX_ATTEMPTS - 1) {
          _consumedReturnToCodes.add(code as string);
          retryWithFreshFlow = true;
          break;
        }

        throw new Error(`Google sign-in failed: ${msg}`);
      }
    }
    if (retryWithFreshFlow) continue;
  }

  throw new Error('Google sign-in failed. Please try again.');
}

export function oryGoogleSignIn(): Promise<OryLoginResult> {
  return oryGoogleOAuth('login');
}

export function oryGoogleRegister(): Promise<OryLoginResult> {
  return oryGoogleOAuth('registration');
}
