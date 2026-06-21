import { type PickSheetOption } from '@/src/components/AppSheets';
import { useAppStore } from '@/src/store/appStore';
import { useCallback, useMemo, useState } from 'react';
import { copyProfileLink, shareProfileLink } from '../utils/profileShareActions';

type UseProfileShareMenuOptions = {
  /** Defaults to signed-in user's backend id when omitted. */
  userId?: string | null;
  name: string;
  requireAuth?: boolean;
};

export function useProfileShareMenu({
  userId: userIdProp,
  name,
  requireAuth = false,
}: UseProfileShareMenuOptions) {
  const backendUserId = useAppStore((s) => s.backendUserId);
  const showToast = useAppStore((s) => s.showToast);
  const [visible, setVisible] = useState(false);

  const userId = userIdProp ?? backendUserId;

  const openShareMenu = useCallback(() => {
    if (requireAuth && !backendUserId) {
      showToast('Sign in to share your profile link', 'error');
      return;
    }
    if (!userId) {
      showToast('Profile link unavailable', 'error');
      return;
    }
    setVisible(true);
  }, [backendUserId, requireAuth, showToast, userId]);

  const closeShareMenu = useCallback(() => setVisible(false), []);

  const options = useMemo<PickSheetOption[]>(() => {
    if (!userId) return [];

    const displayName = name.trim() || 'My pottery profile';

    return [
      {
        label: 'Share link',
        onPress: () => {
          closeShareMenu();
          void (async () => {
            const result = await shareProfileLink({ userId, name: displayName });
            if (result === 'failed') {
              showToast('Could not open share sheet', 'error');
            }
          })();
        },
      },
      {
        label: 'Copy link',
        onPress: () => {
          closeShareMenu();
          void (async () => {
            await copyProfileLink(userId);
            showToast('Profile link copied', 'success');
          })();
        },
      },
    ];
  }, [closeShareMenu, name, showToast, userId]);

  return {
    shareMenuVisible: visible,
    shareMenuOptions: options,
    openShareMenu,
    closeShareMenu,
  };
}
