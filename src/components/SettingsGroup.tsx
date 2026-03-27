import React from 'react';
import { View } from 'react-native';

interface SettingsGroupProps {
    children: React.ReactNode;
}

export const SettingsGroup = React.memo(function SettingsGroup({ children }: SettingsGroupProps) {
    return (
        <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-4">
            {children}
        </View>
    );
});

