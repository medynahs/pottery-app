import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ImageLightboxProps = {
  visible: boolean;
  uri?: string;
  caption?: string;
  onClose: () => void;
  embedded?: boolean;
};

function LightboxContent({
  uri,
  caption,
  onClose,
}: {
  uri: string;
  caption?: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const imageHeight = Math.max(240, height - insets.top - insets.bottom - 120);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8, 6, 4, 0.96)' }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close photo" />

      <TouchableOpacity
        onPress={onClose}
        hitSlop={12}
        activeOpacity={0.7}
        style={{
          position: 'absolute',
          top: insets.top + 8,
          right: 16,
          zIndex: 2,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(255,255,255,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityRole="button"
        accessibilityLabel="Close photo"
      >
        <X size={20} color="white" />
      </TouchableOpacity>

      <View
        pointerEvents="box-none"
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + (caption ? 56 : 24),
          paddingHorizontal: 12,
        }}
      >
        <Image
          source={{ uri }}
          style={{ width: width - 24, height: imageHeight }}
          contentFit="contain"
        />
      </View>

      {caption ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: insets.bottom + 16,
            paddingHorizontal: 20,
          }}
          pointerEvents="none"
        >
          <Text
            style={{
              textAlign: 'center',
              color: 'rgba(255,251,244,0.92)',
              fontSize: 14,
              fontWeight: '600',
            }}
            numberOfLines={2}
          >
            {caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function ImageLightbox({ visible, uri, caption, onClose, embedded = false }: ImageLightboxProps) {
  if (!uri || !visible) return null;

  if (embedded) {
    return (
      <View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, { zIndex: 50, elevation: 50 }]}
      >
        <LightboxContent uri={uri} caption={caption} onClose={onClose} />
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <LightboxContent uri={uri} caption={caption} onClose={onClose} />
    </Modal>
  );
}
