import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { useAppStore } from '@/src/store';
import { OnboardingDraft } from '@/src/types/user';
import { useRouter } from 'expo-router';
import { CalendarDays, CheckCircle2, CloudUpload, Flame, Sparkles, Wallet } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { AVAILABLE_KILNKIN_COMPANIONS } from '../../overview/kilnkin/kilnkinCompanion';

interface ReadyStepProps {
    draft: OnboardingDraft;
    updateDraft: (patch: Partial<OnboardingDraft>) => void;
}

const FIRST_QUESTS = [
    { Icon: CalendarDays, color: 'hsl(213 70% 45%)', label: 'Set your Studio Rhythm' },
    { Icon: Flame, color: 'hsl(16 78% 52%)', label: 'Add your kiln' },
    { Icon: Wallet, color: 'hsl(44 70% 45%)', label: 'Set your pricing profile' },
    { Icon: Sparkles, color: 'hsl(270 55% 52%)', label: 'Log your first piece' },
];

export const ReadyStep: React.FC<ReadyStepProps> = ({ draft, updateDraft }) => {
    const router = useRouter();
    const sessionToken = useAppStore(s => s.sessionToken);
    const selectedCompanion = AVAILABLE_KILNKIN_COMPANIONS.find((companion) => companion.id === draft.kilnkinId)
        ?? AVAILABLE_KILNKIN_COMPANIONS[0];

    return (
        <View className="mt-3 gap-3">
            <View className="rounded-[28px] border border-border bg-card p-5">
                <View className="flex-row items-center gap-2 mb-3">
                    <CheckCircle2 size={18} color="hsl(135 45% 35%)" />
                    <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                        {selectedCompanion.name} is ready for you.
                    </Text>
                </View>

                <Text className="text-sm text-muted-foreground leading-6">
                    Your studio is set up as a {USER_TYPE_CONFIG[draft.userType].label.toLowerCase()}. A few quick-start quests will be waiting inside — they take about a minute each.
                </Text>
            </View>

            <View className="rounded-[28px] border border-border bg-card px-5 py-4">
                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-3">Your first quests</Text>
                <View className="gap-2.5">
                    {FIRST_QUESTS.map(({ Icon, color, label }) => (
                        <View key={label} className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                                <Icon size={14} color={color} />
                            </View>
                            <Text className="text-sm text-foreground">{label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {!sessionToken && (
                <Pressable
                    onPress={() => router.push('/register')}
                    className="rounded-[28px] border border-border bg-card px-5 py-4 flex-row items-center gap-3"
                >
                    <CloudUpload size={18} color="hsl(24 20% 40%)" />
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">Back up your studio</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">Create a free account to sync across devices. You can do this later too.</Text>
                    </View>
                </Pressable>
            )}
        </View>
    );
};

