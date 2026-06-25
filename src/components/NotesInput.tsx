import { Input, type InputProps } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import {
  FORM_SECTION_GAP,
  FORM_SECTION_TOP_GAP,
} from '@/src/components/form/FormSectionCard';
import {
  INPUT_LINE_HEIGHT,
  INPUT_PLACEHOLDER_COLOR,
  INPUT_TEXT_COLOR,
} from '@/src/constants/inputTheme';
import { scaleFont } from '@/src/constants/typography';
import { useTextScaleContext } from '@/src/hooks/useTextScale';
import { JournalTheme } from '@/src/screens/pieces/utils/journalTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollText } from 'lucide-react-native';
import * as React from 'react';
import {
  Platform,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/** Default min height for multiline notes fields in forms. */
export const NOTES_INPUT_MIN_HEIGHT = 96;

export type NotesInputProps = Omit<InputProps, 'multiline' | 'textAlignVertical'> & {
  label?: string;
  hint?: string;
  /** Min height in dp. Default {@link NOTES_INPUT_MIN_HEIGHT}. */
  minHeight?: number;
  /** When set, enables inner scroll for longer text (e.g. captions). */
  maxHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
  /** Journal-style gradient card (default) or plain bordered input. */
  variant?: 'journal' | 'plain';
  /** Accent for the journal notes icon. */
  accent?: string;
};

/**
 * Standard multiline notes field for forms inside scrollable sheets.
 * Default journal variant matches piece journal field notes.
 */
export const NotesInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  NotesInputProps
>(function NotesInput(
  {
    label,
    hint,
    minHeight = NOTES_INPUT_MIN_HEIGHT,
    maxHeight,
    containerStyle,
    className,
    style,
    scrollEnabled,
    blurOnSubmit = false,
    variant = 'journal',
    accent = JournalTheme.pageAccents[0],
    ...props
  },
  ref,
) {
  const useInnerScroll = maxHeight != null || scrollEnabled === true;
  const textScale = useTextScaleContext();
  const journalFontSize = scaleFont(16, textScale);

  const defaultSpacing: ViewStyle = {
    marginTop: FORM_SECTION_TOP_GAP,
    marginBottom: FORM_SECTION_GAP,
  };

  if (variant === 'plain') {
    return (
      <View style={[defaultSpacing, containerStyle]}>
        {label ? (
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </Text>
        ) : null}
        {hint ? (
          <Text className="text-xs text-muted-foreground mb-2 leading-5">{hint}</Text>
        ) : null}
        <Input
          ref={ref}
          multiline
          textAlignVertical="top"
          scrollEnabled={useInnerScroll}
          blurOnSubmit={blurOnSubmit}
          className={className}
          style={[
            {
              minHeight,
              ...(maxHeight != null ? { maxHeight } : null),
              ...(Platform.OS === 'android' ? { textAlignVertical: 'top' as const } : null),
            },
            style,
          ]}
          {...props}
        />
      </View>
    );
  }

  return (
    <View style={[defaultSpacing, containerStyle]}>
      <View
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: JournalTheme.cardBorder,
          backgroundColor: JournalTheme.cardBackground,
        }}
      >
        <LinearGradient
          colors={[...JournalTheme.notesGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 }}
        >
          {label || hint ? (
            <View className="flex-row items-start gap-2 mb-3">
              {label ? <ScrollText size={15} color={accent} style={{ marginTop: 1 }} /> : null}
              <View className="flex-1 min-w-0">
                {label ? (
                  <Text className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">
                    {label}
                  </Text>
                ) : null}
                {hint ? (
                  <Text
                    className={`text-xs text-muted-foreground leading-5 ${label ? 'mt-1' : ''}`}
                  >
                    {hint}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
          <TextInput
            multiline
            textAlignVertical="top"
            scrollEnabled={useInnerScroll}
            blurOnSubmit={blurOnSubmit}
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            style={[
              {
                minHeight,
                ...(maxHeight != null ? { maxHeight } : null),
                fontFamily: 'DMSans_400Regular',
                fontSize: journalFontSize,
                lineHeight: INPUT_LINE_HEIGHT,
                color: INPUT_TEXT_COLOR,
                padding: 0,
              },
              style,
            ]}
            {...props}
          />
        </LinearGradient>
      </View>
    </View>
  );
});
