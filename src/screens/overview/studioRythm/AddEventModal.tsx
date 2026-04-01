import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { CalendarPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StudioEvent } from './studioRhythm';
import { EVENT_CATEGORIES, getDateKey } from './studioRhythm';

type RecurrenceOption = NonNullable<StudioEvent['recurrence']>;
type ReminderOption = { label: string; value: number | undefined };

const RECURRENCE_OPTIONS: { key: RecurrenceOption; label: string }[] = [
  { key: 'weekly',      label: 'Weekly'      },
  { key: 'fortnightly', label: 'Fortnightly' },
  { key: 'monthly',     label: 'Monthly'     },
  { key: 'custom',      label: 'Custom'      },
];

const REMINDER_OPTIONS: ReminderOption[] = [
  { label: 'Off',          value: undefined },
  { label: 'Morning of',   value: 0         },
  { label: '1 day before', value: 1         },
  { label: '2 days before', value: 2        },
  { label: '3 days before', value: 3        },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  editEvent?: StudioEvent | null;
}

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

export function AddEventModal({ visible, onClose, editEvent }: Props) {
  const insets = useSafeAreaInsets();
  const addStudioEvent    = useAppStore((s) => s.addStudioEvent);
  const updateStudioEvent = useAppStore((s) => s.updateStudioEvent);

  const [form, setForm] = useState<Omit<StudioEvent, 'id'>>(blank);
  const [showCalendar, setShowCalendar] = useState(false);

  // Sync with editEvent when modal opens
  React.useEffect(() => {
    if (visible) {
      setForm(editEvent ? { ...editEvent } : blank());
      setShowCalendar(false);
    }
  }, [visible, editEvent]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit() {
    if (!form.name.trim()) return;
    if (editEvent) {
      updateStudioEvent(editEvent.id, form);
    } else {
      addStudioEvent(form);
    }
    onClose();
  }

  const selectedCategory = EVENT_CATEGORIES.find((c) => c.id === form.categoryId)!;

  const dateDisplay = (() => {
    const [y, m, d] = form.date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  })();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(22,14,10,0.52)' }}>
        <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
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
                  <CalendarPlus size={16} color="hsl(24 75% 45%)" />
                </View>
                <Text className="text-base font-semibold text-foreground">
                  {editEvent ? 'Edit Event' : 'Add Event'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="bg-muted px-3 py-1.5 rounded-full">
                <Text className="text-xs font-medium text-foreground">Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
            >
              {/* Category picker */}
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
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => set('categoryId', cat.id)}
                      activeOpacity={0.8}
                      className="rounded-xl border px-3 py-2.5 items-center"
                      style={{
                        borderColor: selected ? cat.color : 'hsl(24 15% 85%)',
                        backgroundColor: selected ? `${cat.color}18` : 'transparent',
                        minWidth: 72,
                      }}
                    >
                      <Text className="text-base mb-0.5">{cat.emoji}</Text>
                      <Text
                        className="text-[10px] font-semibold"
                        style={{ color: selected ? cat.color : 'hsl(24 10% 55%)' }}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Event name */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Event Name
              </Text>
              <View className="rounded-xl border border-border bg-background px-4 py-3 mb-4">
                <TextInput
                  value={form.name}
                  onChangeText={(v) => set('name', v)}
                  placeholder={`e.g. ${selectedCategory.label} at the market`}
                  placeholderTextColor="hsl(24 10% 60%)"
                  style={{ color: 'hsl(24 15% 18%)', fontSize: 14 }}
                  returnKeyType="done"
                />
              </View>

              {/* Date */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowCalendar((v) => !v)}
                activeOpacity={0.8}
                className="rounded-xl border border-border bg-background px-4 py-3 mb-2 flex-row items-center justify-between"
              >
                <Text className="text-sm text-foreground">{dateDisplay}</Text>
                <Text className="text-xs text-primary font-medium">{showCalendar ? 'Hide' : 'Change'}</Text>
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
                      [form.date]: { selected: true, selectedColor: '#fbbf24' },
                    }}
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      textSectionTitleColor: '#a3a3a3',
                      selectedDayBackgroundColor: '#fbbf24',
                      selectedDayTextColor: '#fff',
                      todayTextColor: '#eab308',
                      dayTextColor: '#22223b',
                      textDisabledColor: '#d1d5db',
                      arrowColor: '#eab308',
                      monthTextColor: '#22223b',
                    }}
                  />
                </View>
              )}

              {/* Recurring */}
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
                    form.isRecurring
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background'
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
                          className={`rounded-xl border px-3 py-2 ${sel ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                        >
                          <Text className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {form.recurrence === 'custom' && (
                    <View className="rounded-xl border border-border bg-background px-4 py-3 mb-4 flex-row items-center gap-2">
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

              {/* Prep reminder */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Prep Reminder
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-2">
                {REMINDER_OPTIONS.map((opt) => {
                  const sel = form.prepReminderOffset === opt.value;
                  return (
                    <TouchableOpacity
                      key={String(opt.value)}
                      onPress={() => set('prepReminderOffset', opt.value)}
                      activeOpacity={0.8}
                      className={`rounded-xl border px-3 py-2 ${sel ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                    >
                      <Text className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="px-5 py-4 border-t border-border" style={{ paddingBottom: insets.bottom + 16 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!form.name.trim()}
                className={`rounded-2xl items-center py-3.5 ${form.name.trim() ? 'bg-primary' : 'bg-muted'}`}
              >
                <Text className={`text-sm font-semibold ${form.name.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {editEvent ? 'Save Event' : 'Add to Rhythm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
