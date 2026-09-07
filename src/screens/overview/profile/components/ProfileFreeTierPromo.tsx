import { useAppStore, useVisibleGlazes } from '@/src/store';
import {
    FREE_CLOUD_STORAGE_BYTES,
    FREE_CLOUD_STORAGE_MB,
    estimateCloudBytesUsedFromState,
    formatCloudStorageMb,
} from '@/src/utils/cloudStorage';
import { PremiumFeature, premiumRouteForFeature, profilePremiumTeaser } from '@/src/utils/premiumGate';
import { useRouter } from 'expo-router';
import { Cloud, Crown } from 'lucide-react-native';
import React from 'react';
import { ProfilePromoCard, ProfilePromoProgressBar } from './ProfilePromoCard';

/**
 * One contextual promo slot for free users — not two stacked cards.
 * Cloud meter when storage is getting tight; otherwise a light Premium teaser.
 */
export function ProfileFreeTierPromo() {
  const router = useRouter();
  const isPremium = useAppStore((s) => s.isPremium);
  const userType = useAppStore((s) => s.onboardingProfile.userType);
  const pieces = useAppStore((s) => s.pieces);
  const glazes = useVisibleGlazes();
  const avatarImageUri = useAppStore((s) => s.user.avatarImageUri);
  const coverImageUri = useAppStore((s) => s.user.coverImageUri);

  const usedBytes = React.useMemo(
    () => estimateCloudBytesUsedFromState({ pieces, glazes, avatarImageUri, coverImageUri }),
    [pieces, glazes, avatarImageUri, coverImageUri],
  );
  const snapshot = React.useMemo(() => {
    const limitBytes = isPremium ? null : FREE_CLOUD_STORAGE_BYTES;
    const atLimit = limitBytes != null && usedBytes >= limitBytes;
    const nearLimit = limitBytes != null && usedBytes >= limitBytes * 0.85;
    return { usedBytes, limitBytes, isPremium, atLimit, nearLimit };
  }, [isPremium, usedBytes]);

  if (isPremium) return null;

  const showCloudPressure = snapshot.nearLimit || snapshot.atLimit;
  const fillPct = snapshot.limitBytes
    ? Math.min(100, (snapshot.usedBytes / snapshot.limitBytes) * 100)
    : 0;

  if (showCloudPressure) {
    const usedLabel = formatCloudStorageMb(snapshot.usedBytes);
    return (
      <ProfilePromoCard
        icon={<Cloud size={17} color="hsl(39 57% 51%)" />}
        title="Cloud backup almost full"
        subtitle={`${usedLabel} of ${FREE_CLOUD_STORAGE_MB} MB used · piece photos, glazes & profile media`}
        ctaLabel="Upgrade →"
        variant={snapshot.atLimit ? 'warning' : 'default'}
        accessibilityLabel={`Cloud backup ${usedLabel} of ${FREE_CLOUD_STORAGE_MB} megabytes used`}
        onPress={() => router.push(premiumRouteForFeature(PremiumFeature.CloudStorage) as never)}
        footer={
          <ProfilePromoProgressBar fillPct={fillPct} variant={snapshot.atLimit ? 'warning' : 'default'} />
        }
      />
    );
  }

  return (
    <ProfilePromoCard
      icon={<Crown size={17} color="hsl(39 57% 51%)" />}
      title="Upgrade to Premium"
      subtitle={profilePremiumTeaser(userType)}
      ctaLabel="See plans →"
      accessibilityLabel="Upgrade to Premium"
      onPress={() => router.push('/premium')}
    />
  );
}
