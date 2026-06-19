import type { CommunityPostComposerPreset } from '@/src/screens/community/types/composerPreset';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import React from 'react';

export function useCommunityComposer() {
  const router = useRouter();
  const openCommunityPostComposer = useAppStore((s) => s.openCommunityPostComposer);

  return React.useCallback(
    (preset: CommunityPostComposerPreset) => {
      openCommunityPostComposer(preset);
      router.push('/(tabs)/community');
    },
    [openCommunityPostComposer, router],
  );
}
