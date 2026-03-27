import { Text } from '@/src/components/ui/text';
import { Flame, Layers, Wind } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AVAILABLE_KILNKIN_COMPANIONS } from '../../overview/kilnkin/kilnkinCompanion';

interface KilnkinStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
    formatLabel: (value: string) => string;
}

export const KilnkinStep: React.FC<KilnkinStepProps> = ({
    draft,
    updateDraft,
    formatLabel,
}) => (
    <View className="mt-3 gap-3">
        <Text className="text-sm text-muted-foreground leading-6">
            Pick your Kilnkin companion. You can change it later.
        </Text>

        {AVAILABLE_KILNKIN_COMPANIONS.map((companion) => {
            const active = draft.kilnkinId === companion.id;
            const ElementIcon = companion.personality === 'playful' ? Wind : companion.personality === 'steady' ? Layers : Flame;
            const elementLabel = companion.personality === 'playful' ? 'Air' : companion.personality === 'steady' ? 'Earth' : 'Fire';

            return (
                <Pressable
                    key={companion.id}
                    onPress={() => updateDraft({ kilnkinId: companion.id })}
                    className={`rounded-3xl border p-4 ${active ? 'border-foreground bg-card' : 'border-border bg-card/80'}`}
                >
                    <View className="flex-row items-start gap-3">
                        <View className={`w-11 h-11 rounded-2xl items-center justify-center ${active ? 'bg-foreground' : 'bg-muted'}`}>
                            <ElementIcon size={18} color={active ? 'hsl(34 35% 92%)' : 'hsl(24 20% 40%)'} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{companion.name}</Text>
                            <Text className="text-xs text-muted-foreground mt-1">{companion.species} · {elementLabel}</Text>
                            <Text className="text-xs text-muted-foreground mt-1">{companion.loves}</Text>
                            <Text className="text-[11px] text-primary mt-2">Personality: {formatLabel(companion.personality)}</Text>
                        </View>
                    </View>
                </Pressable>
            );
        })}
    </View>
);