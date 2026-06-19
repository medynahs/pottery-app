import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

type GlazeSwipeTileProps = {
  width: number;
  children: React.ReactNode;
  onDelete: () => void;
};

export function GlazeSwipeTile({ width, children, onDelete }: GlazeSwipeTileProps) {
  const renderRightActions = () => (
    <TouchableOpacity
      onPress={onDelete}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Delete glaze"
      style={{
        width: 72,
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: 'hsl(0 55% 48%)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Trash2 size={20} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={{ width }}>
      <Swipeable renderRightActions={renderRightActions} overshootRight={false} friction={2}>
        {children}
      </Swipeable>
    </View>
  );
}
