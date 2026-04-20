import { Text } from '@/src/components/ui/text';
import { ImagePlus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export function MediaSlot({
  label,
  uri,
  onPress,
}: {
  label: string;
  uri?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8D9BE',
        overflow: 'hidden',
        minHeight: 100,
        backgroundColor: uri ? 'rgba(234,223,206,0.85)' : 'rgba(249,245,238,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
      }}
    >
      <ImagePlus size={18} color="#A68555" />
      <Text style={{ fontSize: 10, color: '#A68555', marginTop: 6, textAlign: 'center' }}>
        {uri ? `${label} ready` : label}
      </Text>
    </TouchableOpacity>
  );
}
