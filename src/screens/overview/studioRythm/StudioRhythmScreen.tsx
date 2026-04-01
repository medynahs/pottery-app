import { Card } from '@/src/components/ui/card';
import { Switch } from '@/src/components/ui/switch';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { CalendarDays, Plus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddEventModal } from './AddEventModal';
import { StudioRhythmModal } from './StudioRhythmModal';
import { DryingChip } from './components/DryingChip';
import { EventRow } from './components/EventRow';
import { SectionLabel } from './components/SectionLabel';
import { WeekGridCard } from './components/WeekGridCard';
import type { StudioEvent } from './studioRhythm';
import { getDateKey } from './studioRhythm';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // used for ritual day labels

export default function StudioRhythmScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const rhythm  = useAppStore((s) => s.studioRhythm);
  const pieces  = useAppStore((s) => s.pieces);
  const toggleRitual      = useAppStore((s) => s.toggleStudioRitual);
  const removeStudioEvent = useAppStore((s) => s.removeStudioEvent);

  const [rhythmModalOpen, setRhythmModalOpen] = useState(false);
  const [addEventOpen,    setAddEventOpen]    = useState(false);
  const [editingEvent,    setEditingEvent]    = useState<StudioEvent | null>(null);

  const sortedEvents = useMemo(
    () => [...rhythm.events].sort((a, b) => a.date.localeCompare(b.date)),
    [rhythm.events]
  );
  const today        = getDateKey();
  const upcomingEvents = sortedEvents.filter((e) => e.date >= today);
  const pastEvents     = sortedEvents.filter((e) => e.date < today);

  function formatEventDate(iso: string) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-xl items-center justify-center bg-amber-50 border border-amber-100">
            <CalendarDays size={18} color="hsl(24 75% 45%)" />
          </View>
          <View>
            <Text className="text-base font-serif font-bold text-foreground">Rhythm Planner</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {rhythm.type} · {rhythm.events.length} events
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-muted px-4 py-2 rounded-full">
          <Text className="text-sm font-medium text-foreground">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Week at a Glance ── */}
        <SectionLabel label="Your Week" />
        <WeekGridCard rhythm={rhythm} onEditPress={() => setRhythmModalOpen(true)} pieces={pieces} />

        {/* ── Drying Timers ── */}
        <SectionLabel label="Drying Timers" />
        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <View className="flex-row items-center gap-3">
            <DryingChip emoji="💧" label="Leather hard" value={rhythm.dryingTimers.leatherHardDays} />
            <DryingChip emoji="🌬️" label="Bone dry" value={rhythm.dryingTimers.boneDryDays} />
          </View>
        </Card>

        {/* ── Events ── */}
        <View className="flex-row items-center justify-between mb-2">
          <SectionLabel label={`Events${upcomingEvents.length > 0 ? ` (${upcomingEvents.length})` : ''}`} noMargin />
          <TouchableOpacity
            onPress={() => { setEditingEvent(null); setAddEventOpen(true); }}
            activeOpacity={0.8}
            className="flex-row items-center gap-1 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full"
          >
            <Plus size={12} color="hsl(24 75% 45%)" />
            <Text className="text-xs font-semibold text-primary">Add Event</Text>
          </TouchableOpacity>
        </View>

        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          {upcomingEvents.length === 0 && (
            <View className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 items-center">
              <Text className="text-sm text-muted-foreground text-center">
                No upcoming events. Tap "+ Add Event" to schedule one.
              </Text>
            </View>
          )}
          {upcomingEvents.map((event, idx) => (
            <EventRow
              key={event.id}
              event={event}
              dateLabel={formatEventDate(event.date)}
              isLast={idx === upcomingEvents.length - 1}
              onEdit={() => { setEditingEvent(event); setAddEventOpen(true); }}
              onRemove={() => removeStudioEvent(event.id)}
            />
          ))}
          {pastEvents.length > 0 && (
            <>
              <View className="h-px bg-border my-3" />
              <Text className="text-xs text-muted-foreground mb-2">Past events</Text>
              {pastEvents.map((event, idx) => (
                <EventRow
                  key={event.id}
                  event={event}
                  dateLabel={formatEventDate(event.date)}
                  isLast={idx === pastEvents.length - 1}
                  onEdit={() => { setEditingEvent(event); setAddEventOpen(true); }}
                  onRemove={() => removeStudioEvent(event.id)}
                  muted
                />
              ))}
            </>
          )}
        </Card>

        {/* ── Studio Rituals ── */}
        <SectionLabel label="Studio Rituals" />
        <Card className="rounded-2xl border-border bg-card p-4 mb-6">
          <Text className="text-xs text-muted-foreground mb-3 leading-5">
            Regular habits that keep your studio ticking. Enable the ones that fit your week.
          </Text>
          {rhythm.rituals.map((ritual, idx) => (
            <View
              key={ritual.id}
              className={`flex-row items-center justify-between py-3 ${idx < rhythm.rituals.length - 1 ? 'border-b border-border' : ''}`}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Text className="text-base">{ritual.emoji}</Text>
                <View className="flex-1">
                  <Text className={`text-sm font-medium ${ritual.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {ritual.label}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {ritual.cadence}{ritual.dayOfWeek !== undefined ? ` · ${DAY_LABELS[ritual.dayOfWeek]}` : ''}
                  </Text>
                </View>
              </View>
              <Switch checked={ritual.enabled} onCheckedChange={() => toggleRitual(ritual.id)} />
            </View>
          ))}
        </Card>
      </ScrollView>

      {/* ── Modals ── */}
      <StudioRhythmModal visible={rhythmModalOpen} onClose={() => setRhythmModalOpen(false)} />
      <AddEventModal
        visible={addEventOpen}
        onClose={() => { setAddEventOpen(false); setEditingEvent(null); }}
        editEvent={editingEvent}
      />
    </View>
  );
}
