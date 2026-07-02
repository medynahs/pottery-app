import Constants from 'expo-constants';
import Session from 'supertokens-react-native';
import { API_BASE_URL as API_BASE } from './index';

// Native Google Sign-In ships a native module that Expo Go can't load. Gate every
// touch of it behind this so the app still boots there (email/password, resets and
// the supertokens-react-native session are all pure JS and keep working).
export const isExpoGo = Constants.appOwnership === 'expo';

// ─── Types ───────────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UserCancelledError extends Error {
  constructor() {
    super('Sign-in was cancelled.');
    this.name = 'UserCancelledError';
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type FdiFormField = { id: string; value: string };

function fdiBody(formFields: FdiFormField[]): string {
  return JSON.stringify({ formFields });
}

async function fdiPost(path: string, body: string): Promise<Response> {
  const url = `${API_BASE}${path}`;
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown network error';
    throw new AuthError(`Cannot reach server at ${API_BASE}. ${reason}`);
  }
}

function firstFieldError(data: { formFields?: { id: string; error?: string }[] }): string | undefined {
  return data.formFields?.find((f) => f.error)?.error;
}

// ─── Email/password ───────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<void> {
  const res = await fdiPost(
    '/auth/signin',
    fdiBody([{ id: 'email', value: email.trim() }, { id: 'password', value: password }]),
  );
  const data = await res.json() as { status: string; formFields?: { id: string; error?: string }[] };
  if (data.status === 'OK') return;
  const msg =
    firstFieldError(data)
    ?? (data.status === 'WRONG_CREDENTIALS_ERROR' ? 'Incorrect email or password.' : undefined)
    ?? data.status
    ?? 'Sign in failed.';
  throw new AuthError(msg, res.status);
}

export async function register(email: string, password: string): Promise<void> {
  const res = await fdiPost(
    '/auth/signup',
    fdiBody([{ id: 'email', value: email.trim() }, { id: 'password', value: password }]),
  );
  const data = await res.json() as { status: string; formFields?: { id: string; error?: string }[] };
  if (data.status === 'OK') return;
  const msg =
    firstFieldError(data)
    ?? (data.status === 'EMAIL_ALREADY_EXISTS_ERROR' ? 'An account with this email already exists.' : undefined)
    ?? data.status
    ?? 'Registration failed.';
  throw new AuthError(msg, res.status);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await fdiPost(
    '/auth/user/password/reset/token',
    fdiBody([{ id: 'email', value: email.trim() }]),
  );
  // Always resolves - no enumeration on whether the email exists.
}

export async function changePassword(newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/me/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new AuthError(body || `Change password failed (${res.status})`, res.status);
  }
}

// ─── Session ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await Session.signOut();
}

export async function sessionExists(): Promise<boolean> {
  return Session.doesSessionExist();
}

// ─── Google OAuth (native Google Sign-In → SuperTokens ThirdParty FDI) ────────

export async function googleSignIn(): Promise<string> {
  if (isExpoGo) {
    throw new AuthError('Google sign-in needs a development build; it is not available in Expo Go.');
  }
  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } =
    require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) throw new UserCancelledError();

    const serverAuthCode = response.data.serverAuthCode;
    if (!serverAuthCode) {
      throw new AuthError('No serverAuthCode from Google (check offlineAccess + webClientId).');
    }

    const res = await fdiPost(
      '/auth/signinup',
      JSON.stringify({
        thirdPartyId: 'google',
        redirectURIInfo: {
          redirectURIOnProviderDashboard: '',
          redirectURIQueryParams: { code: serverAuthCode },
        },
      }),
    );
    const data = await res.json() as { status: string; user?: { email?: string; emails?: string[] } };
    if (data.status !== 'OK') throw new AuthError(data.status ?? 'Google sign-in failed.');
    return data.user?.email ?? data.user?.emails?.[0] ?? '';
  } catch (e) {
    if (e instanceof UserCancelledError || e instanceof AuthError) throw e;
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) throw new UserCancelledError();
    throw new AuthError(e instanceof Error ? e.message : 'Google sign-in failed.');
  }
}
