import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useVisiblePieces, useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RhythmIconBadge } from './components/RhythmIconBadge';
import { RhythmScreenHeader } from './components/RhythmScreenHeader';
import { RhythmSectionLabel } from './components/RhythmSectionLabel';
import { RhythmTipCard } from './components/RhythmTipCard';
import { WeekGridCard } from './components/WeekGridCard';
import { RHYTHM_BROWN } from './rhythmTheme';
import type { RhythmType, StageKey } from './studioRhythm';
import { STAGE_CONFIG, SUGGESTED_WEEKLY_STAGE_DAYS } from './studioRhythm';
import { STAGE_RHYTHM_ICONS } from './studioRhythmIcons';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STAGE_ORDER: StageKey[] = ['throw', 'trim', 'glaze', 'bisque'];
const RHYTHM_TYPES: { key: RhythmType; label: string; description: string; accent: string }[] = [
  { key: 'weekly', label: 'Weekly', description: 'Best for most studios — same throw/trim/glaze days each week', accent: RHYTHM_BROWN.accent },
  { key: 'sprint', label: 'Sprint', description: 'Short focused push with an optional piece goal', accent: RHYTHM_BROWN.accentDark },
  { key: 'freeform', label: 'Freeform', description: 'No fixed days — just events and rituals', accent: RHYTHM_BROWN.inkSoft },
];

