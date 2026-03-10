// src/screens/kiln/AddKilnModal.tsx
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Pressable } from '@/src/components/ui/pressable';
import { Select } from '@/src/components/ui/select';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { X } from 'lucide-react-native';
import React from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { KILN_TYPE_OPTIONS } from './constants';
import type { Kiln, KilnType } from './types';

interface AddKilnModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (kiln: Kiln) => void;
  editKiln?: Kiln;
}

const EMPTY_FORM = {
  name: '',
  type: 'electric' as KilnType,
  coneRange: '',
  shelves: '',
  size: '',
  location: '',
  notes: '',
};

export function AddKilnModal({ visible, onClose, onSave, editKiln }: AddKilnModalProps) {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isEditing = !!editKiln;

  const [form, setForm] = React.useState(EMPTY_FORM);

  React.useEffect(() => {
    if (visible) {
      if (editKiln) {
        setForm({
          name: editKiln.name,
          type: editKiln.type,
          coneRange: editKiln.coneRange,
          shelves: String(editKiln.shelves),
          size: editKiln.size,
          location: editKiln.location,
          notes: editKiln.notes,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [visible, editKiln]);

  const set = (key: keyof typeof EMPTY_FORM) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const kiln: Kiln = {
      id: editKiln?.id ?? `kiln-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      coneRange: form.coneRange.trim(),
      shelves: parseInt(form.shelves, 10) || 0,
      size: form.size.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
      createdAt: editKiln?.createdAt ?? new Date().toISOString(),
    };
    onSave(kiln);
    onClose();
  };

  const canSave = form.name.trim().length > 0;

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
              <Text className="text-2xl font-serif font-bold text-foreground">
                {isEditing ? 'Edit Kiln' : 'Add Kiln'}
              </Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView
              className="px-6 pt-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Name */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Kiln Name *
              </Text>
              <Input
                placeholder="e.g. Old Red Kiln"
                value={form.name}
                onChangeText={set('name')}
                className="mb-4"
              />

              {/* Type */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Kiln Type
              </Text>
              <Select
                value={KILN_TYPE_OPTIONS.find((o) => o.value === form.type)}
                onValueChange={(opt) => opt && setForm((f) => ({ ...f, type: opt.value as KilnType }))}
                options={KILN_TYPE_OPTIONS}
                placeholder="Select type..."
                className="mb-4"
              />

              {/* Cone Range */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Cone Range
              </Text>
              <Input
                placeholder="e.g. Cone 04–6"
                value={form.coneRange}
                onChangeText={set('coneRange')}
                className="mb-4"
              />

              {/* Shelves + Size row */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Shelves
                  </Text>
                  <Input
                    placeholder="e.g. 4"
                    value={form.shelves}
                    onChangeText={set('shelves')}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Size
                  </Text>
                  <Input
                    placeholder='e.g. 18" dia'
                    value={form.size}
                    onChangeText={set('size')}
                  />
                </View>
              </View>

              {/* Location */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Studio / Location
              </Text>
              <Input
                placeholder="e.g. Main Studio"
                value={form.location}
                onChangeText={set('location')}
                className="mb-4"
              />

              {/* Notes / quirks */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Personality & Quirks
              </Text>
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="e.g. Runs hot on the top shelf. First shelf always slower."
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
                  minHeight: 90,
                  fontSize: 14,
                  marginBottom: 24,
                }}
                placeholderTextColor={colors.mutedForeground}
              />
            </ScrollView>

            <View className="px-6 pb-8 pt-3 border-t border-border">
              <Button onPress={handleSave} disabled={!canSave} className="w-full">
                <Text className="font-semibold">{isEditing ? 'Save Changes' : 'Add Kiln'}</Text>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
