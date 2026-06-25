import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { INPUT_ICON_COLOR } from '@/src/constants/inputTheme';
import type { LucideIcon } from 'lucide-react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View, type TextInputProps } from 'react-native';

interface LabeledInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon?: LucideIcon;
  secure?: boolean;
}

export function LabeledInput({ label, icon: Icon, secure = false, ...inputProps }: LabeledInputProps) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <View>
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </Text>
      <View className="flex-row items-center rounded-xl border border-border bg-card px-3.5 native:h-12 min-h-10">
        {Icon ? <Icon size={16} color={INPUT_ICON_COLOR} style={{ marginRight: 10 }} /> : null}
        <Input
          variant="ghost"
          secureTextEntry={secure && !showSecret}
          className="flex-1"
          {...inputProps}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setShowSecret((v) => !v)} hitSlop={8}>
            {showSecret ? (
              <EyeOff size={16} color={INPUT_ICON_COLOR} />
            ) : (
              <Eye size={16} color={INPUT_ICON_COLOR} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
