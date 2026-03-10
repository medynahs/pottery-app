// src/screens/kiln/StartFiringModal.tsx
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Select } from '@/src/components/ui/select';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import { Check, X } from 'lucide-react-native';
import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { CONE_OPTIONS, FIRING_TYPE_OPTIONS, KILN_TYPE_LABELS } from './constants';
import type { Firing, FiringType } from './types';

interface StartFiringModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (firing: Firing) => void;
  /** Pre-select kiln id */
  defaultKilnId?: string;
}

const EMPTY_FORM = {
  name: '',
  type: 'bisque' as FiringType,
  kilnId: '',
  cone: '04',
  notes: '',
};

export function StartFiringModal({ visible, onClose, onStart, defaultKilnId }: StartFiringModalProps) {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const kilns = useAppStore((s) => s.kilns);
  const pieces = useAppStore((s) => s.pieces);

  const [form, setForm] = React.useState(EMPTY_FORM);
  const [selectedPieceIds, setSelectedPieceIds] = React.useState<Set<number>>(new Set());
  const [showPiecePicker, setShowPiecePicker] = React.useState(false);

  const kilnOptions = React.useMemo(
    () => kilns.map((k) => ({ value: k.id, label: `${k.name} (${KILN_TYPE_LABELS[k.type]})` })),
    [kilns]
  );

  const assignablePieces = React.useMemo(
    () => pieces.filter((p) => p.stage !== 'cemetery'),
    [pieces]
  );

  React.useEffect(() => {
    if (visible) {
      setForm({
        ...EMPTY_FORM,
        kilnId: defaultKilnId ?? kilns[0]?.id ?? '',
      });
      setSelectedPieceIds(new Set());
      setShowPiecePicker(false);
    }
  }, [visible, defaultKilnId, kilns]);

  const set = (key: keyof typeof EMPTY_FORM) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const togglePiece = (id: number) => {
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStart = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    const firing: Firing = {
      id: `firing-${Date.now()}`,
      kilnId: form.kilnId,
      name: form.name.trim(),
      type: form.type,
      cone: form.cone,
      state: 'scheduled',
      pieceIds: Array.from(selectedPieceIds),
      notes: form.notes.trim(),
      createdAt: now,
    };
    onStart(firing);
    onClose();
  };

  const canStart = form.name.trim().length > 0;
  const selectedKiln = kilns.find((k) => k.id === form.kilnId);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: height * 0.92 }}>
            <View className="w-9 h-1 bg-muted rounded-full self-center mt-4 mb-2" />

            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-border">
              <Text className="text-2xl font-serif font-bold text-foreground">Start Firing</Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView
              className="px-6 pt-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Firing Name */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Firing Name *
              </Text>
              <Input
                placeholder="e.g. Bisque Firing #12"
                value={form.name}
                onChangeText={set('name')}
                className="mb-4"
              />

              {/* Type + Cone row */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Type
                  </Text>
                  <Select
                    value={FIRING_TYPE_OPTIONS.find((o) => o.value === form.type)}
                    onValueChange={(opt) =>
                      opt && setForm((f) => ({ ...f, type: opt.value as FiringType }))
                    }
                    options={FIRING_TYPE_OPTIONS}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Cone
                  </Text>
                  <Select
                    value={CONE_OPTIONS.find((o) => o.value === form.cone)}
                    onValueChange={(opt) => opt && setForm((f) => ({ ...f, cone: opt.value }))}
                    options={CONE_OPTIONS}
                  />
                </View>
              </View>

              {/* Kiln */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Kiln
              </Text>
              {kilns.length === 0 ? (
                <Text className="text-sm text-muted-foreground mb-4">
                  No kilns added yet. Add a kiln first.
                </Text>
              ) : (
                <Select
                  value={kilnOptions.find((o) => o.value === form.kilnId)}
                  onValueChange={(opt) => opt && setForm((f) => ({ ...f, kilnId: opt.value }))}
                  options={kilnOptions}
                  className="mb-4"
                />
              )}

              {selectedKiln && (
                <Text className="text-xs text-muted-foreground mb-4 -mt-2">
                  {selectedKiln.location ? `📍 ${selectedKiln.location}` : ''}{selectedKiln.coneRange ? `  ·  ${selectedKiln.coneRange}` : ''}
                </Text>
              )}

              {/* Pieces */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Assign Pieces ({selectedPieceIds.size})
                </Text>
                <TouchableOpacity onPress={() => setShowPiecePicker((v) => !v)}>
                  <Text className="text-xs font-semibold text-primary">
                    {showPiecePicker ? 'Hide ↑' : 'Choose →'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showPiecePicker && (
                <View className="border border-border rounded-2xl overflow-hidden mb-4">
                  {assignablePieces.length === 0 ? (
                    <View className="p-4">
                      <Text className="text-sm text-muted-foreground">No pieces available.</Text>
                    </View>
                  ) : (
                    assignablePieces.map((p, idx) => {
                      const selected = selectedPieceIds.has(p.id);
                      return (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => togglePiece(p.id)}
                          className={`flex-row items-center gap-3 px-4 py-3 ${
                            idx < assignablePieces.length - 1 ? 'border-b border-border' : ''
                          } ${selected ? 'bg-primary/5' : ''}`}
                        >
                          <View
                            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                              selected ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}
                          >
                            {selected && <Check size={11} color="white" />}
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-foreground">{p.name}</Text>
                            <Text className="text-xs text-muted-foreground">
                              {p.stage} · {p.clay}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}

              {/* Notes */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Notes
              </Text>
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="Temperature schedule, special instructions..."
                value={form.notes}
                onChangeText={set('notes')}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  textAlignVertical: 'top',
                  minHeight: 80,
                  fontSize: 14,
                  marginBottom: 24,
                }}
                placeholderTextColor={colors.mutedForeground}
              />
            </ScrollView>

            <View className="px-6 pb-8 pt-3 border-t border-border">
              <Button onPress={handleStart} disabled={!canStart} className="w-full">
                <Text className="font-semibold">Schedule Firing</Text>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
