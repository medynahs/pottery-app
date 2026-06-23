import { Text } from '@/src/components/ui/text';
import {
  formatCloudStorageMb,
  FREE_CLOUD_STORAGE_MB,
  getCloudStorageSnapshot,
} from '@/src/utils/cloudStorage';
import { PremiumFeature, premiumRouteForFeature } from '@/src/utils/premiumGate';
import { useAppStore } from '@/src/store';
import { Cloud } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

/** Account-wide cloud backup meter — shown on profile, not feature tabs. */
export function ProfileCloudStorageCard() {
  const router = useRouter();
  const pieces = useAppStore((s) => s.pieces);
  const glazes = useAppStore((s) => s.glazes);
  const avatarImageUri = useAppStore((s) => s.user.avatarImageUri);
  const coverImageUri = useAppStore((s) => s.user.coverImageUri);
  const isPremium = useAppStore((s) => s.isPremium);

  const snapshot = React.useMemo(
    () => getCloudStorageSnapshot(),
    [pieces, glazes, avatarImageUri, coverImageUri, isPremium],
  );

  if (snapshot.isPremium) return null;

  const usedLabel = formatCloudStorageMb(snapshot.usedBytes);
  const fillPct = snapshot.limitBytes
    ? Math.min(100, (snapshot.usedBytes / snapshot.limitBytes) * 100)
    : 0;
  const barColor = snapshot.atLimit
    ? 'hsl(0 55% 52%)'
    : snapshot.nearLimit
      ? 'hsl(32 70% 48%)'
      : 'hsl(39 57% 51%)';

  return (
    <TouchableOpacity
      onPress={() => router.push(premiumRouteForFeature(PremiumFeature.CloudStorage) as never)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Cloud backup ${usedLabel} of ${FREE_CLOUD_STORAGE_MB} megabytes used`}
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: snapshot.atLimit ? 'hsl(0 45% 82%)' : '#E8D9BE',
        backgroundColor: snapshot.atLimit ? 'hsl(0 40% 97%)' : '#FFFBF2',
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: 'hsl(39 55% 96%)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Cloud size={16} color="hsl(39 57% 51%)" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: 'hsl(24 25% 15%)' }}>
            Cloud backup
          </Text>
          <Text style={{ fontSize: 12, color: 'hsl(24 20% 45%)', marginTop: 1 }}>
            {usedLabel} / {FREE_CLOUD_STORAGE_MB} MB · piece photos, profile & posts
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '600', color: 'hsl(39 57% 51%)' }}>
          Upgrade →
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 99,
          backgroundColor: 'hsl(34 30% 90%)',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${fillPct}%`,
            height: '100%',
            borderRadius: 99,
            backgroundColor: barColor,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
