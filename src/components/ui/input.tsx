import {
  INPUT_FONT_SIZE,
  INPUT_FONT_SIZE_SM,
  INPUT_GHOST_CLASS,
  INPUT_LINE_HEIGHT,
  INPUT_LINE_HEIGHT_SM,
  INPUT_MULTILINE_CLASS,
  INPUT_PLACEHOLDER_COLOR,
  INPUT_SELECTION_COLOR,
  INPUT_SINGLE_LINE_CLASS,
  INPUT_TEXT_COLOR,
} from '@/src/constants/inputTheme';
import { scaleFont } from '@/src/constants/typography';
import { useTextScaleContext } from '@/src/hooks/useTextScale';
import * as React from 'react';
import { Platform, StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { cn } from './utils/cn';

export type InputVariant = 'default' | 'ghost';
export type InputSize = 'md' | 'sm';

export interface InputProps extends TextInputProps {
  placeholderClassName?: string;
  variant?: InputVariant;
  size?: InputSize;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  (
    {
      className,
      placeholderClassName,
      style,
      multiline,
      variant = 'default',
      size = 'md',
      placeholderTextColor = INPUT_PLACEHOLDER_COLOR,
      selectionColor = INPUT_SELECTION_COLOR,
      ...props
    },
    ref,
  ) => {
    const textScale = useTextScaleContext();
    const flat = StyleSheet.flatten(style);
    const baseSize = size === 'sm' ? INPUT_FONT_SIZE_SM : INPUT_FONT_SIZE;
    const scaledFontSize = scaleFont(
      typeof flat?.fontSize === 'number' ? flat.fontSize : baseSize,
      textScale,
    );
    const lineHeight = size === 'sm' ? INPUT_LINE_HEIGHT_SM : INPUT_LINE_HEIGHT;
    const { fontSize: _fs, lineHeight: _lh, color: _color, ...restStyle } = flat ?? {};

    const isGhost = variant === 'ghost';

    const androidStyles =
      Platform.OS === 'android'
        ? multiline
          ? { paddingVertical: 12, textAlignVertical: 'top' as const }
          : isGhost
            ? { paddingVertical: 0, textAlignVertical: 'center' as const }
            : { paddingVertical: 0, textAlignVertical: 'center' as const }
        : {};

    const iosMultilineStyles =
      Platform.OS === 'ios' && multiline
        ? { paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' as const }
        : null;

    return (
      <TextInput
        ref={ref}
        multiline={multiline}
        className={cn(
          isGhost
            ? INPUT_GHOST_CLASS
            : multiline
              ? INPUT_MULTILINE_CLASS
              : INPUT_SINGLE_LINE_CLASS,
          'web:flex web:ring-offset-background file:border-0 file:bg-transparent file:font-medium',
          'web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          !isGhost && 'focus:border-primary',
          props.editable === false && 'opacity-50 web:cursor-not-allowed',
          className,
        )}
        placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
        placeholderTextColor={placeholderTextColor}
        selectionColor={selectionColor}
        underlineColorAndroid="transparent"
        style={[
          androidStyles,
          iosMultilineStyles,
          restStyle,
          {
            fontSize: scaledFontSize,
            lineHeight: multiline ? lineHeight : undefined,
            color: INPUT_TEXT_COLOR,
          },
        ]}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
