import { SettingsGroup } from '@/src/components/SettingsGroup';
import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventRow } from './components/EventRow';
import { RhythmScreenHeader } from './components/RhythmScreenHeader';
import { RhythmTipCard } from './components/RhythmTipCard';
import { getDateKey } from './studioRhythm';

export default function StudioRhythmEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const events = useAppStore((s) => s.studioRhythm.events);
  const removeStudioEvent = useAppStore((s) => s.removeStudioEvent);

  const today = getDateKey();
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );
  const upcomingEvents = sortedEvents.filter((e) => e.date >= today);
  const pastEvents = sortedEvents.filter((e) => e.date < today);

  function formatEventDate(iso: string) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return (
    <View className="flex-1 bg-background">
      <RhythmScreenHeader
        title="Events"
        subtitle="Optional: add when you have markets or deadlines"
      />

      <ScrollView
        className="flex-1 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mb-4">
          <RhythmTipCard
            title="When to use events"
            body="Add markets, shipping days, or workshops here. They show on your calendar and can nudge you with prep reminders."
          />
        </View>
        <View className="flex-row items-center justify-between px-6 mb-2">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Upcoming{upcomingEvents.length > 0 ? ` · ${upcomingEvents.length}` : ''}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/profile/studio-rhythm/event')}
            activeOpacity={0.8}
            className="flex-row items-center gap-1 rounded-full bg-primary px-3 py-1.5"
          >
            <Plus size={12} color="#fff" />
            <Text className="text-xs font-semibold text-primary-foreground">Add event</Text>
          </TouchableOpacity>
        </View>

        <SettingsGroup>
          {upcomingEvents.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-sm font-semibold text-foreground mb-1">No upcoming events</Text>
              <Text className="text-xs text-muted-foreground text-center leading-5 mb-4 px-4">
                Schedule markets, shipping days, or glaze mixing sessions.
              </Text>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl px-4"
                onPress={() => router.push('/profile/studio-rhythm/event')}
              >
                <Text className="text-sm">Add your first event</Text>
              </Button>
            </View>
          ) : (
            upcomingEvents.map((event, idx) => (
              <EventRow
                key={event.id}
                event={event}
                dateLabel={formatEventDate(event.date)}
                isLast={idx === upcomingEvents.length - 1 && pastEvents.length === 0}
                onEdit={() => router.push({ pathname: '/profile/studio-rhythm/event', params: { id: event.id } })}
                onRemove={() => removeStudioEvent(event.id)}
              />
            ))
          )}
          {pastEvents.length > 0 && (
            <>
              <View className="py-2 border-t border-b border-border bg-muted/30 -mx-4 px-4">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Past events
                </Text>
              </View>
              {pastEvents.map((event, idx) => (
                <EventRow
                  key={event.id}
                  event={event}
                  dateLabel={formatEventDate(event.date)}
                  isLast={idx === pastEvents.length - 1}
                  onEdit={() => router.push({ pathname: '/profile/studio-rhythm/event', params: { id: event.id } })}
                  onRemove={() => removeStudioEvent(event.id)}
                  muted
                />
              ))}
            </>
          )}
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}
