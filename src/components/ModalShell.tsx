import { PhotoPickerOverlay } from '@/src/components/PhotoPickerOverlay';
import React from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

export interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropColor?: string;
}

/** Full-screen bottom-sheet modal. Embeds the photo picker overlay when active. */
export function ModalShell({
  visible,
  onClose,
  children,
  backdropColor = 'rgba(22,14,10,0.52)',
}: ModalShellProps) {
  const { height } = useWindowDimensions();
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const slideY = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      slideY.setValue(height);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, slideY, height]);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <View style={{ flex: 1 }} pointerEvents="box-none">
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, opacity: backdropOpacity }]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close modal"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
          pointerEvents="box-none"
        >
          <Animated.View style={{ transform: [{ translateY: slideY }] }} pointerEvents="box-none">
            <View pointerEvents="auto">{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
        {visible ? <PhotoPickerOverlay /> : null}
      </View>
    </Modal>
  );
}

export interface ModalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'pottery';
  maxHeight?: ViewStyle['maxHeight'];
  radius?: number;
}

export function ModalCard({ children, variant = 'default', maxHeight, radius }: ModalCardProps) {
  const topRadius = radius ?? (variant === 'pottery' ? 28 : 24);

  if (variant === 'pottery') {
    return (
      <View
        style={{
          borderTopLeftRadius: topRadius,
          borderTopRightRadius: topRadius,
          backgroundColor: '#FFFBF2',
          borderTopWidth: 1,
          borderColor: '#E8D9BE',
          maxHeight,
        }}
      >
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#C9B48C' }} />
        </View>
        {children}
      </View>
    );
  }

  return (
    <View
      className="bg-background"
      style={{
        borderTopLeftRadius: topRadius,
        borderTopRightRadius: topRadius,
        maxHeight,
      }}
    >
      <View className="w-9 h-1 bg-muted rounded-full self-center mt-4 mb-2" />
      {children}
    </View>
  );
}
