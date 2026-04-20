import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export function CollectionChip({
  name,
  selected,
  onPress,
}: {
  name: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: selected ? '#C9963A' : '#E8D9BE',
        backgroundColor: selected ? '#FFF3DC' : '#FFFBF4',
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: selected ? '#8B5E1A' : '#A68555' }}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}
