import { apiListMemberStudios, apiListOwnedStudios } from '@/src/services/studios';
import { useAppStore } from '@/src/store';
import React from 'react';

export function useStudioLinkStatus() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const [hasLinkedStudio, setHasLinkedStudio] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!sessionToken) {
      setHasLinkedStudio(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([apiListMemberStudios(sessionToken), apiListOwnedStudios(sessionToken)])
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
  }, [sessionToken]);

  return { hasLinkedStudio, loading };
}
