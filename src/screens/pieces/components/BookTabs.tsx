import { Text } from '@/src/components/ui/text';
import { JournalSpread } from '@/src/types/journal';
import React from 'react';
import {
    TouchableOpacity,
    View
} from 'react-native';

export function BookTabs({
  spreads,
  activePage,
  onPress,
  compact,
}: {
  spreads: JournalSpread[];
  activePage: number;
  onPress: (index: number) => void;
  compact?: boolean;
}) {
  if (compact) return null;

  return (
    <View style={{ position: 'absolute', right: -10, top: 34, gap: 10 }}>
      {spreads.map((spread, index) => {
        const active = index === activePage;
        return (
          <TouchableOpacity
            key={spread.key}
            onPress={() => onPress(index)}
            activeOpacity={0.8}
            style={{
              width: active ? 58 : 44,
              paddingVertical: 10,
              paddingHorizontal: 8,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              backgroundColor: spread.accent,
              shadowColor: '#55301E',
              shadowOpacity: active ? 0.2 : 0.08,
              shadowRadius: active ? 10 : 4,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text className="text-[10px] font-bold text-white text-center" numberOfLines={1}>
              {spread.tabLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}