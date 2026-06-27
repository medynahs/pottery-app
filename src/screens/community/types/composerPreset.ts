import type { CommunityPostKind } from '@/src/screens/community/utils/createPostCompose';

export type CommunityPostComposerPreset = {
  kind: CommunityPostKind;
  pieceId?: number;
  pieceIds?: number[];
  firingId?: string;
  firingName?: string;
  firingType?: string;
  cone?: string;
  photoUri?: string;
  caption?: string;
};
