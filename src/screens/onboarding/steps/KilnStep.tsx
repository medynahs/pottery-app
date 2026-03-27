import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { Pill } from '../../../components/Pill';
import { KilnType } from '../../kiln/types';

interface KilnStepProps {
  draft: any;
  updateDraft: (patch: Partial<any>) => void;
  formatLabel: (value: string) => string;
}
const KILN_TYPE_OPTIONS: KilnType[] = ['electric', 'gas', 'wood', 'studio'];

export const KilnStep: React.FC<KilnStepProps> = ({
  draft,
  updateDraft,
  formatLabel,
}) => (
  <View className="mt-3">
    <Text className="text-sm text-muted-foreground leading-6">
      Do you have your own kiln? You can skip this now and set details later.
    </Text>
    <View className="flex-row gap-2 mt-3">
      <Pill label="Yes, I do" active={draft.hasOwnKiln === true} onPress={() => updateDraft({ hasOwnKiln: true })} />
      <Pill label="No, shared service" active={draft.hasOwnKiln === false} onPress={() => updateDraft({ hasOwnKiln: false })} />
    </View>
    {(draft.userType === 'studio-potter' || draft.userType === 'hybrid-potter' || draft.userType === 'studio-owner-technician' || draft.userType === 'teacher' || draft.userType === 'business-owner') && (
      <View className="mt-4">
        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Studio name</Text>
        <Input value={draft.studioName} onChangeText={value => updateDraft({ studioName: value })} placeholder="e.g. North Clay Collective" />
      </View>
    )}
    {draft.userType === 'studio-owner-technician' && (
      <View className="mt-4">
        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">How many kilns do you manage? (optional)</Text>
        <Input value={draft.kilnCount} onChangeText={value => updateDraft({ kilnCount: value })} keyboardType="number-pad" placeholder="e.g. 3" />
      </View>
    )}
    {draft.hasOwnKiln ? (
      <View className="mt-4 rounded-3xl border border-border bg-card p-4">
        <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Your first kiln</Text>
        <View className="mt-3">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Kiln name</Text>
          <Input value={draft.kilnName} onChangeText={value => updateDraft({ kilnName: value })} placeholder="e.g. Ember One" />
        </View>
        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Kiln type</Text>
        <View className="flex-row flex-wrap gap-2">
          {KILN_TYPE_OPTIONS.map(type => (
            <Pill key={type} label={formatLabel(type)} active={draft.kilnType === type} onPress={() => updateDraft({ kilnType: type })} />
          ))}
        </View>
        <View className="mt-4">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Optional nickname</Text>
          <Input value={draft.kilnNickname} onChangeText={value => updateDraft({ kilnNickname: value })} placeholder="e.g. Old Faithful" />
        </View>
      </View>
    ) : (
      <View className="mt-4 rounded-3xl border border-border bg-card p-4">
        <Text className="text-sm text-foreground">No problem — we’ll keep kiln tracking ready for shared or service firings.</Text>
      </View>
    )}
  </View>
);