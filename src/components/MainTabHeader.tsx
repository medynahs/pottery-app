import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface MainTabHeaderProps {
    title: string;
    description?: string;
    onPress?: () => void;
    pressIcon?: React.ReactNode;
    actionText?: string;
}

export const MainTabHeader = React.memo(function MainTabHeader({ title, description, onPress, pressIcon, actionText }: MainTabHeaderProps) {
    return (
        <View className="px-6 pt-16 flex-row items-center justify-between">
            <View>
                <Text className="text-3xl font-serif font-bold text-foreground">{title}</Text>
                {description && <Text className="text-sm text-muted-foreground mt-0.5">{description}</Text>}
            </View>

            {onPress && actionText && pressIcon && (
                <TouchableOpacity
                    onPress={onPress}
                    className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary"
                >
                    {pressIcon}
                    <Text className="text-sm font-semibold text-white">{actionText}</Text>
                </TouchableOpacity>
            )}

        </View>
    );
});

