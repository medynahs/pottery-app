// src/screens/kiln/AddKilnModal.tsx
import { InfoSheet, ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Button } from '@/src/components/ui/button';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { useAppStore } from '@/src/store';
import { X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import type { Kiln } from '../../../types/kiln';
import {
    AddKilnModalForm,
    EMPTY_ADD_KILN_FORM,
    type AddKilnFormValues,
    type AddKilnHelpField,
} from './AddKilnModalForm';

interface AddKilnModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (kiln: Kiln) => void;
  editKiln?: Kiln;
}

export function AddKilnModal({ visible, onClose, onSave, editKiln }: AddKilnModalProps) {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isEditing = !!editKiln;
  const currencySymbol = useAppStore((state) => state.pricingSettings.currencySymbol);

  const [form, setForm] = React.useState<AddKilnFormValues>(EMPTY_ADD_KILN_FORM);
  const [openHelp, setOpenHelp] = React.useState<AddKilnHelpField | null>(null);
  const [showAdvancedTiming, setShowAdvancedTiming] = React.useState(false);
  const [infoSheet, setInfoSheet] = React.useState<{ title: string; body: string } | null>(null);

  const { openPickSheet } = usePhotoPicker({ aspect: [4, 3] });

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    if (editKiln) {
      setForm({
        name: editKiln.name,
        imageUri: editKiln.imageUri ?? '',
        type: editKiln.type,
        coneRange: editKiln.coneRange,
        shelves: String(editKiln.shelves),
        size: editKiln.size,
        location: editKiln.location,
        queueDelayDays:
          editKiln.queueDelayDays != null
            ? String(editKiln.queueDelayDays)
            : editKiln.studioDelayDays != null
              ? String(editKiln.studioDelayDays)
              : '',
        cycleDurationDays: editKiln.cycleDurationDays != null ? String(editKiln.cycleDurationDays) : '',
        pickupDelayDays: editKiln.pickupDelayDays != null ? String(editKiln.pickupDelayDays) : '',
        runsEveryDays: editKiln.runsEveryDays != null ? String(editKiln.runsEveryDays) : '',
        pricingModel: editKiln.pricingModel ?? 'per-kiln',
        pricingBaseRate: editKiln.pricingBaseRate ? String(editKiln.pricingBaseRate) : '',
        notes: editKiln.notes,
      });
    } else {
      setForm(EMPTY_ADD_KILN_FORM);
    }

    setOpenHelp(null);
    setShowAdvancedTiming(Boolean(editKiln?.runsEveryDays));
  }, [editKiln, visible]);

  const toggleHelp = React.useCallback((field: AddKilnHelpField) => {
    setOpenHelp((current) => (current === field ? null : field));
  }, []);

  const handleChooseKilnImageSource = React.useCallback(() => {
    openPickSheet(
      (uri) => setForm((current) => ({ ...current, imageUri: uri })),
      form.imageUri ? () => setForm((current) => ({ ...current, imageUri: '' })) : undefined,
    );
  }, [openPickSheet, form.imageUri]);

  const handleRemoveKilnImage = React.useCallback(() => {
    setForm((current) => ({ ...current, imageUri: '' }));
  }, []);

  const handleSave = () => {
    if (!form.name.trim()) return;

    const kiln: Kiln = {
      id: editKiln?.id ?? `kiln-${Date.now()}`,
      name: form.name.trim(),
      imageUri: form.imageUri.trim() || undefined,
      type: form.type,
      coneRange: form.coneRange.trim(),
      shelves: parseInt(form.shelves, 10) || 0,
      size: form.size.trim(),
      location: form.location.trim(),
      queueDelayDays: parseFloat(form.queueDelayDays) || undefined,
      cycleDurationDays: parseFloat(form.cycleDurationDays) || undefined,
      pickupDelayDays: parseFloat(form.pickupDelayDays) || undefined,
      runsEveryDays: parseFloat(form.runsEveryDays) || undefined,
      pricingModel: form.pricingModel,
      pricingBaseRate: parseFloat(form.pricingBaseRate) || undefined,
      notes: form.notes.trim(),
      createdAt: editKiln?.createdAt ?? new Date().toISOString(),
    };

    onSave(kiln);
    onClose();
  };

  const canSave = form.name.trim().length > 0;

  return (
    <>
    <InfoSheet
      visible={!!infoSheet}
      title={infoSheet?.title ?? ''}
      body={infoSheet?.body ?? ''}
      onDismiss={() => setInfoSheet(null)}
    />
    <ModalShell visible={visible} onClose={onClose} backdropColor="rgba(0,0,0,0.5)">
      <ModalCard maxHeight={height * 0.92}>

            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-border">
              <Text className="text-2xl font-serif font-bold text-foreground">{isEditing ? 'Edit Kiln' : 'Add Kiln'}</Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView className="px-6 pt-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <AddKilnModalForm
                form={form}
                setForm={setForm}
                openHelp={openHelp}
                onToggleHelp={toggleHelp}
                showAdvancedTiming={showAdvancedTiming}
                onToggleAdvancedTiming={() => setShowAdvancedTiming((current) => !current)}
                onChooseKilnImageSource={handleChooseKilnImageSource}
                onRemoveKilnImage={handleRemoveKilnImage}
                currencySymbol={currencySymbol}
                palette={{
                  border: colors.border,
                  foreground: colors.foreground,
                  background: colors.background,
                  mutedForeground: colors.mutedForeground,
                }}
              />
            </ScrollView>

            <View className="px-6 pb-8 pt-3 border-t border-border">
              <Button onPress={handleSave} disabled={!canSave} className="w-full">
                <Text className="font-semibold">{isEditing ? 'Save Changes' : 'Add Kiln'}</Text>
              </Button>
            </View>
      </ModalCard>
    </ModalShell>
    </>
  );
}
