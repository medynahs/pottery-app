import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ImageLightboxProps = {
  visible: boolean;
  uri?: string;
  onClose: () => void;
};

export function ImageLightbox({ visible, uri, onClose }: ImageLightboxProps) {
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

        <Pressable style={{ flex: 1 }} onPress={onClose}>
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
          />
        </Pressable>
      </View>
    </Modal>
  );
}
