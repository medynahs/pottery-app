import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { AVAILABLE_KILNKIN_COMPANIONS } from '../../overview/kilnkin/kilnkinCompanion';

interface StudioPreviewStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
}

export const StudioPreviewStep: React.FC<StudioPreviewStepProps> = ({ draft, updateDraft }) => {

    const selectedCompanion = AVAILABLE_KILNKIN_COMPANIONS.find((companion) => companion.id === draft.kilnkinId)
        ?? AVAILABLE_KILNKIN_COMPANIONS[0];

    return (
        <View className="mt-3">
            <Text className="text-sm text-muted-foreground leading-6 mb-3">
                Here’s your quick studio/home overview. This is where you’ll land to start creating.
            </Text>

            <View className="rounded-[28px] border border-border bg-card p-4">
                <View className="rounded-2xl bg-background border border-border px-4 py-3">
                    <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">Studio Preview</Text>
                    <Text className="text-base text-foreground mt-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>One active piece waiting for your first move</Text>
                </View>

                <View className="flex-row gap-3 mt-3">
                    <View className="flex-1 rounded-2xl border border-border bg-background px-3 py-4">
                        <Text className="text-[11px] text-muted-foreground uppercase tracking-[1.2px]">Piece shelf</Text>
                        <Text className="text-sm text-foreground mt-2">Egg piece placeholder</Text>
                    </View>
                    <View className="flex-1 rounded-2xl border border-border bg-background px-3 py-4">
                        <Text className="text-[11px] text-muted-foreground uppercase tracking-[1.2px]">Kiln zone</Text>
                        <Text className="text-sm text-foreground mt-2">Ready for firing logs</Text>
                    </View>
                </View>

                <View className="rounded-2xl border border-border bg-background px-3 py-4 mt-3">
                    <Text className="text-sm text-foreground">{selectedCompanion.name} is waving and ready to cheer your next piece.</Text>
                    <Text className="text-xs text-muted-foreground mt-2">Tip: tap + in Pieces to add your first form.</Text>
                </View>
            </View>
        </View>
    );
};