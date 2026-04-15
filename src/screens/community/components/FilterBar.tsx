// src/screens/community/components/FilterBar.tsx
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { FILTERS } from '../data';
import type { FilterTab } from '../types';

type Props = {
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
};

export function FilterBar({ activeFilter, onFilterChange }: Props) {
  return (
    <View className="pt-4 pb-4 bg-background">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => onFilterChange(f)}
            activeOpacity={0.75}
            className={`px-4 py-2 rounded-full border ${
              activeFilter === f ? 'bg-foreground border-foreground' : 'bg-card border-border'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === f ? 'text-background' : 'text-foreground'
              }`}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
