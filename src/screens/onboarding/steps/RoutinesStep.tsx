import { Text } from '@/src/components/ui/text';
import { OnboardingPieceFocus, OnboardingPracticeFrequency } from '@/src/store/appStore';
import { formatLabel } from '@/src/utils/helpers';
import React from 'react';
import { View } from 'react-native';
import { Pill } from '../../../components/Pill';

interface RoutinesStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
}

const FREQUENCY_OPTIONS: OnboardingPracticeFrequency[] = ['daily', 'weekly', 'flexible'];
const FOCUS_OPTIONS: OnboardingPieceFocus[] = ['wheel', 'hand-building', 'glazing', 'reclaim'];

export const RoutinesStep: React.FC<RoutinesStepProps> = ({
    draft,
    updateDraft,
}) => (
    <View className="mt-3">
        <Text className="text-sm text-muted-foreground leading-6">
            Set your pottery rhythm. You can tweak this anytime.
        </Text>

        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Practice frequency</Text>
        <View className="flex-row flex-wrap gap-2">
            {FREQUENCY_OPTIONS.map((option) => (
                <Pill key={option} label={formatLabel(option)} active={draft.routinesFrequency === option} onPress={() => updateDraft({ routinesFrequency: option })} />
            ))}
        </View>

        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Current focus</Text>
        <View className="flex-row flex-wrap gap-2">
            {FOCUS_OPTIONS.map((option) => (
                <Pill key={option} label={formatLabel(option)} active={draft.routinesFocus === option} onPress={() => updateDraft({ routinesFocus: option })} />
            ))}
        </View>
    </View>
);