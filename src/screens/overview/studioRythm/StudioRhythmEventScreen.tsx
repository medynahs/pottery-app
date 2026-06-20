import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RhythmIconBadge } from './components/RhythmIconBadge';
import { RhythmScreenHeader } from './components/RhythmScreenHeader';
import type { StudioEvent } from './studioRhythm';
import { EVENT_CATEGORIES, getDateKey } from './studioRhythm';
import { EVENT_CATEGORY_ICONS } from './studioRhythmIcons';

type RecurrenceOption = NonNullable<StudioEvent['recurrence']>;
type ReminderOption = { label: string; value: number | undefined };

const RECURRENCE_OPTIONS: { key: RecurrenceOption; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'fortnightly', label: 'Fortnightly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'custom', label: 'Custom' },
];

const REMINDER_OPTIONS: ReminderOption[] = [
  { label: 'Off', value: undefined },
  { label: 'Morning of', value: 0 },
  { label: '1 day before', value: 1 },
  { label: '2 days before', value: 2 },
  { label: '3 days before', value: 3 },
];

function blank(): Omit<StudioEvent, 'id'> {
  return {
    categoryId: 'market',
    name: '',
    date: getDateKey(),
    isRecurring: false,
    recurrence: undefined,
    customRecurrenceDays: undefined,
    prepReminderOffset: undefined,
    notes: '',
  };
}

