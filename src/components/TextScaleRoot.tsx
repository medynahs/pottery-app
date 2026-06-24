import { TEXT_SCALE_MULTIPLIERS } from '@/src/constants/typography';
import { TextScaleContext } from '@/src/hooks/useTextScale';
import { useAppStore } from '@/src/store/appStore';
import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';

type TextScaleRootProps = ViewProps & {
  children: React.ReactNode;
};

export function TextScaleRoot({ children, style, ...props }: TextScaleRootProps) {
  const textScale = useAppStore((s) => s.textScale);
  const multiplier = TEXT_SCALE_MULTIPLIERS[textScale] ?? 1;

  return (
    <TextScaleContext.Provider value={textScale}>
      <View
        style={[
          Platform.OS === 'web'
            ? ({ '--text-scale': multiplier } as Record<string, number>)
            : undefined,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </TextScaleContext.Provider>
  );
}
