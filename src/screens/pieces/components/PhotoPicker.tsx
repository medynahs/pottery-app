import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Camera, X } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';

interface PhotoPickerProps {
  photo: string | undefined;
  onPick: () => void;
  onRemove: () => void;
  iconColor: string;
}

export function PhotoPicker({ photo, onPick, onRemove, iconColor }: PhotoPickerProps) {
  return (
    <Pressable onPress={onPick} accessibilityLabel="Add photo" accessibilityRole="button">
      {photo ? (
        <View>
          <Image source={{ uri: photo }} className="w-full h-48 rounded-2xl" resizeMode="cover" />
          <Pressable
            onPress={onRemove}
            accessibilityLabel="Remove photo"
            accessibilityRole="button"
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
          >
            <X size={14} color="white" />
          </Pressable>
        </View>
      ) : (
        <View className="w-full h-36 rounded-2xl bg-muted/60 border border-dashed border-border items-center justify-center gap-2">
          <Camera size={28} color={iconColor} />
          <Text className="text-sm text-muted-foreground">Tap to add photo</Text>
        </View>
      )}
    </Pressable>
  );
}
