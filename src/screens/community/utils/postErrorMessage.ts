import { CommunityApiError } from '@/src/services/community';
import { CommunityUploadError } from '@/src/services/communityUpload';
import { isNetworkFailure, networkFailureMessage } from '@/src/utils/networkErrors';

export function resolveCommunityPostError(error: unknown): string {
  if (error instanceof CommunityUploadError) {
    if (error.status == null || isNetworkFailure(error)) {
      return networkFailureMessage('upload');
    }
    return error.message;
  }

  if (error instanceof CommunityApiError) {
    if (error.status === 0 || isNetworkFailure(error)) {
      return networkFailureMessage('post');
    }
    if (error.status === 401) {
      return 'Your session expired. Sign in again, then try posting.';
    }
    if (error.details?.trim()) {
      return error.details.trim();
    }
    if (error.status >= 500) {
      return 'Our servers are busy right now. Wait a moment and try again.';
    }
    return 'Could not publish your post. Please try again.';
  }

  if (isNetworkFailure(error)) {
    return networkFailureMessage('post');
  }

  if (error instanceof Error && error.message.trim()) {
    const msg = error.message.trim();
    if (!msg.includes('→') && !msg.startsWith('POST /')) {
      return msg;
    }
  }

  return 'Could not publish your post. Please try again.';
}
