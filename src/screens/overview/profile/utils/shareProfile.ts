import { useAppStore } from '@/src/store/appStore';
import { useProfileShareMenu } from '../hooks/useProfileShareMenu';

/** Share menu for the signed-in user's own profile. */
export function useShareProfile() {
  const user = useAppStore((s) => s.user);
  return useProfileShareMenu({
    name: user.name,
    requireAuth: true,
  });
}

export { copyProfileLink, shareProfileLink } from './profileShareActions';
export { buildProfileWebUrl } from './profileLinks';
