import { Text } from '@/src/components/ui/text';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface WelcomeStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
    formatLabel: (value: string) => string;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
    draft,
    updateDraft,
    formatLabel,
}) => (
    <View className="mt-3 rounded-[30px] border border-border bg-card p-5">
        <View className="w-12 h-12 rounded-2xl bg-muted items-center justify-center">
            <Sparkles size={20} color="hsl(24 20% 40%)" />
        </View>
        <Text className="text-base text-foreground mt-4" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
            Welcome to your creative pottery space.
        </Text>
        <Text className="text-sm text-muted-foreground mt-2 leading-6">
            Here, your pieces, studio flow, and Kilnkin help you track, learn, and celebrate every firing.
        </Text>
        <View className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
            <Text className="text-xs text-muted-foreground">You can skip optional setup steps and configure details later.</Text>
        </View>
    </View>
);