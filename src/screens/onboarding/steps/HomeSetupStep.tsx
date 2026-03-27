import { Input } from '@/src/components/ui/input.ios';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

interface HomeSetupStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
}

export const HomeSetupStep: React.FC<HomeSetupStepProps> = ({
    draft,
    updateDraft,
}) => (
    <View className="mt-3">
        <Text className="text-sm text-muted-foreground leading-6">
            Optional home setup for your own space. Keep it light and refine later.
        </Text>

        <View className="mt-4">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Material storage preference</Text>
            <Input
                value={draft.homeStudioNotes}
                onChangeText={(value) => updateDraft({ homeStudioNotes: value })}
                placeholder="e.g. Buckets by clay body, glaze shelf by cone"
            />
        </View>

        <View className="mt-4">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Tools checklist (optional)</Text>
            <Input
                value={draft.toolsChecklist}
                onChangeText={(value) => updateDraft({ toolsChecklist: value })}
                placeholder="e.g. ribs, trimming tools, bands, test tiles"
            />
        </View>
    </View>
);