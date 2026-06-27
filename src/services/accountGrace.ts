import {
  ACCOUNT_DELETED_CODE,
  ApiError,
  fetchMe,
  isAccountDeletedError,
  type BackendProfile,
} from './api';

function responseIndicatesDeletionGrace(status: number, body: string): boolean {
  if (status !== 403) return false;
  const normalized = body.toLowerCase();
  return (
    normalized.includes(ACCOUNT_DELETED_CODE)
    || normalized.includes('account deleted')
    || normalized.includes('account is deleted')
    || normalized.includes('scheduled for deletion')
  );
}

/** Soft-delete grace window — backend hard-purges after 30 days (`deleted_at`). */
export const ACCOUNT_DELETION_GRACE_DAYS = 30;

export function isWithinDeletionGraceWindow(scheduledAt: string | null | undefined): boolean {
  if (!scheduledAt) return false;
  const parsed = Date.parse(scheduledAt);
  if (Number.isNaN(parsed)) return false;
  return daysRemainingInDeletionGrace(scheduledAt) > 0;
}

export function accountDeletionGraceSubtitle(scheduledAt: string | null | undefined): string {
  if (!scheduledAt || !isWithinDeletionGraceWindow(scheduledAt)) {
    return `Your account is in a ${ACCOUNT_DELETION_GRACE_DAYS}-day deletion grace period. Restore it to keep your studio.`;
  }
  const daysLeft = daysRemainingInDeletionGrace(scheduledAt);
  if (daysLeft === 0) {
    return 'Permanent deletion happens today. Restore now to keep your studio.';
  }
  return `Permanent deletion in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Restore now to keep your pieces, glazes, and profile.`;
}

/** True only when the API has confirmed soft-delete grace (403 / profile flag). */
export function isAccountInDeletionGrace(
  graceFlag: boolean,
  _scheduledAt?: string | null,
): boolean {
  return graceFlag;
}

/** Call when any API returns 403 account_deleted during the grace window. */
export function syncAccountDeletionGraceFromError(error: unknown): boolean {
  if (isAccountDeletedError(error)) {
    return true;
  }
  if (error instanceof ApiError && error.status === 403) {
    return responseIndicatesDeletionGrace(error.status, error.message);
  }
  if (error && typeof error === 'object') {
    const record = error as { status?: number; message?: string; details?: string | null };
    if (record.status === 403) {
      const haystack = `${record.message ?? ''} ${record.details ?? ''}`;
      return responseIndicatesDeletionGrace(403, haystack);
    }
  }
  return false;
}

export function markAccountDeletionGraceFromError(
  error: unknown,
  setGrace: (value: boolean) => void,
): boolean {
  if (!syncAccountDeletionGraceFromError(error)) return false;
  setGrace(true);
  return true;
}

export function profileIndicatesDeletionGrace(profile: BackendProfile): boolean {
  return profile.is_deleted === true;
}

/** Best timestamp for counting down the grace window (prefer API `deleted_at`). */
export function deletionScheduledAtFromProfile(profile: BackendProfile): string | null {
  return profile.deleted_at ?? profile.updated_at ?? null;
}

/** ISO timestamp when deletion was requested (API `updated_at` on soft-delete). */
export function deletionGraceEndsAt(scheduledAt: string): Date {
  const end = new Date(scheduledAt);
  end.setDate(end.getDate() + ACCOUNT_DELETION_GRACE_DAYS);
  return end;
}

export function daysRemainingInDeletionGrace(scheduledAt: string): number {
  const ms = deletionGraceEndsAt(scheduledAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/**
 * Returns true when the backend user is in the soft-delete grace window.
 * During grace, only POST /users/me/revive is allowed — studio APIs return 403.
 */
export async function detectAccountDeletionGrace(): Promise<boolean> {
  try {
    const profile = await fetchMe();
    return profileIndicatesDeletionGrace(profile);
  } catch (error) {
    if (isAccountDeletedError(error)) return true;
    if (error instanceof ApiError && error.status === 403) {
      return responseIndicatesDeletionGrace(error.status, error.message);
    }
    return false;
  }
}
