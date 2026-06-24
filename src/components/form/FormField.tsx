import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

/** Matches Tailwind mt-5 / mb-5, keep field rhythm consistent. */
export const FORM_FIELD_GAP = 20;
/** Extra space before a new section when not using FormSectionCard. */
export const FORM_FIELD_SECTION_GAP = 36;

type FormFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  first?: boolean;
  required?: boolean;
  last?: boolean;
  sectionStart?: boolean;
  spacedBelow?: boolean;
  inline?: boolean;
  nested?: boolean;
  labelAccessory?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function fieldMargins({
  first,
  last,
  sectionStart,
  spacedBelow,
  inline,
  nested,
}: Pick<
  FormFieldProps,
  'first' | 'last' | 'sectionStart' | 'spacedBelow' | 'inline' | 'nested'
>): ViewStyle {
  if (inline) return {};

  const topGap = nested
    ? first
      ? 0
      : 16
    : first
      ? FORM_FIELD_GAP
      : sectionStart
        ? FORM_FIELD_SECTION_GAP
        : FORM_FIELD_GAP;

  return {
    marginTop: topGap,
    marginBottom: last ? 24 : spacedBelow ? FORM_FIELD_GAP : 0,
  };
}

export function FormField({
  label,
  hint,
  children,
  first,
  required,
  last,
  sectionStart,
  spacedBelow,
  inline,
  nested,
  labelAccessory,
  style,
}: FormFieldProps) {
  return (
    <View
      className={inline ? 'flex-1 min-w-0' : undefined}
      style={[fieldMargins({ first, last, sectionStart, spacedBelow, inline, nested }), style]}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <Text
          accessibilityRole="header"
          className="text-[12px] font-semibold text-foreground flex-1"
        >
          {label}
          {required ? <Text className="text-destructive"> *</Text> : null}
        </Text>
        {labelAccessory}
      </View>
      {hint ? (
        <Text className="text-xs text-muted-foreground mb-2 leading-5">{hint}</Text>
      ) : null}
      {children}
    </View>
  );
}

export function FormFieldRow({
  children,
  first,
  sectionStart,
  last,
  nested,
}: {
  children: React.ReactNode;
  first?: boolean;
  sectionStart?: boolean;
  last?: boolean;
  nested?: boolean;
}) {
  const topGap = nested
    ? first
      ? 0
      : 16
    : first
      ? FORM_FIELD_GAP
      : sectionStart
        ? FORM_FIELD_SECTION_GAP
        : FORM_FIELD_GAP;

  return (
    <View
      className="flex-row gap-3"
      style={{
        marginTop: topGap,
        marginBottom: last ? 24 : 0,
      }}
    >
      {children}
    </View>
  );
}
