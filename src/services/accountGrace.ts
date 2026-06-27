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
