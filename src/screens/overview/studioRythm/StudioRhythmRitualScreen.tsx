import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RhythmIconBadge } from './components/RhythmIconBadge';
import { RhythmScreenHeader } from './components/RhythmScreenHeader';
import type { Ritual } from './studioRhythm';
import { RITUAL_PICKABLE_ICONS, resolveRitualIconKey } from './studioRhythmIcons';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CADENCE_OPTIONS: { key: Ritual['cadence']; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'fortnightly', label: 'Fortnightly' },
  { key: 'monthly', label: 'Monthly' },
];

function blank(): Omit<Ritual, 'id'> {
  return { label: '', iconKey: 'star', enabled: true, cadence: 'weekly', dayOfWeek: 0 };
}

export default function StudioRhythmRitualScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const rituals = useAppStore((s) => s.studioRhythm.rituals);
  const addRitual = useAppStore((s) => s.addStudioRitual);
  const updateRitual = useAppStore((s) => s.updateStudioRitual);

  const editRitual = useMemo(
    () => (id ? rituals.find((ritual) => ritual.id === id) ?? null : null),
    [id, rituals]
  );

  const [form, setForm] = useState<Omit<Ritual, 'id'>>(() =>
    editRitual
      ? { ...editRitual, iconKey: resolveRitualIconKey(editRitual) }
      : blank()
  );

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.label.trim()) return;
    const payload = { ...form, iconKey: form.iconKey ?? 'star' };
    if (editRitual) {
      updateRitual(editRitual.id, payload);
    } else {
      addRitual(payload);
    }
    router.back();
  }

  return (
    <View className="flex-1 bg-background">
      <RhythmScreenHeader
        title={editRitual ? 'Edit ritual' : 'New ritual'}
        subtitle="Build a recurring studio habit"
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
            Icon
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {RITUAL_PICKABLE_ICONS.map(({ key, Icon }) => {
              const selected = (form.iconKey ?? 'star') === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => patch('iconKey', key)}
                  activeOpacity={0.7}
                  className={`rounded-xl border p-1 ${
                    selected ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}
                >
                  <RhythmIconBadge
                    Icon={Icon}
                    color={selected ? 'hsl(39 57% 51%)' : 'hsl(24 20% 45%)'}
                    backgroundColor={selected ? 'hsl(39 55% 96%)' : 'hsl(34 20% 96%)'}
                    size="md"
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Name
          </Text>
          <TextInput
            value={form.label}
            onChangeText={(v) => patch('label', v)}
            placeholder="e.g. Wheel practice"
            placeholderTextColor="hsl(24 10% 65%)"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground mb-5"
            maxLength={40}
            returnKeyType="done"
          />

          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Frequency
          </Text>
          <View className="flex-row gap-2 mb-5">
            {CADENCE_OPTIONS.map((opt) => {
              const sel = form.cadence === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => patch('cadence', opt.key)}
                  activeOpacity={0.8}
                  className={`flex-1 rounded-xl border py-3 items-center ${
                    sel ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Day
          </Text>
          <View className="flex-row gap-1.5 mb-2">
            {DAY_LABELS.map((d, i) => {
              const sel = form.dayOfWeek === i;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => patch('dayOfWeek', i)}
                  activeOpacity={0.8}
                  className={`flex-1 rounded-lg py-2.5 items-center border ${
                    sel ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}
                >
                  <Text className={`text-[10px] font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                    {d}
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
          <Button className="rounded-xl h-11" onPress={handleSubmit} disabled={!form.label.trim()}>
            <Text className="text-sm font-semibold text-primary-foreground">
              {editRitual ? 'Save ritual' : 'Add ritual'}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
