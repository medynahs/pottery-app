import { Text } from '@/src/components/ui/text';
import { useVisiblePieces, useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { CalendarDays, Clock, Repeat2, Store } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RhythmScreenHeader } from './components/RhythmScreenHeader';
import { RhythmSectionCard } from './components/RhythmSectionCard';
import { RhythmSetupHero } from './components/RhythmSetupHero';
import { RhythmTodayPreview } from './components/RhythmTodayPreview';
import { WeekGridCard } from './components/WeekGridCard';
import { RHYTHM_BROWN, RHYTHM_SECTIONS } from './rhythmTheme';
import { getRhythmSetupProgress, getTodayRhythmPreview } from './rhythmUtils';
import { getDateKey, isStudioRhythmConfigured, SUGGESTED_WEEKLY_STAGE_DAYS } from './studioRhythm';

const RHYTHM_TYPE_LABELS = {
  weekly: 'Weekly',
  sprint: 'Sprint',
  freeform: 'Freeform',
} as const;

export default function StudioRhythmHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rhythm = useAppStore((s) => s.studioRhythm);
  const pieces = useVisiblePieces();
  const [showCalendar, setShowCalendar] = useState(false);

  const today = getDateKey();
  const upcomingEvents = useMemo(
    () => rhythm.events.filter((e) => e.date >= today).length,
    [rhythm.events, today]
  );
  const enabledRituals = rhythm.rituals.filter((r) => r.enabled).length;
  const configured = isStudioRhythmConfigured(rhythm);
  const setup = getRhythmSetupProgress(rhythm);
  const todayPreview = getTodayRhythmPreview(rhythm);

  return (
    <View className="flex-1 bg-background">
      <RhythmScreenHeader
        title="Studio Rhythm"
        subtitle={setup.isNewUser ? 'One quick setup, then daily missions follow your week' : 'Your week at a glance'}
      />

      <ScrollView
        className="flex-1 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {setup.isNewUser ? (
          <RhythmSetupHero onStart={() => router.push('/profile/studio-rhythm/schedule')} />
        ) : (
          <RhythmTodayPreview
            preview={todayPreview}
            onOpenSchedule={() => router.push('/profile/studio-rhythm/schedule')}
          />
        )}

        {configured || setup.isNewUser ? (
          <View className="mx-6 mb-5">
            {!configured ? (
              <Text className="text-xs text-muted-foreground mb-2 px-1">Preview with a suggested week until you save your schedule.</Text>
            ) : null}
            <TouchableOpacity
              onPress={() => setShowCalendar((v) => !v)}
              activeOpacity={0.8}
              className="flex-row items-center justify-between rounded-2xl border px-4 py-3 mb-3"
              style={{ backgroundColor: RHYTHM_BROWN.surface, borderColor: RHYTHM_BROWN.surfaceBorder }}
            >
              <Text className="text-sm font-semibold" style={{ color: RHYTHM_BROWN.ink }}>
                {showCalendar ? 'Hide week calendar' : 'Show week calendar'}
              </Text>
              <Text className="text-xs font-semibold" style={{ color: RHYTHM_BROWN.accent }}>
                {showCalendar ? 'Collapse' : 'Expand'}
              </Text>
            </TouchableOpacity>
            {showCalendar ? (
              <WeekGridCard
                rhythm={configured ? rhythm : { ...rhythm, type: 'weekly', stageDays: SUGGESTED_WEEKLY_STAGE_DAYS }}
                onEditPress={() => router.push('/profile/studio-rhythm/schedule')}
                pieces={pieces}
                rituals={rhythm.rituals}
              />
            ) : null}
          </View>
        ) : null}

        <View className="px-6 mb-2">
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 0.9,
              color: RHYTHM_BROWN.inkSoft,
              textTransform: 'uppercase',
            }}
          >
            {setup.isNewUser ? 'Optional: explore anytime' : 'Manage'}
          </Text>
          {setup.isNewUser ? (
            <Text className="text-xs leading-4 mt-1 mb-3" style={{ color: RHYTHM_BROWN.inkMuted }}>
              Start with your weekly schedule. These can wait until you&apos;re ready.
            </Text>
          ) : null}
        </View>

        <View
          className="mx-6 rounded-2xl border px-4 overflow-hidden"
          style={{
            backgroundColor: RHYTHM_BROWN.surface,
            borderColor: RHYTHM_BROWN.surfaceBorder,
            shadowColor: RHYTHM_BROWN.cardShadow,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <RhythmSectionCard
            icon={CalendarDays}
            iconColor={RHYTHM_SECTIONS.schedule.iconColor}
            iconBg={RHYTHM_SECTIONS.schedule.iconBg}
            label={RHYTHM_SECTIONS.schedule.label}
            hint={RHYTHM_SECTIONS.schedule.hint}
            value={configured ? RHYTHM_TYPE_LABELS[rhythm.type] : 'Not set'}
            recommended={setup.isNewUser}
            onPress={() => router.push('/profile/studio-rhythm/schedule')}
          />
          <RhythmSectionCard
            icon={Clock}
            iconColor={RHYTHM_SECTIONS.drying.iconColor}
            iconBg={RHYTHM_SECTIONS.drying.iconBg}
            label={RHYTHM_SECTIONS.drying.label}
            hint={RHYTHM_SECTIONS.drying.hint}
            value={`${rhythm.dryingTimers.leatherHardDays}d · ${rhythm.dryingTimers.boneDryDays}d`}
            onPress={() => router.push('/profile/studio-rhythm/drying')}
          />
          <RhythmSectionCard
            icon={Store}
            iconColor={RHYTHM_SECTIONS.events.iconColor}
            iconBg={RHYTHM_SECTIONS.events.iconBg}
            label={RHYTHM_SECTIONS.events.label}
            hint={RHYTHM_SECTIONS.events.hint}
            value={upcomingEvents > 0 ? `${upcomingEvents} upcoming` : 'None yet'}
            onPress={() => router.push('/profile/studio-rhythm/events')}
          />
          <RhythmSectionCard
            icon={Repeat2}
            iconColor={RHYTHM_SECTIONS.rituals.iconColor}
            iconBg={RHYTHM_SECTIONS.rituals.iconBg}
            label={RHYTHM_SECTIONS.rituals.label}
            hint={RHYTHM_SECTIONS.rituals.hint}
            value={`${enabledRituals} active`}
            isLast
            onPress={() => router.push('/profile/studio-rhythm/rituals')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

