import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FixedOverlayBackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

/** Back control pinned over scrolling hero content (Discover detail, glaze detail, etc.). */
export function FixedOverlayBackButton({
  onPress,
  accessibilityLabel = 'Go back',
}: FixedOverlayBackButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute w-10 h-10 rounded-full bg-black/45 items-center justify-center"
      style={{ top: insets.top + 8, left: 16, zIndex: 20 }}
    >
      <ChevronLeft size={22} color="white" />
    </TouchableOpacity>
  );
}
