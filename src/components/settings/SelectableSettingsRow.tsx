import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View, type ViewProps } from 'react-native';

const SELECTED_BG = 'rgba(242, 194, 94, 0.22)';
const SELECTED_BORDER = 'hsl(39 70% 48%)';

type SelectableSettingsRowProps = ViewProps & {
  selected?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
};

export function SelectableSettingsRow({
  selected = false,
  onPress,
  children,
  style,
  ...rest
}: SelectableSettingsRowProps) {
  const content = (
    <View
      style={[
        {
          backgroundColor: selected ? SELECTED_BG : 'transparent',
          borderWidth: selected ? 1.5 : 0,
          borderColor: selected ? SELECTED_BORDER : 'transparent',
          borderRadius: selected ? 12 : 0,
          marginHorizontal: selected ? 4 : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function SelectedRowBadge({ label }: { label: string }) {
  return (
    <View className="bg-amber-100 px-2 py-0.5 rounded-full">
      <Text className="text-[10px] font-semibold text-amber-800">{label}</Text>
    </View>
  );
}