export default function StudioRhythmScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pieces = useVisiblePieces();
  const studioRhythm = useAppStore((s) => s.studioRhythm);
  const setType = useAppStore((s) => s.setStudioRhythmType);
  const setStageDays = useAppStore((s) => s.setStudioRhythmStageDays);
  const toggleDay = useAppStore((s) => s.toggleStageDayDay);
  const setSprintLength = useAppStore((s) => s.setSprintLength);
  const setSprintGoalPieces = useAppStore((s) => s.setSprintGoalPieces);

  const [sprintDraft, setSprintDraft] = useState(studioRhythm.sprintLengthWeeks ?? 2);
  const [goalDraft, setGoalDraft] = useState(studioRhythm.sprintGoalPieces ?? 0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setSprintDraft(studioRhythm.sprintLengthWeeks ?? 2);
    setGoalDraft(studioRhythm.sprintGoalPieces ?? 0);
  }, [studioRhythm.sprintLengthWeeks, studioRhythm.sprintGoalPieces]);

  const stageDayMap: Record<StageKey, number[]> = Object.fromEntries(
    studioRhythm.stageDays.map((sd) => [sd.stage, sd.days])
  ) as Record<StageKey, number[]>;

  function handleSave() {
    if (studioRhythm.type === 'sprint') {
      setSprintLength(sprintDraft);
      setSprintGoalPieces(goalDraft);
    }
    router.back();
  }

  return (
    <View className="flex-1 bg-background">
      <RhythmScreenHeader
        title="Weekly schedule"
        subtitle="Step 1 of 1 — pick your rhythm, then tap your studio days"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <RhythmTipCard
          title="How this works"
          body="Choose Weekly if you're not sure. Then tap the days under Throw, Trim, and Glaze. You can use “Suggested week” to start fast."
        />

        <RhythmSectionLabel title="Rhythm type" hint="Most people start with Weekly" />
        <View className="gap-2.5 mb-6">
          {RHYTHM_TYPES.map((rt) => {
            const selected = studioRhythm.type === rt.key;
            return (
              <TouchableOpacity
                key={rt.key}
                onPress={() => setType(rt.key)}
                activeOpacity={0.85}
                className="rounded-2xl border px-4 py-3.5"
                style={{
                  borderColor: selected ? RHYTHM_BROWN.accent : RHYTHM_BROWN.surfaceBorder,
                  backgroundColor: selected ? 'hsl(39 55% 96%)' : RHYTHM_BROWN.surface,
                }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-bold text-foreground">{rt.label}</Text>
                  <View
                    className="w-4 h-4 rounded-full border-2 items-center justify-center"
                    style={{
                      borderColor: selected ? rt.accent : 'hsl(34 20% 82%)',
                      backgroundColor: selected ? rt.accent : 'transparent',
                    }}
                  >
                    {selected ? <View className="w-1.5 h-1.5 rounded-full bg-white" /> : null}
                  </View>
                </View>
                <Text className={`text-xs leading-5 ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {rt.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {studioRhythm.type !== 'freeform' && (
          <>
            <View className="flex-row items-start justify-between gap-3 mb-3">
              <View className="flex-1">
                <RhythmSectionLabel
                  title="Your studio days"
                  hint="Tap circles to toggle a day on or off"
                />
              </View>
              {studioRhythm.stageDays.every((sd) => sd.days.length === 0) ? (
                <TouchableOpacity
                  onPress={() => setStageDays(SUGGESTED_WEEKLY_STAGE_DAYS)}
                  activeOpacity={0.8}
                  className="rounded-full px-3 py-1.5 border"
                  style={{ backgroundColor: RHYTHM_BROWN.iconBg, borderColor: RHYTHM_BROWN.surfaceBorder }}
                >
                  <Text className="text-[11px] font-bold" style={{ color: RHYTHM_BROWN.accentDark }}>
                    Suggested week
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View className="flex-row mb-2 pl-16">
              {DAY_LABELS.map((d, i) => (
                <View key={i} className="flex-1 items-center">
                  <Text className="text-[11px] font-bold text-foreground">{d}</Text>
                </View>
              ))}
            </View>

            {STAGE_ORDER.map((stage) => {
              const cfg = STAGE_CONFIG[stage];
              const Icon = STAGE_RHYTHM_ICONS[stage];
              const activeDays = stageDayMap[stage] ?? [];
              return (
                <View key={stage} className="flex-row items-center mb-2.5">
                  <View className="w-14 mr-2 items-center">
                    <RhythmIconBadge Icon={Icon} color={cfg.text} backgroundColor={cfg.bg} size="sm" />
                    <Text className="text-[10px] font-bold mt-1" style={{ color: cfg.text }}>
                      {cfg.label}
                    </Text>
                  </View>
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
                          className="w-8 h-8 rounded-xl items-center justify-center"
                          style={{
                            backgroundColor: active ? cfg.bg : '#fff',
                            borderWidth: 2,
                            borderColor: active ? cfg.text : 'hsl(34 20% 82%)',
                          }}
                        >
                          {active ? <Icon size={14} color={cfg.text} /> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}

        {studioRhythm.type === 'sprint' && (
          <>
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-4">
              Sprint length
            </Text>
            <View className="flex-row gap-2 mb-5">
              {[1, 2, 3, 4].map((w) => {
                const sel = sprintDraft === w;
                return (
                  <TouchableOpacity
                    key={w}
                    onPress={() => setSprintDraft(w)}
                    activeOpacity={0.8}
                    className={`flex-1 rounded-xl border py-3 items-center ${
                      sel ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                      {w}w
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Piece goal
            </Text>
            <View className="rounded-2xl border border-border bg-card px-4 py-3.5 mb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-semibold text-foreground">Target pieces</Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    {goalDraft === 0 ? 'Optional — leave at zero for no goal' : `Make ${goalDraft} piece${goalDraft === 1 ? '' : 's'} this sprint`}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2 rounded-xl border border-border bg-muted/30 px-1 py-1">
                  <TouchableOpacity
                    onPress={() => setGoalDraft(Math.max(0, goalDraft - 1))}
                    disabled={goalDraft <= 0}
                    className="w-9 h-9 rounded-lg border border-border items-center justify-center bg-background"
                  >
                    <ChevronDown size={15} color={goalDraft <= 0 ? 'hsl(24 10% 70%)' : 'hsl(24 25% 15%)'} />
                  </TouchableOpacity>
                  <Text className="text-base font-bold text-foreground w-8 text-center">
                    {goalDraft === 0 ? '—' : goalDraft}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setGoalDraft(Math.min(100, goalDraft + 1))}
                    disabled={goalDraft >= 100}
                    className="w-9 h-9 rounded-lg border border-border items-center justify-center bg-background"
                  >
                    <ChevronUp size={15} color={goalDraft >= 100 ? 'hsl(24 10% 70%)' : 'hsl(24 25% 15%)'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          onPress={() => setShowPreview((v) => !v)}
          activeOpacity={0.8}
          className="flex-row items-center justify-between rounded-2xl border px-4 py-3 mt-2 mb-3"
          style={{ backgroundColor: RHYTHM_BROWN.surface, borderColor: RHYTHM_BROWN.surfaceBorder }}
        >
          <Text className="text-sm font-semibold" style={{ color: RHYTHM_BROWN.ink }}>
            {showPreview ? 'Hide live preview' : 'Preview your week'}
          </Text>
          <Text className="text-xs font-semibold" style={{ color: RHYTHM_BROWN.accent }}>
            {showPreview ? 'Collapse' : 'Expand'}
          </Text>
        </TouchableOpacity>
        {showPreview ? (
          <WeekGridCard
            rhythm={studioRhythm}
            onEditPress={() => {}}
            pieces={pieces}
            rituals={studioRhythm.rituals}
            hideEditButton
          />
        ) : null}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t"
        style={{ paddingBottom: insets.bottom + 16, backgroundColor: RHYTHM_BROWN.surface, borderTopColor: RHYTHM_BROWN.surfaceBorder }}
      >
        <Button className="rounded-xl h-11" onPress={handleSave}>
          <Text className="text-sm font-semibold text-primary-foreground">Save schedule</Text>
        </Button>
      </View>
    </View>
  );
}
