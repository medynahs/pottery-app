import { ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import { CalendarClock, History } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type FiringEntrySheetProps = {
  visible: boolean;
  onClose: () => void;
  onSchedule: () => void;
  onRecordPast: () => void;
};

export function FiringEntrySheet({ visible, onClose, onSchedule, onRecordPast }: FiringEntrySheetProps) {
  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard>
        <View className="px-6 pb-8 pt-2">
        <Text className="text-xl font-serif font-bold text-foreground mb-1">Add a firing</Text>
        <Text className="text-sm text-muted-foreground mb-5 leading-5">
          Choose how you want to track this firing.
        </Text>

        <TouchableOpacity
          onPress={() => {
            onClose();
            onSchedule();
          }}
          activeOpacity={0.85}
          className="flex-row items-start gap-3 rounded-2xl border border-border bg-card p-4 mb-3"
        >
          <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
            <CalendarClock size={20} color={BrandColors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">Schedule a firing</Text>
            <Text className="text-sm text-muted-foreground mt-1 leading-5">
              Track progress from loading to unload — get notified when ready.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onClose();
            onRecordPast();
          }}
          activeOpacity={0.85}
          className="flex-row items-start gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
            <History size={20} color="hsl(24 20% 40%)" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">Record a past firing</Text>
            <Text className="text-sm text-muted-foreground mt-1 leading-5">
              Already fired? Log peak temp, outcome, and pieces in one step.
            </Text>
          </View>
        </TouchableOpacity>
        </View>
      </ModalCard>
    </ModalShell>
  );
}
