import * as Clipboard from 'expo-clipboard';
import { Platform, Share } from 'react-native';
import { buildProfileShareMessage, buildProfileWebUrl } from './profileLinks';

export type ProfileShareResult = 'shared' | 'dismissed' | 'failed';

export async function shareProfileLink(input: {
  userId: string;
  name: string;
}): Promise<ProfileShareResult> {
  const { title, message, url } = buildProfileShareMessage(input);

  try {
    const result = await Share.share(
      Platform.OS === 'ios' ? { title, url } : { title, message },
      { subject: title, dialogTitle: title },
    );
    return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
  } catch {
    return 'failed';
  }
}

export async function copyProfileLink(userId: string): Promise<string> {
  const url = buildProfileWebUrl(userId);
  await Clipboard.setStringAsync(url);
  return url;
}
