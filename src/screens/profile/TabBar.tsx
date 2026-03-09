import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { Tab } from './data';

export function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'journey',   label: 'Journey'   },
    { key: 'settings',  label: 'Settings'  },
  ];
  return (
    <View className="mx-6 mb-5 flex-row bg-muted rounded-2xl p-1">
      {tabs.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          onPress={() => onSelect(key)}
          activeOpacity={0.75}
          className={`flex-1 py-2.5 rounded-xl items-center ${active === key ? 'bg-card' : ''}`}
        >
          <Text className={`text-sm font-semibold ${active === key ? 'text-foreground' : 'text-muted-foreground'}`}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
