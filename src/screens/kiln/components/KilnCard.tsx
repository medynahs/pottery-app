// src/screens/kiln/components/KilnCard.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Clock, FlameKindling, ShieldAlert } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import type { Kiln } from '../../../types/kiln';
import { KILN_TYPE_LABELS } from '../constants';
import { getKilnMaxTempLabel } from '../utils/kilnHelpers';
import { LogFiringButton } from './LogFiringButton';

interface KilnCardProps {
  kiln: Kiln;
  firingCount: number;
  lastFiredLabel: string;
  onPress: () => void;
  onViewHistory: () => void;
  onLogFiring: () => void;
}

export function KilnCard({
  kiln,
  firingCount,
  lastFiredLabel,
  onPress,
  onViewHistory,
  onLogFiring,
}: KilnCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const neverFired = lastFiredLabel === 'Never fired';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} accessibilityRole="button">
      <Card className="p-5 mb-3">
        {kiln.imageUri ? (
          <Image
            source={{ uri: kiln.imageUri }}
            style={{ width: '100%', height: 120, borderRadius: 16, marginBottom: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-20 rounded-2xl mb-3 border border-border bg-muted/30 items-center justify-center">
            <FlameKindling size={18} color={colors.mutedForeground} />
          </View>
        )}

        <Text className="text-base font-serif font-bold text-foreground">{kiln.name}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          {KILN_TYPE_LABELS[kiln.type]} · {getKilnMaxTempLabel(kiln)}
        </Text>

        <TouchableOpacity
          onPress={onViewHistory}
          className="mt-2 self-start"
          hitSlop={8}
        >
          <Text className={`text-xs font-semibold ${neverFired ? 'text-muted-foreground' : 'text-primary'}`}>
            {lastFiredLabel}
          </Text>
        </TouchableOpacity>

        {kiln.emergencyNotes?.trim() ? (
          <View
            className="mt-3 rounded-xl px-3 py-2.5 flex-row items-start gap-2"
            style={{ backgroundColor: 'hsl(0 60% 98%)', borderWidth: 1, borderColor: 'hsl(0 55% 88%)' }}
          >
            <ShieldAlert size={14} color="hsl(0 55% 45%)" style={{ marginTop: 1 }} />
            <Text className="flex-1 text-xs leading-4" style={{ color: 'hsl(0 45% 32%)' }} numberOfLines={3}>
              {kiln.emergencyNotes.trim()}
            </Text>
          </View>
        ) : null}

        {kiln.notes ? (
          <Text className="text-xs text-muted-foreground italic mt-2" numberOfLines={2}>
            "{kiln.notes}"
          </Text>
        ) : null}

        <View className="flex-row gap-2 mt-4">
          <LogFiringButton variant="outline" onPress={onLogFiring} />
          <TouchableOpacity
            onPress={onViewHistory}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary"
          >
            <Clock size={14} color={Colors.light.primaryForeground} />
            <Text className="text-sm font-semibold text-primary-foreground">
              History ({firingCount})
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
