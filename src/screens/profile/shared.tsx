import { Text } from '@/src/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Switch, TouchableOpacity, View } from 'react-native';

export function SectionLabel({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-6">
      {title}
    </Text>
  );
}

export function SettingsRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  onPress,
  isLast = false,
  danger = false,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      className={`flex-row items-center gap-3 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}
    >
      <View className={`w-9 h-9 rounded-xl items-center justify-center ${iconBg}`}>
        <Icon size={17} color={iconColor} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </Text>
      {value && <Text className="text-muted-foreground text-sm mr-1">{value}</Text>}
      <ChevronRight size={15} color="hsl(24 20% 60%)" />
    </TouchableOpacity>
  );
}

export function ToggleRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  onToggle,
  isLast = false,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
}) {
  return (
    <View className={`flex-row items-center gap-3 py-3 ${!isLast ? 'border-b border-border' : ''}`}>
      <View className={`w-9 h-9 rounded-xl items-center justify-center ${iconBg}`}>
        <Icon size={17} color={iconColor} />
      </View>
      <Text className="flex-1 text-sm font-medium text-foreground">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'hsl(34 25% 82%)', true: 'hsl(15 50% 50%)' }}
        thumbColor="white"
      />
    </View>
  );
}

export function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-4">
      {children}
    </View>
  );
}