export default function StudioRhythmEventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const events = useAppStore((s) => s.studioRhythm.events);
  const addStudioEvent = useAppStore((s) => s.addStudioEvent);
  const updateStudioEvent = useAppStore((s) => s.updateStudioEvent);

  const editEvent = useMemo(
    () => (id ? events.find((event) => event.id === id) ?? null : null),
    [events, id]
  );

  const [form, setForm] = useState<Omit<StudioEvent, 'id'>>(() =>
    editEvent ? { ...editEvent } : blank()
  );
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setForm(editEvent ? { ...editEvent } : blank());
    setShowCalendar(false);
  }, [editEvent?.id]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const selectedCategory = EVENT_CATEGORIES.find((c) => c.id === form.categoryId)!;
  const CategoryIcon = EVENT_CATEGORY_ICONS[form.categoryId];

  const dateDisplay = (() => {
    const [y, m, d] = form.date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  })();

  function handleSubmit() {
    if (!form.name.trim()) return;
    if (editEvent) {
      updateStudioEvent(editEvent.id, form);
    } else {
      addStudioEvent(form);
    }
    router.back();
  }

  return (
    <View className="flex-1 bg-background">
      <RhythmScreenHeader
        title={editEvent ? 'Edit event' : 'Add event'}
        subtitle="Schedule studio milestones and reminders"
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
            className="mb-4"
          >
            {EVENT_CATEGORIES.map((cat) => {
              const selected = form.categoryId === cat.id;
              const Icon = EVENT_CATEGORY_ICONS[cat.id];
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => set('categoryId', cat.id)}
                  activeOpacity={0.8}
                  className="rounded-xl border px-3 py-2.5 items-center"
                  style={{
                    borderColor: selected ? cat.color : 'hsl(24 15% 85%)',
                    backgroundColor: selected ? `${cat.color}18` : 'transparent',
                    minWidth: 80,
                  }}
                >
                  <RhythmIconBadge
                    Icon={Icon}
                    color={cat.color}
                    backgroundColor={`${cat.color}14`}
                    size="sm"
                    borderColor={selected ? cat.color : `${cat.color}33`}
                  />
                  <Text
                    className="text-[10px] font-semibold mt-2"
                    style={{ color: selected ? cat.color : 'hsl(24 10% 55%)' }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Event name
          </Text>
          <View className="rounded-xl border border-border bg-card px-4 py-3 mb-4">
            <TextInput
              value={form.name}
              onChangeText={(v) => set('name', v)}
              placeholder={`e.g. ${selectedCategory.label} at the market`}
              placeholderTextColor="hsl(24 10% 60%)"
              style={{ color: 'hsl(24 15% 18%)', fontSize: 14 }}
              returnKeyType="done"
            />
          </View>

          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowCalendar((v) => !v)}
            activeOpacity={0.8}
            className="rounded-xl border border-border bg-card px-4 py-3 mb-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <RhythmIconBadge
                Icon={CategoryIcon}
                color={selectedCategory.color}
                backgroundColor={`${selectedCategory.color}14`}
                size="sm"
              />
              <Text className="text-sm text-foreground">{dateDisplay}</Text>
            </View>
            <Text className="text-xs text-primary font-semibold">{showCalendar ? 'Hide' : 'Change'}</Text>
          </TouchableOpacity>

          {showCalendar && (
            <View className="rounded-xl border border-border bg-card overflow-hidden mb-4">
              <Calendar
                current={form.date}
                onDayPress={(day: { dateString: string }) => {
                  set('date', day.dateString);
                  setShowCalendar(false);
                }}
                markedDates={{
                  [form.date]: { selected: true, selectedColor: 'hsl(39 57% 51%)' },
                }}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: 'hsl(24 20% 45%)',
                  selectedDayBackgroundColor: 'hsl(39 57% 51%)',
                  selectedDayTextColor: '#fff',
                  todayTextColor: 'hsl(39 57% 51%)',
                  dayTextColor: 'hsl(24 25% 15%)',
                  textDisabledColor: 'hsl(24 10% 75%)',
                  arrowColor: 'hsl(39 57% 51%)',
                  monthTextColor: 'hsl(24 25% 15%)',
                }}
              />
            </View>
          )}

          <View className="flex-row items-center justify-between mb-3 mt-1">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recurring
            </Text>
            <TouchableOpacity
              onPress={() => {
                const next = !form.isRecurring;
                setForm((prev) => ({
                  ...prev,
                  isRecurring: next,
                  recurrence: next ? 'weekly' : undefined,
                }));
              }}
              activeOpacity={0.8}
              className={`rounded-full px-3 py-1.5 border ${
                form.isRecurring ? 'border-primary bg-primary/10' : 'border-border bg-card'
              }`}
            >
              <Text className={`text-xs font-semibold ${form.isRecurring ? 'text-primary' : 'text-muted-foreground'}`}>
                {form.isRecurring ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>
          </View>

          {form.isRecurring && (
            <>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {RECURRENCE_OPTIONS.map((opt) => {
                  const sel = form.recurrence === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => set('recurrence', opt.key)}
                      activeOpacity={0.8}
                      className={`rounded-xl border px-3 py-2 ${sel ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                    >
                      <Text className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {form.recurrence === 'custom' && (
                <View className="rounded-xl border border-border bg-card px-4 py-3 mb-4 flex-row items-center gap-2">
                  <TextInput
                    value={String(form.customRecurrenceDays ?? '')}
                    onChangeText={(v) => set('customRecurrenceDays', parseInt(v) || undefined)}
                    placeholder="14"
                    keyboardType="number-pad"
                    placeholderTextColor="hsl(24 10% 60%)"
                    style={{ color: 'hsl(24 15% 18%)', fontSize: 14, width: 48 }}
                    maxLength={3}
                  />
                  <Text className="text-sm text-muted-foreground">days between occurrences</Text>
                </View>
              )}
            </>
          )}

          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Prep reminder
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            {REMINDER_OPTIONS.map((opt) => {
              const sel = form.prepReminderOffset === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  onPress={() => set('prepReminderOffset', opt.value)}
                  activeOpacity={0.8}
                  className={`rounded-xl border px-3 py-2 ${sel ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                >
                  <Text className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-border bg-background"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Button className="rounded-xl h-11" onPress={handleSubmit} disabled={!form.name.trim()}>
            <Text className="text-sm font-semibold text-primary-foreground">
              {editEvent ? 'Save event' : 'Add to rhythm'}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
