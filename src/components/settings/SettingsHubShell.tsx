import { Text } from '@/src/components/ui/text';
import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SettingsHubShellProps = {
  title: string;
  subtitle: string;
  onClose: () => void;
  closeLabel?: string;
  children: React.ReactNode;
  scrollProps?: Omit<ScrollViewProps, 'children'>;
};

export function SettingsHubShell({
  title,
  subtitle,
  onClose,
  closeLabel = 'Done',
  children,
  scrollProps,
}: SettingsHubShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="flex-1 pr-4">
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            {title}
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">{subtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          className="bg-muted px-4 py-2 rounded-full"
        >
          <Text className="text-sm font-medium text-foreground">{closeLabel}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 mt-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </View>
  );
}
