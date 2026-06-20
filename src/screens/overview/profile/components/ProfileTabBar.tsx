import { Text } from '@/src/components/ui/text';
import { Map, PenLine } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { PROFILE_THEME } from '../profileTheme';
import type { Tab } from '../types';

const TABS: { key: Tab; label: string; icon: typeof Map }[] = [
  { key: 'journey', label: 'Journey', icon: Map },
  { key: 'posts', label: 'Posts', icon: PenLine },
];

export function ProfileTabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <View className="mx-4 mb-4 flex-row gap-2">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            activeOpacity={0.82}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 border"
            style={{
              backgroundColor: isActive ? PROFILE_THEME.chipActiveBg : PROFILE_THEME.chipIdleBg,
              borderColor: isActive ? PROFILE_THEME.chipActiveBg : PROFILE_THEME.cardBorder,
              shadowColor: isActive ? PROFILE_THEME.shadow : 'transparent',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: isActive ? 0.16 : 0,
              shadowRadius: 8,
              elevation: isActive ? 3 : 0,
            }}
          >
            <View
              className="w-7 h-7 rounded-xl items-center justify-center"
              style={{
                backgroundColor: isActive ? 'rgba(255, 244, 224, 0.16)' : PROFILE_THEME.accentSoft,
              }}
            >
              <Icon size={15} color={isActive ? PROFILE_THEME.heroText : PROFILE_THEME.inkSoft} />
            </View>
            <Text
              className="text-sm font-bold"
              style={{ color: isActive ? PROFILE_THEME.heroText : PROFILE_THEME.inkSoft }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
