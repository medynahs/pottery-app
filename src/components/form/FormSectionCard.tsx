import { Text } from '@/src/components/ui/text';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

/** Space between stacked section cards. */
export const FORM_SECTION_GAP = 16;
/** Space before the first section card (below photo / toggles). */
export const FORM_SECTION_TOP_GAP = 20;

export const FORM_SECTION_STYLES = {
  wrap: 'rounded-2xl border border-border bg-card',
  header: 'px-4 pt-4 pb-1',
  title: 'text-[13px] font-semibold text-foreground',
  subtitle: 'text-xs text-muted-foreground mt-0.5 leading-5',
  body: 'px-4 pb-4 pt-2',
  divider: 'h-px bg-border mx-4',
} as const;

type FormSectionCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  last?: boolean;
  topGap?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FormSectionCard({
  title,
  subtitle,
  children,
  last,
  topGap,
  style,
}: FormSectionCardProps) {
  return (
    <View
      className={FORM_SECTION_STYLES.wrap}
      style={[
        { marginTop: topGap ? FORM_SECTION_TOP_GAP : 0, marginBottom: last ? 0 : FORM_SECTION_GAP },
        style,
      ]}
    >
      <View className={FORM_SECTION_STYLES.header}>
        <Text className={FORM_SECTION_STYLES.title}>{title}</Text>
        {subtitle ? <Text className={FORM_SECTION_STYLES.subtitle}>{subtitle}</Text> : null}
      </View>
      <View className={FORM_SECTION_STYLES.body}>{children}</View>
    </View>
  );
}

type CollapsibleFormSectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  last?: boolean;
  topGap?: boolean;
};

export function CollapsibleFormSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  last,
  topGap,
}: CollapsibleFormSectionProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;

  const setOpen = (next: boolean) => {
    if (controlledOpen == null) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <View
      className={FORM_SECTION_STYLES.wrap}
      style={{
        marginTop: topGap ? FORM_SECTION_TOP_GAP : 0,
        marginBottom: last ? 0 : FORM_SECTION_GAP,
      }}
    >
      <TouchableOpacity
        onPress={() => setOpen(!isOpen)}
        activeOpacity={0.85}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <View className="flex-1 pr-3">
          <Text className={FORM_SECTION_STYLES.title}>{title}</Text>
          {subtitle ? <Text className={FORM_SECTION_STYLES.subtitle}>{subtitle}</Text> : null}
        </View>
        {isOpen ? (
          <ChevronUp size={18} color="hsl(24 20% 45%)" />
        ) : (
          <ChevronDown size={18} color="hsl(24 20% 45%)" />
        )}
      </TouchableOpacity>

      {isOpen ? (
        <View className={`${FORM_SECTION_STYLES.body} border-t border-border pt-4`}>{children}</View>
      ) : null}
    </View>
  );
}
