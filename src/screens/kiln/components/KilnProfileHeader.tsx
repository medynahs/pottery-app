import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { FlameKindling } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';
import type { Kiln } from '../../../types/kiln';
import { KILN_TYPE_LABELS } from '../constants';
import { getKilnMaxTempLabel } from '../utils/kilnHelpers';

type KilnProfileHeaderProps = {
  kiln: Kiln;
  lastFiredLabel: string;
  firingCount?: number;
  showNotes?: boolean;
  imageHeight?: number;
};

export function KilnProfileHeader({
  kiln,
  lastFiredLabel,
  firingCount,
  showNotes = true,
  imageHeight = 160,
}: KilnProfileHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const neverFired = lastFiredLabel === 'Never fired';

  return (
    <View>
      {kiln.imageUri ? (
        <Image
          source={{ uri: kiln.imageUri }}
          style={{ width: '100%', height: imageHeight, borderRadius: 16, marginBottom: 16 }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="w-full rounded-2xl mb-4 border border-border bg-muted/30 items-center justify-center"
          style={{ height: Math.max(80, imageHeight - 40) }}
        >
          <FlameKindling size={24} color={colors.mutedForeground} />
        </View>
      )}

      <Text className="text-2xl font-serif font-bold text-foreground">{kiln.name}</Text>
      <Text className="text-sm text-muted-foreground mt-1">
        {KILN_TYPE_LABELS[kiln.type]} · {getKilnMaxTempLabel(kiln)} · {kiln.shelves} shelf
        {kiln.shelves !== 1 ? 'es' : ''}
      </Text>
      <Text className={`text-sm font-semibold mt-2 ${neverFired ? 'text-muted-foreground' : 'text-primary'}`}>
        {lastFiredLabel}
        {firingCount != null
          ? ` · ${firingCount} firing${firingCount !== 1 ? 's' : ''} logged`
          : null}
      </Text>

      {showNotes && kiln.notes?.trim() ? (
        <Text className="text-sm text-muted-foreground italic mt-3 leading-5" numberOfLines={4}>
          "{kiln.notes.trim()}"
        </Text>
      ) : null}
    </View>
  );
}
