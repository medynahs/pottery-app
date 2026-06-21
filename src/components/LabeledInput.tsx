import { Text } from '@/src/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View, type TextInputProps } from 'react-native';
import { useTextScale } from '@/src/hooks/useTextScale';

interface LabeledInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Optional leading icon shown inside the field. */
  icon?: LucideIcon;
  /** Renders as a password field with a show/hide toggle. */
  secure?: boolean;
}

/**
 * Standard labeled form field: uppercase micro-label above a 56pt card row,
 * with optional leading icon and password visibility toggle. Replaces the
 * nine hand-rolled field blocks across the auth screens.
 */
export function LabeledInput({ label, icon: Icon, secure = false, ...inputProps }: LabeledInputProps) {
  const [showSecret, setShowSecret] = useState(false);
  const { scaled } = useTextScale();
  const inputFontSize = scaled(14);

  return (
    <View>
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </Text>
      <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-14">
        {Icon ? <Icon size={16} color="hsl(24 20% 55%)" style={{ marginRight: 10 }} /> : null}
        <TextInput
          placeholderTextColor="hsl(24 10% 65%)"
          secureTextEntry={secure && !showSecret}
          style={{ flex: 1, fontSize: inputFontSize, color: 'hsl(24 30% 20%)' }}
          {...inputProps}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setShowSecret((v) => !v)} hitSlop={8}>
            {showSecret
              ? <EyeOff size={16} color="hsl(24 20% 55%)" />
              : <Eye size={16} color="hsl(24 20% 55%)" />}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
