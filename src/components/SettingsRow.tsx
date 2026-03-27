import { Text } from '@/src/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface SettingsRowProps {
    icon: React.ComponentType<{ size: number; color: string }>;
    iconColor: string;
    iconBg: string;
    label: string;
    value?: string;
    onPress?: () => void;
    isLast?: boolean;
    danger?: boolean;
}

export const SettingsRow = React.memo(function SettingsRow({ icon: Icon, iconColor, iconBg, label, value, onPress, isLast = false, danger = false, }: SettingsRowProps) {
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
});

