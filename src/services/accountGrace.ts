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

export function profileIndicatesDeletionGrace(profile: BackendProfile): boolean {
  return profile.is_deleted === true;
}

/**
 * Returns true when the backend user is in the soft-delete grace window.
 * During grace, only POST /users/me/revive is allowed — studio APIs return 403.
 */
export async function detectAccountDeletionGrace(sessionToken: string): Promise<boolean> {
  try {
    const profile = await fetchMe(sessionToken);
    return profileIndicatesDeletionGrace(profile);
  } catch (error) {
    if (isAccountDeletedError(error)) return true;
    if (error instanceof ApiError && error.status === 403) {
      return responseIndicatesDeletionGrace(error.status, error.message);
    }
    return false;
  }
}
