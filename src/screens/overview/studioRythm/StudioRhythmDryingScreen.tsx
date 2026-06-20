import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RhythmIconBadge } from './components/RhythmIconBadge';
import { RhythmScreenHeader } from './components/RhythmScreenHeader';
import { RhythmTipCard } from './components/RhythmTipCard';
import { TimerStepper } from './components/TimerStepper';
import { RHYTHM_BROWN } from './rhythmTheme';
import { DRYING_TIMER_ICONS } from './studioRhythmIcons';

const DRYING_FIELDS = [
  {
    key: 'leatherHardDays' as const,
    label: 'Leather hard',
    description: 'Days after throwing before trim window opens',
    min: 1,
    max: 7,
    unit: 'd',
    color: RHYTHM_BROWN.iconColor,
    bg: RHYTHM_BROWN.iconBg,
  },
  {
    key: 'boneDryDays' as const,
    label: 'Bone dry',
    description: 'Days after throwing before bisque-ready',
    min: 2,
    max: 14,
    unit: 'd',
    color: 'hsl(35 65% 38%)',
    bg: 'hsl(38 55% 92%)',
  },
  {
    key: 'glazeDryingHours' as const,
    label: 'Glaze drying',
    description: 'Hours after glazing before kiln-ready',
    min: 1,
    max: 48,
    unit: 'h',
    color: RHYTHM_BROWN.accentDark,
    bg: 'hsl(39 55% 94%)',
  },
  {
    key: 'postBisqueCoolingHours' as const,
    label: 'Post-bisque cooling',
    description: 'Hours after bisque firing before safe to glaze',
    min: 1,
    max: 48,
    unit: 'h',
    color: 'hsl(24 45% 35%)',
    bg: 'hsl(34 40% 92%)',
  },
];

export default function StudioRhythmDryingScreen() {
  const insets = useSafeAreaInsets();
  const dryingTimers = useAppStore((s) => s.studioRhythm.dryingTimers);
  const setDrying = useAppStore((s) => s.setStudioRhythmDryingTimers);

  return (
    <View className="flex-1 bg-background">
      <RhythmScreenHeader
        title="Drying timers"
        subtitle="Defaults are fine — tweak only if your clay dries differently"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <RhythmTipCard
          title="Good to know"
          body="These numbers power trim reminders and drying alerts. Most studios can leave the defaults and adjust later."
        />

        {DRYING_FIELDS.map((field) => {
          const Icon =
            field.key === 'leatherHardDays'
              ? DRYING_TIMER_ICONS.leatherHard
              : field.key === 'boneDryDays'
                ? DRYING_TIMER_ICONS.boneDry
                : field.key === 'glazeDryingHours'
                  ? DRYING_TIMER_ICONS.glazeDry
                  : DRYING_TIMER_ICONS.bisqueCool;

          return (
            <View key={field.key} className="mb-1">
              <View className="flex-row items-center gap-3 mb-2">
                <RhythmIconBadge Icon={Icon} color={field.color} backgroundColor={field.bg} size="sm" />
                <Text className="text-sm font-semibold text-foreground">{field.label}</Text>
              </View>
              <TimerStepper
                label={field.label}
                description={field.description}
                value={dryingTimers[field.key]}
                min={field.min}
                max={field.max}
                unit={field.unit}
                onChange={(v) => setDrying({ [field.key]: v })}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
