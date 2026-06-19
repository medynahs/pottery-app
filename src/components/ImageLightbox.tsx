import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ImageLightboxProps = {
  visible: boolean;
  uri?: string;
  caption?: string;
  onClose: () => void;
};

export function ImageLightbox({ visible, uri, caption, onClose }: ImageLightboxProps) {
  const insets = useSafeAreaInsets();

  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill} className="bg-black/95">
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

        <Pressable style={{ flex: 1, justifyContent: 'center' }} onPress={onClose}>
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
          />
        </Pressable>

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
    </Modal>
  );
}
