import type { OnboardingUserType } from '@/src/store/appStore';
import type { CommunityPostKind } from '@/src/screens/community/utils/createPostCompose';
import {
  COMMUNITY_POST_KINDS,
  type AskTopic,
} from '@/src/screens/community/utils/createPostCompose';

export function getDefaultCommunityPostKind(
  userType: OnboardingUserType,
  canPostStudioNotice: boolean,
): CommunityPostKind {
  switch (userType) {
    case 'business-owner':
      return 'piece_journal';
    case 'studio-potter':
      return 'ask_community';
    case 'studio-owner-technician':
      return canPostStudioNotice ? 'studio_notice' : 'kiln_firing';
    default:
      return 'update';
  }
}

export function getDefaultAskTopic(userType: OnboardingUserType): AskTopic {
  if (userType === 'studio-potter') return 'glaze';
  return 'general';
}

export function getAvailablePostKinds(canPostStudioNotice: boolean) {
  return COMMUNITY_POST_KINDS.filter(
    (kind) => kind.id !== 'studio_notice' || canPostStudioNotice,
  );
}
