import { Input } from '@/src/components/ui/input';
import { INPUT_ICON_COLOR, SEARCH_ROW_CLASS } from '@/src/constants/inputTheme';
import {
  CEMETERY_ICON,
  CEMETERY_INPUT_TEXT,
  CEMETERY_PLACEHOLDER,
} from '@/src/screens/pieces/cemeteryTheme';
import { cn } from '@/src/components/ui/utils/cn';
import { Search, X } from 'lucide-react-native';
import * as React from 'react';
import { TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

export type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Show clear button when value is non-empty. Default true. */
  clearable?: boolean;
  variant?: 'default' | 'cemetery';
};

/** Consistent search row used in tab screens and filter bars. */
export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search…',
  className,
  style,
  accessibilityLabel,
  accessibilityHint,
  clearable = true,
  variant = 'default',
}: SearchFieldProps) {
  const isCemetery = variant === 'cemetery';
  const iconColor = isCemetery ? CEMETERY_ICON : INPUT_ICON_COLOR;

  return (
    <View className={cn(SEARCH_ROW_CLASS, className)} style={style}>
      <Search size={16} color={iconColor} />
      <Input
        variant="ghost"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isCemetery ? CEMETERY_PLACEHOLDER : undefined}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        accessibilityHint={accessibilityHint}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        className="flex-1"
        style={isCemetery ? { color: CEMETERY_INPUT_TEXT } : undefined}
      />
      {clearable && value.length > 0 ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={8}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={16} color={iconColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
