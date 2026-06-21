import { Text } from '@/src/components/ui/text';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CustomizationSettingsShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  headerNote?: string;
  onBack: () => void;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  isSaving?: boolean;
  children: React.ReactNode;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
};

export function CustomizationSettingsShell({
  eyebrow,
  title,
  subtitle,
  headerNote,
  onBack,
  onSave,
  saveLabel = 'Save preferences',
  saveDisabled = false,
  isSaving = false,
  children,
  scrollProps,
}: CustomizationSettingsShellProps) {
  const insets = useSafeAreaInsets();
  const disabled = saveDisabled || isSaving;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 pb-2">
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="w-10 h-10 items-center justify-center rounded-full bg-muted/60"
        >
          <ChevronDown size={20} color="hsl(24 30% 40%)" style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16 }}
        {...scrollProps}
      >
        <View className="px-6 pt-2 pb-5">
          <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-primary mb-3">
            {eyebrow}
          </Text>
          <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold', lineHeight: 38 }}>
            {title}
          </Text>
          <Text className="text-sm text-muted-foreground mt-3 leading-6">{subtitle}</Text>
          {headerNote ? (
            <Text className="text-xs text-muted-foreground mt-2">{headerNote}</Text>
          ) : null}
        </View>

        <View className="px-6">{children}</View>
      </ScrollView>

      <View
        className="px-6 pt-3 border-t border-border bg-background"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={onSave}
          disabled={disabled}
          activeOpacity={0.82}
          accessibilityRole="button"
          className={`rounded-2xl items-center justify-center py-4 ${disabled ? 'bg-muted' : 'bg-foreground'}`}
        >
          <Text className={`text-sm font-semibold ${disabled ? 'text-muted-foreground' : 'text-background'}`}>
            {isSaving ? 'Saving…' : saveLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
