import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { PORTFOLIO_PIECES } from './data';

export function PortfolioTab() {
  return (
    <View className="px-6">
      <View className="flex-row flex-wrap gap-3 mb-6">
        {PORTFOLIO_PIECES.map(({ id, name, type, emoji, bg, accent }) => (
          <TouchableOpacity
            key={id}
            activeOpacity={0.8}
            className={`rounded-2xl border border-border p-3 ${bg}`}
            style={{ width: '30.5%', aspectRatio: 0.85 }}
          >
            <View className="flex-1 items-center justify-center">
              <Text style={{ fontSize: 36 }}>{emoji}</Text>
            </View>
            <Text className="text-xs font-bold text-foreground leading-snug mt-1" numberOfLines={1}>
              {name}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
              <Text className="text-xs text-muted-foreground">{type}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add tile */}
        <TouchableOpacity
          activeOpacity={0.75}
          className="rounded-2xl border-2 border-dashed border-border items-center justify-center bg-card"
          style={{ width: '30.5%', aspectRatio: 0.85 }}
        >
          <Text className="text-2xl text-muted-foreground">+</Text>
          <Text className="text-xs text-muted-foreground font-medium mt-0.5">Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
