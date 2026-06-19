import { Text } from '@/src/components/ui/text';
import { Droplets } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export function CollectionCard({
  name,
  glazeColors,
  count,
  onPress,
  tint: _tint,
}: {
  name: string;
  glazeColors: string[];
  count: number;
  tint?: { bg: string; border: string };
  onPress: () => void;
}) {
  const swatches = glazeColors.slice(0, 6);
  const bandColors = swatches.length > 0 ? swatches : ['#D4C4A0', '#C4B48C', '#B4A47C'];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        flex: 1,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#D9C9A8',
        backgroundColor: '#FFFBF2',
        overflow: 'hidden',
        shadowColor: '#8B6A2A',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', height: 52 }}>
        {bandColors.map((color, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: color,
              borderRightWidth: i < bandColors.length - 1 ? 1 : 0,
              borderColor: 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: '#D9C9A8' }} />
      <View style={{ paddingHorizontal: 12, paddingTop: 9, paddingBottom: 10, backgroundColor: '#FFFBF2' }}>
        <Text
          style={{
            fontSize: 8.5,
            letterSpacing: 1.4,
            color: '#C4A87A',
            textTransform: 'uppercase',
            marginBottom: 3,
          }}
        >
          Collection
        </Text>
        <Text
          style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 13.5, color: '#3A2810', lineHeight: 18 }}
          numberOfLines={2}
        >
          {name}
        </Text>
        <View
          style={{
            marginTop: 7,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#F0E5D0',
            borderRadius: 8,
            paddingHorizontal: 7,
            paddingVertical: 2.5,
          }}
        >
          <Droplets size={9} color="#A68555" />
          <Text style={{ fontSize: 10, color: '#A68555', fontWeight: '600' }}>
            {count} {count === 1 ? 'glaze' : 'glazes'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
