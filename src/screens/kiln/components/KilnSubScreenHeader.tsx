import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KilnSubScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  headerRight?: React.ReactNode;
};

export function KilnSubScreenHeader({ title, subtitle, onBack, headerRight }: KilnSubScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View className="border-b border-border bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-5 py-4">
        <TouchableOpacity onPress={onBack} className="p-1 -ml-1" hitSlop={8} accessibilityLabel="Go back">
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View className="flex-1 min-w-0">
          <Text className="text-lg font-serif font-bold text-foreground" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {headerRight}
      </View>
    </View>
  );
}
