import { Text } from '@/src/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DetailScreenShellProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
  scrollProps?: Omit<ScrollViewProps, 'children'>;
  headerRight?: React.ReactNode;
};

export function DetailScreenShell({
  title,
  subtitle,
  onBack,
  children,
  scrollProps,
  headerRight,
}: DetailScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-2 px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={onBack}
          className="w-9 h-9 items-center justify-center -ml-1"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} color="hsl(0 0% 30%)" />
        </TouchableOpacity>
        <View className="flex-1 min-w-0">
          <Text
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: 'Fraunces_700Bold' }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {headerRight}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </View>
  );
}
