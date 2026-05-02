// src/screens/kiln/components/KilnCard.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Clock, FlameKindling, MoreHorizontal, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import type { Kiln } from '../../../types/kiln';
import { KILN_TYPE_LABELS } from '../constants';
import { getKilnTimingSummary } from '../firingEstimations';

interface KilnCardProps {
  kiln: Kiln;
  firingCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onViewHistory: () => void;
}

export function KilnCard({ kiln, firingCount, onEdit, onDelete, onViewHistory }: KilnCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const timingSummary = getKilnTimingSummary(kiln);

  return (
    <Card className="p-5 mb-3">
      {kiln.imageUri ? (
        <Image
          source={{ uri: kiln.imageUri }}
          style={{ width: '100%', height: 144, borderRadius: 16, marginBottom: 14 }}
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-24 rounded-2xl mb-3 border border-border bg-muted/30 items-center justify-center">
          <FlameKindling size={18} color={colors.mutedForeground} />
          <Text className="text-[11px] text-muted-foreground mt-1">No kiln photo</Text>
        </View>
      )}

      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-3">
          <Text className="text-base font-serif font-bold text-foreground">{kiln.name}</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {KILN_TYPE_LABELS[kiln.type]}
            {kiln.coneRange ? `  ·  ${kiln.coneRange}` : ''}
            {kiln.location ? `  ·  ${kiln.location}` : ''}
          </Text>
        </View>
        <View className="flex-row gap-1">
          <TouchableOpacity onPress={onEdit} className="p-2">
            <MoreHorizontal size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} className="p-2">
            <Trash2 size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2 mb-3">
        {kiln.shelves > 0 && (
          <View className="bg-muted/40 rounded-xl px-3 py-1.5">
            <Text className="text-xs text-muted-foreground">{kiln.shelves} shelves</Text>
          </View>
        )}
        {kiln.size ? (
          <View className="bg-muted/40 rounded-xl px-3 py-1.5">
            <Text className="text-xs text-muted-foreground">{kiln.size}</Text>
          </View>
        ) : null}
        <View className="bg-muted/40 rounded-xl px-3 py-1.5">
          <Text className="text-xs text-muted-foreground">
            {firingCount} firing{firingCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {timingSummary.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {timingSummary.map((item) => (
            <View key={item.label} className="bg-orange-50 rounded-xl px-3 py-1.5 border border-orange-100">
              <Text className="text-xs text-orange-700">
                {item.label} {item.value}d
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {kiln.notes ? (
        <Text className="text-xs text-muted-foreground italic mb-3" numberOfLines={2}>
          "{kiln.notes}"
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={onViewHistory}
        className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-primary"
      >
        <Clock size={14} color="white" />
        <Text className="text-sm font-semibold text-primary-foreground">Firing History</Text>
      </TouchableOpacity>
    </Card>
  );
}
