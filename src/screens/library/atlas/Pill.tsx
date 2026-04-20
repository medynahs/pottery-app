import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: active ? '#3A2810' : '#E8D9BE',
        backgroundColor: active ? '#3A2810' : '#FFFBF4',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: active ? '#FFFBF4' : '#7A6040',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
