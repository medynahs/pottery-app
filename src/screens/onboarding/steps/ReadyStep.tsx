import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { OnboardingDraft } from '@/src/types/user';
import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { AVAILABLE_KILNKIN_COMPANIONS } from '../../overview/kilnkin/kilnkinCompanion';

interface ReadyStepProps {
    draft: OnboardingDraft;
    updateDraft: (patch: Partial<OnboardingDraft>) => void;
}

export const ReadyStep: React.FC<ReadyStepProps> = ({ draft, updateDraft }) => {
    const selectedCompanion = AVAILABLE_KILNKIN_COMPANIONS.find((companion) => companion.id === draft.kilnkinId)
        ?? AVAILABLE_KILNKIN_COMPANIONS[0];

    return (
        <View className="mt-3">
            <View className="rounded-[28px] border border-border bg-card p-5">
                <View className="flex-row items-center gap-2">
                    <CheckCircle2 size={18} color="hsl(135 45% 35%)" />
                    <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>All set!</Text>
                </View>

                <Text className="text-sm text-muted-foreground leading-6 mt-3">
                    Your studio profile, Kilnkin, and core preferences are ready.
                </Text>

                <View className="rounded-2xl border border-border bg-background px-4 py-4 mt-4">
                    <Text className="text-xs text-muted-foreground">User type</Text>
                    <Text className="text-sm text-foreground mt-1">{USER_TYPE_CONFIG[draft.userType].label}</Text>

                    <Text className="text-xs text-muted-foreground mt-3">Companion</Text>
                    <Text className="text-sm text-foreground mt-1">{selectedCompanion.name}</Text>

                    <Text className="text-xs text-muted-foreground mt-3">Modules</Text>
                    <Text className="text-sm text-foreground mt-1">{draft.activeModules.join(', ')}</Text>
                </View>

                <Pressable
                    onPress={() => updateDraft({ quickTourRequested: !draft.quickTourRequested })}
                    className={`mt-4 rounded-2xl border px-4 py-3 ${draft.quickTourRequested ? 'border-foreground bg-card' : 'border-border bg-background'}`}
                >
                    <Text className={`text-sm font-medium ${draft.quickTourRequested ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {draft.quickTourRequested ? 'Quick tour requested' : 'Take a quick tour after entering'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

