import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { CalendarCheck2, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RhythmType, StageKey } from './studioRhythm';
import { STAGE_CONFIG } from './studioRhythm';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STAGE_ORDER: StageKey[] = ['throw', 'trim', 'glaze', 'bisque'];
const RHYTHM_TYPES: { key: RhythmType; label: string; description: string }[] = [
  { key: 'weekly',   label: 'Weekly',   description: 'Repeating day assignments that guide your whole week' },
  { key: 'sprint',   label: 'Sprint',   description: 'Intensive blocks — great for market prep or glaze pushes' },
  { key: 'freeform', label: 'Freeform', description: 'No fixed days — just rituals and event reminders' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function StudioRhythmModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const studioRhythm    = useAppStore((s) => s.studioRhythm);
  const setType         = useAppStore((s) => s.setStudioRhythmType);
  const toggleDay       = useAppStore((s) => s.toggleStageDayDay);
  const setDrying       = useAppStore((s) => s.setStudioRhythmDryingTimers);
  const setSprintLength     = useAppStore((s) => s.setSprintLength);
  const setSprintGoalPieces = useAppStore((s) => s.setSprintGoalPieces);

  // Local drafts committed on Save
  const [sprintDraft, setSprintDraft]           = useState(studioRhythm.sprintLengthWeeks ?? 2);
  const [goalDraft,   setGoalDraft]             = useState(studioRhythm.sprintGoalPieces ?? 0);
  useEffect(() => {
    if (visible) {
      setSprintDraft(studioRhythm.sprintLengthWeeks ?? 2);
      setGoalDraft(studioRhythm.sprintGoalPieces ?? 0);
    }
  }, [visible, studioRhythm.sprintLengthWeeks, studioRhythm.sprintGoalPieces]);

  function handleSave() {
    if (studioRhythm.type === 'sprint') {
      setSprintLength(sprintDraft);
      setSprintGoalPieces(goalDraft);
    }
    onClose();
  }

  const stageDayMap: Record<StageKey, number[]> = Object.fromEntries(
    studioRhythm.stageDays.map((sd) => [sd.stage, sd.days])
  ) as Record<StageKey, number[]>;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(22,14,10,0.52)' }}>
        <Pressable
          style={{ position: 'absolute', inset: 0 }}
          onPress={onClose}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            className="bg-card border-t border-border"
            style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl items-center justify-center bg-amber-50 border border-amber-100">
                  <CalendarCheck2 size={16} color="hsl(24 75% 45%)" />
                </View>
                <Text className="text-base font-semibold text-foreground">Edit Rhythm</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="bg-muted px-3 py-1.5 rounded-full">
                <Text className="text-xs font-medium text-foreground">Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
            >
              {/* Rhythm Type */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Rhythm Type
              </Text>
              <View className="flex-row gap-2 mb-5">
                {RHYTHM_TYPES.map((rt) => {
                  const selected = studioRhythm.type === rt.key;
                  return (
                    <TouchableOpacity
                      key={rt.key}
                      onPress={() => setType(rt.key)}
                      activeOpacity={0.8}
                      className={`flex-1 rounded-xl border px-2 py-2.5 items-center ${
                        selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
                      }`}
                    >
                      <Text className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {rt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Type description */}
              {RHYTHM_TYPES.find((rt) => rt.key === studioRhythm.type) && (
                <View className="rounded-xl border border-border bg-muted/40 px-3.5 py-3 mb-5">
                  <Text className="text-xs leading-5 text-muted-foreground">
                    {RHYTHM_TYPES.find((rt) => rt.key === studioRhythm.type)!.description}
                  </Text>
                </View>
              )}

              {/* Stage Day Grid (only for weekly / sprint) */}
              {studioRhythm.type !== 'freeform' && (
                <>
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Stage Days
                  </Text>

                  {/* Day-of-week header */}
                  <View className="flex-row mb-1 pl-16">
                    {DAY_LABELS.map((d, i) => (
                      <View key={i} className="flex-1 items-center">
                        <Text className="text-[10px] font-medium text-muted-foreground">{d}</Text>
                      </View>
                    ))}
                  </View>

                  {STAGE_ORDER.map((stage) => {
                    const cfg = STAGE_CONFIG[stage];
                    const activeDays = stageDayMap[stage] ?? [];
                    return (
                      <View key={stage} className="flex-row items-center mb-2">
                        {/* Stage label pill */}
                        <View
                          className="w-14 rounded-lg px-2 py-1 mr-2 items-center"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <Text className="text-[10px] font-semibold" style={{ color: cfg.text }}>
                            {cfg.label}
                          </Text>
                        </View>

                        {/* Day toggles */}
                        {Array.from({ length: 7 }, (_, i) => {
                          const active = activeDays.includes(i);
                          return (
                            <TouchableOpacity
                              key={i}
                              onPress={() => toggleDay(stage, i)}
                              activeOpacity={0.7}
                              className="flex-1 items-center py-1"
                            >
                              <View
                                className="w-7 h-7 rounded-full items-center justify-center"
                                style={{
                                  backgroundColor: active ? cfg.bg : 'transparent',
                                  borderWidth: 1.5,
                                  borderColor: active ? cfg.text : 'hsl(24 15% 85%)',
                                }}
                              >
                                {active && (
                                  <View
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: cfg.text }}
                                  />
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })}

                  <View className="h-px bg-border my-5" />
                </>
              )}

              {/* Sprint length */}
              {studioRhythm.type === 'sprint' && (
                <>
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Sprint Length
                  </Text>
                  <View className="flex-row gap-2 mb-5">
                    {[1, 2, 3, 4].map((w) => {
                      const sel = sprintDraft === w;
                      return (
                        <TouchableOpacity
                          key={w}
                          onPress={() => setSprintDraft(w)}
                          activeOpacity={0.8}
                          className={`flex-1 rounded-xl border py-2.5 items-center ${
                            sel ? 'border-primary bg-primary/10' : 'border-border bg-background'
                          }`}
                        >
                          <Text className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                            {w}w
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {/* Piece goal */}
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Piece Goal
                  </Text>
                  <View className="rounded-xl border border-border bg-background px-4 py-3 mb-5">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-medium text-foreground">Target pieces</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {goalDraft === 0 ? 'No goal set — tap + to add one' : `Make ${goalDraft} piece${goalDraft === 1 ? '' : 's'} this sprint`}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => setGoalDraft(Math.max(0, goalDraft - 1))}
                          disabled={goalDraft <= 0}
                          activeOpacity={0.7}
                          className="w-8 h-8 rounded-lg border border-border items-center justify-center bg-muted/50"
                        >
                          <ChevronDown size={14} color={goalDraft <= 0 ? 'hsl(24 10% 70%)' : 'hsl(24 15% 25%)'} />
                        </TouchableOpacity>
                        <Text className="text-sm font-semibold text-foreground w-8 text-center">
                          {goalDraft === 0 ? '—' : goalDraft}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setGoalDraft(Math.min(100, goalDraft + 1))}
                          disabled={goalDraft >= 100}
                          activeOpacity={0.7}
                          className="w-8 h-8 rounded-lg border border-border items-center justify-center bg-muted/50"
                        >
                          <ChevronUp size={14} color={goalDraft >= 100 ? 'hsl(24 10% 70%)' : 'hsl(24 15% 25%)'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View className="h-px bg-border my-2 mb-5" />
                </>
              )}

              {/* Drying Timers */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Drying Timers
              </Text>

              <TimerStepper
                label="Leather hard"
                description="Days after throwing before trim window opens"
                value={studioRhythm.dryingTimers.leatherHardDays}
                min={1}
                max={7}
                onChange={(v) => setDrying({ leatherHardDays: v })}
              />
              <TimerStepper
                label="Bone dry"
                description="Days after throwing before bisque-ready"
                value={studioRhythm.dryingTimers.boneDryDays}
                min={2}
                max={14}
                onChange={(v) => setDrying({ boneDryDays: v })}
              />
            </ScrollView>

            {/* Footer */}
            <View className="px-5 py-4 border-t border-border" style={{ paddingBottom: insets.bottom + 16 }}>
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                className="rounded-2xl bg-primary items-center py-3.5"
              >
                <Text className="text-sm font-semibold text-primary-foreground">Save Rhythm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function TimerStepper({
  label,
  description,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="rounded-xl border border-border bg-background px-4 py-3 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-medium text-foreground">{label}</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">{description}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-lg border border-border items-center justify-center bg-muted/50"
          >
            <ChevronDown size={14} color={value <= min ? 'hsl(24 10% 70%)' : 'hsl(24 15% 25%)'} />
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-foreground w-8 text-center">
            {value}d
          </Text>
          <TouchableOpacity
            onPress={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-lg border border-border items-center justify-center bg-muted/50"
          >
            <ChevronUp size={14} color={value >= max ? 'hsl(24 10% 70%)' : 'hsl(24 15% 25%)'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
