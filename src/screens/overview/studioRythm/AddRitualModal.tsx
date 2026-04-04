import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { Repeat2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Ritual } from './studioRhythm';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CADENCE_OPTIONS: { key: Ritual['cadence']; label: string }[] = [
  { key: 'weekly',      label: 'Weekly'      },
  { key: 'fortnightly', label: 'Fortnightly' },
  { key: 'monthly',     label: 'Monthly'     },
];

const PRESET_EMOJIS = ['🧪', '🧹', '📷', '🔬', '🏺', '✂️', '🖌️', '🔥', '💧', '📦', '⭐', '🎨'];

interface Props {
  visible: boolean;
  onClose: () => void;
  editRitual?: Ritual | null;
}

function blank(): Omit<Ritual, 'id'> {
  return { label: '', emoji: '⭐', enabled: true, cadence: 'weekly', dayOfWeek: 0 };
}

export function AddRitualModal({ visible, onClose, editRitual }: Props) {
  const insets         = useSafeAreaInsets();
  const addRitual      = useAppStore((s) => s.addStudioRitual);
  const updateRitual   = useAppStore((s) => s.updateStudioRitual);

  const [form, setForm] = useState<Omit<Ritual, 'id'>>(blank);

  useEffect(() => {
    if (visible) setForm(editRitual ? { ...editRitual } : blank());
  }, [visible, editRitual]);

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.label.trim()) return;
    if (editRitual) {
      updateRitual(editRitual.id, form);
    } else {
      addRitual(form);
    }
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(22,14,10,0.52)' }}>
        <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            className="bg-card border-t border-border"
            style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl items-center justify-center bg-amber-50 border border-amber-100">
                  <Repeat2 size={16} color="hsl(24 75% 45%)" />
                </View>
                <Text className="text-base font-semibold text-foreground">
                  {editRitual ? 'Edit Ritual' : 'New Ritual'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="bg-muted px-3 py-1.5 rounded-full">
                <Text className="text-xs font-medium text-foreground">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="px-5 pt-5" style={{ paddingBottom: insets.bottom + 24 }}>
              {/* Emoji picker */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Icon
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {PRESET_EMOJIS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    onPress={() => patch('emoji', e)}
                    activeOpacity={0.7}
                    className={`w-10 h-10 rounded-xl items-center justify-center border ${
                      form.emoji === e
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background'
                    }`}
                  >
                    <Text className="text-lg">{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Label */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Name
              </Text>
              <TextInput
                value={form.label}
                onChangeText={(v) => patch('label', v)}
                placeholder="e.g. Wheel practice"
                placeholderTextColor="hsl(24 10% 65%)"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground mb-5"
                maxLength={40}
                returnKeyType="done"
              />

              {/* Cadence */}
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
                      className={`flex-1 rounded-xl border py-2.5 items-center ${
                        sel ? 'border-primary bg-primary/10' : 'border-border bg-background'
                      }`}
                    >
                      <Text className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Day of week (weekly only shown with full picker; others show abbreviated) */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Day
              </Text>
              <View className="flex-row gap-1.5 mb-6">
                {DAY_LABELS.map((d, i) => {
                  const sel = form.dayOfWeek === i;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => patch('dayOfWeek', i)}
                      activeOpacity={0.8}
                      className={`flex-1 rounded-lg py-2 items-center border ${
                        sel ? 'border-primary bg-primary/10' : 'border-border bg-background'
                      }`}
                    >
                      <Text className={`text-[10px] font-semibold ${sel ? 'text-primary' : 'text-muted-foreground'}`}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!form.label.trim()}
                className={`rounded-2xl items-center py-3.5 ${form.label.trim() ? 'bg-primary' : 'bg-muted'}`}
              >
                <Text className={`text-sm font-semibold ${form.label.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {editRitual ? 'Save Changes' : 'Add Ritual'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
