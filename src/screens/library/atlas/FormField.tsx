import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View, type ViewStyle } from 'react-native';

/** Matches Tailwind mt-5 / mb-5, keep field rhythm consistent. */
export const FORM_FIELD_GAP = 20;
/** Extra space before a new section (e.g. after Notes → Collections). */
export const FORM_SECTION_GAP = 36;

type FormFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  first?: boolean;
  required?: boolean;
  /** Extra bottom spacing before the sheet footer. */
  last?: boolean;
  /** Extra top spacing when starting a new form section. */
  sectionStart?: boolean;
  /** Extra bottom spacing after this field. */
  spacedBelow?: boolean;
  /** Use inside FormFieldRow, no outer margin, shares horizontal space. */
  inline?: boolean;
};

function fieldMargins({
  first,
  last,
  sectionStart,
  spacedBelow,
  inline,
}: Pick<FormFieldProps, 'first' | 'last' | 'sectionStart' | 'spacedBelow' | 'inline'>): ViewStyle {
  if (inline) return {};

  return {
    marginTop: first ? FORM_FIELD_GAP : sectionStart ? FORM_SECTION_GAP : FORM_FIELD_GAP,
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
}: FormFieldProps) {
  return (
    <View
      className={inline ? 'flex-1 min-w-0' : undefined}
      style={fieldMargins({ first, last, sectionStart, spacedBelow, inline })}
    >
      <Text
        accessibilityRole="header"
        className="text-[12px] font-semibold text-foreground mb-2"
      >
        {label}
        {required ? <Text className="text-destructive"> *</Text> : null}
      </Text>
      {hint ? (
        <Text className="text-xs text-muted-foreground mb-2 leading-5">{hint}</Text>
      ) : null}
      {children}
    </View>
  );
}

/** Side-by-side fields with shared vertical spacing. */
export function FormFieldRow({
  children,
  first,
  sectionStart,
  last,
}: {
  children: React.ReactNode;
  first?: boolean;
  sectionStart?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className="flex-row gap-3"
      style={{
        marginTop: first ? FORM_FIELD_GAP : sectionStart ? FORM_SECTION_GAP : FORM_FIELD_GAP,
        marginBottom: last ? 24 : 0,
      }}
    >
      {children}
    </View>
  );
}
