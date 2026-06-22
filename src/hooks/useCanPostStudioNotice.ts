import { apiListOwnedStudios } from '@/src/services/studios';
import { useAppStore } from '@/src/store';
import React from 'react';

export function useCanPostStudioNotice() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const userType = useAppStore((s) => s.onboardingProfile.userType);
  const [canPost, setCanPost] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!sessionToken) {
      setCanPost(false);
      return;
    }

    if (userType !== 'studio-owner-technician') {
      setCanPost(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiListOwnedStudios(sessionToken)
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
  }, [sessionToken, userType]);

  return { canPostStudioNotice: canPost, loading };
}
