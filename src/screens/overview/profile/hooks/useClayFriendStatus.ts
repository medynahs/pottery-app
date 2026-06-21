import {
  apiListFriends,
  apiListIncomingFriendRequests,
  apiListOutgoingFriendRequests,
} from '@/src/services/friends';
import { useCallback, useEffect, useState } from 'react';

export type ClayFriendStatus = 'self' | 'friend' | 'pending_outgoing' | 'none';

export function useClayFriendStatus(
  targetUserId: string | undefined,
  viewerUserId: string | null | undefined,
  sessionToken: string | null | undefined,
) {
  const [status, setStatus] = useState<ClayFriendStatus>('none');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!targetUserId) {
      setStatus('none');
      setLoading(false);
      return;
    }

    if (!viewerUserId || !sessionToken) {
      setStatus('none');
      setLoading(false);
      return;
    }

    if (targetUserId === viewerUserId) {
      setStatus('self');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [friends, outgoing] = await Promise.all([
        apiListFriends(sessionToken),
        apiListOutgoingFriendRequests(sessionToken),
      ]);

      if ((friends ?? []).some((friend) => friend.id === targetUserId)) {
        setStatus('friend');
        return;
      }

      const pendingOutgoing = (outgoing ?? []).some(
        (request) => request.addressee_id === targetUserId && request.status === 'pending',
      );
      if (pendingOutgoing) {
        setStatus('pending_outgoing');
        return;
      }

      // Incoming requests are handled on Friends tab; viewer can accept there.
      void apiListIncomingFriendRequests(sessionToken);
      setStatus('none');
    } catch {
      setStatus('none');
    } finally {
      setLoading(false);
    }
  }, [sessionToken, targetUserId, viewerUserId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { status, loading, reload };
}
