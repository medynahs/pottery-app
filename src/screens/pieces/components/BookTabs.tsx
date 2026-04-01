
import { Text } from '@/src/components/ui/text';
import { JournalSpread } from '@/src/types/journal';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';


interface BookTabsProps {
  spreads: JournalSpread[];
  activePage: number;
  onPress: (index: number) => void;
  icons: React.ComponentType<{ size: number; color: string }>[];
}

export function BookTabs({ spreads, activePage, onPress, icons }: BookTabsProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 3, marginBottom: -10 }}>
      {spreads.map((spread, index) => {
        const active = index === activePage;
        const Icon = icons[index];
        return (
          <TouchableOpacity
            key={spread.key}
            onPress={() => onPress(index)}
            activeOpacity={0.8}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: active ? 38 : 28,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: spread.accent,
              shadowColor: '#55301E',
              shadowOpacity: active ? 0.18 : 0.06,
              shadowRadius: active ? 7 : 2,
              shadowOffset: { width: 0, height: active ? 4 : 2 },
              marginBottom: 0,
              height: active ? 38 : 28,
            }}
          >
            {Icon && (
              <Icon size={active ? 16 : 13} color="#FFF5E7" />
            )}
            <Text className="text-[9px] font-bold text-white text-center" numberOfLines={1}>
              {spread.tabLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}