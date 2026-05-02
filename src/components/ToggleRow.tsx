import { Text } from '@/src/components/ui/text';
import React from 'react';
import { Switch, View } from 'react-native';

interface ToggleRowProps {
    icon: React.ComponentType<{ size: number; color: string }>;
    iconColor: string;
    iconBg: string;
    label: string;
    value: boolean;
    onToggle: () => void;
    isLast?: boolean;
}

export const ToggleRow = React.memo(function ToggleRow({ icon: Icon, iconColor, iconBg, label, value, onToggle, isLast = false, }: ToggleRowProps) {
    return (
        <View className={`flex-row items-center gap-3 py-3 ${!isLast ? 'border-b border-border' : ''}`}>
            <View className={`w-9 h-9 rounded-xl items-center justify-center ${iconBg}`}>
                <Icon size={17} color={iconColor} />
            </View>
            <Text className="flex-1 text-sm font-medium text-foreground">{label}</Text>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: 'hsl(34 25% 82%)', true: '#8B6A2A' }}
                thumbColor="white"
            />
        </View>
    );
});

