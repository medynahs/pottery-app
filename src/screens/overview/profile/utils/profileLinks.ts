const DEFAULT_WEB_BASE = 'https://potterynook.app';
const APP_SCHEME = 'potterynook';

function resolveProfileWebBase(): string {
  const raw = (process.env.EXPO_PUBLIC_PROFILE_WEB_URL ?? '').trim().replace(/\/+$/, '');
  return raw || DEFAULT_WEB_BASE;
}

export function buildProfileWebUrl(userId: string): string {
  return `${resolveProfileWebBase()}/user/${encodeURIComponent(userId)}`;
}

export function buildProfileAppUrl(userId: string): string {
  return `${APP_SCHEME}://user/${encodeURIComponent(userId)}`;
}

export function buildProfileShareMessage(input: {
  userId: string;
  name: string;
}): { title: string; message: string; url: string } {
  const webUrl = buildProfileWebUrl(input.userId);
  const displayName = input.name.trim() || 'My pottery profile';

  // Keep the payload to one https URL — WhatsApp/iMessage only unfurl the first link,
  // and rich previews come from that page's Open Graph tags (not inline text).
  const message = `View ${displayName}'s pottery profile on Pottery Life\n${webUrl}`;

  return {
    title: `${displayName} · Pottery Life`,
    message,
    url: webUrl,
  };
}
