import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

export function ChronicleSectionLabel({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="px-6 mb-3">
      <Text
        className="font-serif text-[22px] leading-7 text-foreground"
        style={{ fontFamily: 'Fraunces_700Bold' }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-xs mt-0.5 leading-5 text-muted-foreground">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
