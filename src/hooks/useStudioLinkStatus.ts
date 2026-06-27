import { apiListMemberStudios, apiListOwnedStudios } from '@/src/services/studios';
import { useAppStore } from '@/src/store';
import React from 'react';

export function useStudioLinkStatus() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const [hasLinkedStudio, setHasLinkedStudio] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isSignedIn) {
      setHasLinkedStudio(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([apiListMemberStudios(), apiListOwnedStudios()])
      .then(([memberStudios, ownedStudios]) => {
        if (cancelled) return;
        const count = (memberStudios?.length ?? 0) + (ownedStudios?.length ?? 0);
        setHasLinkedStudio(count > 0);
      })
      .catch(() => {
        if (!cancelled) setHasLinkedStudio(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  return { hasLinkedStudio, loading };
}
