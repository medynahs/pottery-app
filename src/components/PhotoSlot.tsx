import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import { Camera, X } from 'lucide-react-native';
import React from 'react';
import { Image as RNImage, View } from 'react-native';

type PhotoSlotBaseProps = {
  uri?: string;
  onPress: () => void;
  disabled?: boolean;
};

export type PhotoSlotCardProps = PhotoSlotBaseProps & {
  variant?: 'card';
  onRemove: () => void;
  iconColor?: string;
  hint?: string;
};

export type PhotoSlotCompactProps = PhotoSlotBaseProps & {
  variant: 'slot';
  label: string;
  large?: boolean;
};

export type PhotoSlotProps = PhotoSlotCardProps | PhotoSlotCompactProps;

/** Empty / filled photo tap target for forms. Pair with PhotoPickField for camera + library picking. */
export function PhotoSlot(props: PhotoSlotProps) {
  const { uri, onPress, disabled } = props;

  if (props.variant === 'slot') {
    const height = props.large ? 160 : 100;
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={props.label}
        className={`overflow-hidden rounded-2xl border border-border bg-muted/30 ${props.large ? 'w-full' : 'flex-1'}`}
        style={({ pressed }) => ({
          height,
          opacity: disabled ? 0.7 : pressed ? 0.82 : 1,
        })}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center px-3 py-4">
            <Camera size={props.large ? 24 : 18} color="hsl(24 20% 45%)" />
            <Text className="text-[11px] text-muted-foreground mt-2 text-center">{props.label}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  const iconColor = props.iconColor ?? 'hsl(24 20% 45%)';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="Add photo"
      accessibilityRole="button"
      style={disabled ? { opacity: 0.7 } : undefined}
    >
      {uri ? (
        <View>
          <RNImage source={{ uri }} className="w-full h-48 rounded-2xl" resizeMode="cover" />
          <Pressable
            onPress={props.onRemove}
            accessibilityLabel="Remove photo"
            accessibilityRole="button"
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
          >
            <X size={14} color="white" />
          </Pressable>
        </View>
      ) : (
        <View className="w-full h-36 rounded-2xl bg-muted/60 border border-dashed border-border items-center justify-center gap-2 px-4">
          <Camera size={28} color={iconColor} />
          <Text className="text-sm text-muted-foreground">Tap to add photo</Text>
          {props.hint ? (
            <Text className="text-xs text-muted-foreground mt-1 text-center">{props.hint}</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
