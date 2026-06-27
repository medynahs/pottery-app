import { apiListOwnedStudios } from '@/src/services/studios';
import { useAppStore } from '@/src/store';
import React from 'react';

export function useCanPostStudioNotice() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const userType = useAppStore((s) => s.onboardingProfile.userType);
  const [canPost, setCanPost] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isSignedIn) {
      setCanPost(false);
      return;
    }

    if (userType !== 'studio-owner-technician') {
      setCanPost(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiListOwnedStudios()
      .then((owned) => {
        if (!cancelled) setCanPost((owned?.length ?? 0) > 0);
      })
      .catch(() => {
        if (!cancelled) setCanPost(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userType]);

  return { canPostStudioNotice: canPost, loading };
}
