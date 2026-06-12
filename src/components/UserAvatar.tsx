import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import { getInitials } from '@/src/utils/getInitials';
import { Image } from 'expo-image';
import React from 'react';
import { View, type ViewStyle } from 'react-native';

interface UserAvatarProps {
  /** Used to derive initials when `initial` is not provided. */
  name?: string;
  /** Single character or short initials override. */
  initial?: string;
  imageUri?: string | null;
  size?: number;
  shape?: 'circle' | 'rounded';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  /** Use serif bold for profile-scale avatars. */
  serif?: boolean;
  style?: ViewStyle;
}

/**
 * Consistent user avatar: photo when available, otherwise initials on brand gold
 * (or custom colors for special contexts like Hall of Fame podium medals).
 */
export function UserAvatar({
  name = '',
  initial,
  imageUri,
  size = 40,
  shape = 'circle',
  backgroundColor,
  borderColor,
  borderWidth = 0,
  textColor,
  serif = false,
  style,
}: UserAvatarProps) {
  const label = initial ?? getInitials(name);
  const radius = shape === 'circle' ? size / 2 : Math.round(size * 0.22);
  const fontSize = serif ? size * 0.4 : size * 0.38;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: imageUri ? 'transparent' : (backgroundColor ?? BrandColors.primary),
          borderWidth,
          borderColor,
        },
        style,
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      ) : (
        <Text
          className={`font-bold text-white ${serif ? 'font-serif' : ''}`}
          style={{
            fontSize,
            color: textColor ?? '#fff',
            fontFamily: serif ? 'Fraunces_700Bold' : undefined,
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
