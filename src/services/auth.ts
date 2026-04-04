// Ory Kratos native (API) flow helpers for React Native.
// Browser flows use cookies + redirects which don't work in RN — the native
// flow returns a session_token instead which we store and send as
// X-Session-Token on every authenticated request.
//
// Google OAuth uses Ory's "code exchange" pattern for native apps:
//   1. Init a native flow with return_session_token_exchange_code=true
//   2. Grab the request_url from the flow — open it in expo-web-browser
//   3. Ory redirects to potterylife://auth-callback?code=xxx
//   4. Exchange the code for a session_token via /self-service/login/exchange-code

import * as WebBrowser from 'expo-web-browser';

const ORY_BASE = 'https://nostalgic-colden-731swclsox.projects.oryapis.com';
// Hardcoded — must match exactly what is registered in Ory's allowed redirect URIs.
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

async function oryFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${ORY_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
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
      const body = (await res.json()) as {
        error?: { message?: string };
        ui?: { messages?: { text: string }[] };
        message?: string;
        redirect_browser_to?: string;
      };
      // Ory returns 422 with redirect_browser_to when an OIDC provider needs a browser redirect
      redirectTo = body?.redirect_browser_to;
      if (redirectTo) {
        // Re-throw as a special error the caller can detect
        const err = new Error('OIDC_REDIRECT') as Error & { redirectUrl: string };
        (err as unknown as { redirectUrl: string }).redirectUrl = redirectTo;
        throw err;
      }
      detail = body?.ui?.messages?.[0]?.text ?? body?.error?.message ?? body?.message ?? '';
    } catch (inner) {
      if ((inner as Error).message === 'OIDC_REDIRECT') throw inner;
      // ignore json parse errors
    }
    throw new Error(detail || `Request failed (${res.status})`);
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
}

interface OryCodeExchangeResult {
  session: OrySession;
  session_token: string;
}

// Response when submitting oidc method to a native flow — contains the Google redirect URL
interface OryOidcSubmitResult {
  redirect_browser_to: string;
}

/**
 * Native Google OAuth via Ory code-exchange (correct 5-step pattern):
 *  1. Init native login flow with return_session_token_exchange_code=true
 *  2. POST {method:"oidc", provider:"google"} to get redirect_browser_to
 *  3. Open redirect_browser_to in in-app browser
 *  4. Ory redirects back to potterynook://auth-callback?code=xxx
 *  5. Exchange init_code + code for session_token
 *
 * Common failure: step 1 returns "malformed or invalid parameters" when
 * OAUTH_RETURN_TO is not in Ory's selfservice.allowed_return_urls config.
 * Fix: BE must run:
 *   ory patch identity-config <project-id> \
 *     --add '/selfservice/allowed_return_urls/-' '"potterynook://auth-callback"'
 * OR add it in Ory Console → Customize → General → Allowed Return URLs.
 */
async function oryGoogleOAuth(
  flowType: 'login' | 'registration',
): Promise<OryLoginResult> {
  const returnTo = OAUTH_RETURN_TO;

  // 1. Init native flow — OAUTH_RETURN_TO must be in Ory's allowed_return_urls
  let flow: OryFlowWithCode;
  try {
    flow = await oryFetch<OryFlowWithCode>(
      `/self-service/${flowType}/api?return_session_token_exchange_code=true&return_to=${encodeURIComponent(returnTo)}`
    );
  } catch (e) {
    const msg = (e as Error).message;
    if (__DEV__) console.error('[Ory] Step 1 (init flow) failed:', msg);
    throw new Error(`Step 1 failed: ${msg}\n\nThe BE must add "${returnTo}" to Ory's selfservice.allowed_return_urls.`);
  }

  if (__DEV__) console.log('[Ory] Step 1 OK — flow id:', flow.id, 'exchange code:', flow.session_token_exchange_code);

  // 2. Submit OIDC provider to the native flow → Ory returns 422 + redirect_browser_to
  let browserUrl: string;
  try {
    const submitResult = await oryFetch<OryOidcSubmitResult>(
      `/self-service/${flowType}?flow=${flow.id}`,
      {
        method: 'POST',
        body: JSON.stringify({ method: 'oidc', provider: 'google' }),
      }
    );
    browserUrl = submitResult.redirect_browser_to;
  } catch (e) {
    const oidcErr = e as Error & { redirectUrl?: string };
    if (oidcErr.message === 'OIDC_REDIRECT' && oidcErr.redirectUrl) {
      browserUrl = oidcErr.redirectUrl;
    } else {
      const msg = oidcErr.message;
      if (__DEV__) console.error('[Ory] Step 2 (submit oidc) failed:', msg);
      throw new Error(`Step 2 failed: ${msg}\n\nCheck that the Ory Google provider ID is exactly "google".`);
    }
  }

  if (__DEV__) console.log('[Ory] Step 2 OK — browserUrl:', browserUrl?.substring(0, 120));

  if (!browserUrl) {
    throw new Error('Ory did not return a Google redirect URL.');
  }

  // 3. Open Google's auth page; watch for the potterynook:// scheme to detect return
  const result = await WebBrowser.openAuthSessionAsync(browserUrl, returnTo);

  if (__DEV__) console.log('[Ory] Step 3 browser result:', result.type, (result as { url?: string }).url?.substring(0, 120));

  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign-in was cancelled or failed.');
  }

  // 4. Extract the exchange code from the redirect URL query string
  const codeMatch = result.url.match(/[?&]code=([^&]+)/);
  const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;
  if (__DEV__) console.log('[Ory] Step 4 — redirect url:', result.url.substring(0, 120), '— code found:', !!code);
  if (!code) {
    throw new Error(`No auth code in redirect URL.\nReceived: ${result.url}`);
  }

  // 5. Exchange init_code + code for a session_token
  try {
    return await oryFetch<OryLoginResult>(
      `/self-service/login/exchange-code?init_code=${encodeURIComponent(flow.session_token_exchange_code)}&return_to=${encodeURIComponent(code)}`
    );
  } catch (e) {
    const msg = (e as Error).message;
    if (__DEV__) console.error('[Ory] Step 5 (exchange code) failed:', msg);
    throw new Error(`Step 5 failed: ${msg}`);
  }
}

export function oryGoogleSignIn(): Promise<OryLoginResult> {
  return oryGoogleOAuth('login');
}

export function oryGoogleRegister(): Promise<OryLoginResult> {
  return oryGoogleOAuth('registration');
}
