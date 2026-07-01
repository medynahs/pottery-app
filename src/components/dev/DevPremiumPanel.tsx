import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { getDevPremiumOverride, isForcePremiumEnabled } from '@/src/utils/forcePremium';
import { syncPremiumEntitlementFromSdk } from '@/src/utils/premiumDevSync';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

function TierChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: selected ? 'hsl(39 57% 51%)' : 'hsl(38 24% 88%)',
        backgroundColor: selected ? 'hsl(44 65% 94%)' : 'hsl(38 24% 97%)',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: selected ? 'hsl(28 38% 34%)' : 'hsl(24 20% 45%)',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** Dev-only control to simulate free vs Premium without rebuilding or editing env. */
export function DevPremiumPanel() {
  const isPremium = useAppStore((s) => s.isPremium);
  const setPremiumDevOverride = useAppStore((s) => s.setPremiumDevOverride);
  const forceEnv = isForcePremiumEnabled();
  const devOverride = getDevPremiumOverride();

  return (
    <View className="mx-6 mb-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/80 px-4 py-3">
      <Text className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
        Premium testing (dev)
      </Text>
      <Text className="text-xs text-amber-900/80 leading-5 mb-3">
        {forceEnv
          ? 'EXPO_PUBLIC_FORCE_PREMIUM=true — all gates unlocked. Set it to false in .env.development or .env.local and restart Metro to test the free tier.'
          : 'App starts on the free tier after restart. Toggle here to preview Premium gates without a purchase.'}
      </Text>
      <View className="flex-row gap-2">
        <TierChip
          label="Free"
          selected={!isPremium}
          onPress={() => setPremiumDevOverride(false)}
        />
        <TierChip
          label="Premium"
          selected={isPremium}
          onPress={() => setPremiumDevOverride(true)}
        />
      </View>
      <TouchableOpacity
        onPress={() => void syncPremiumEntitlementFromSdk()}
        activeOpacity={0.7}
        style={{ marginTop: 10, alignSelf: 'flex-start' }}
      >
        <Text className="text-[11px] font-semibold text-amber-900/80 underline">
          Reset to RevenueCat / backend
        </Text>
      </TouchableOpacity>
      <Text className="text-[11px] text-amber-900/70 mt-2">
        Current: {isPremium ? 'Premium' : 'Free'}
        {forceEnv ? ' (env force on)' : devOverride !== null ? ' (dev override)' : ''}
      </Text>
    </View>
  );
}
