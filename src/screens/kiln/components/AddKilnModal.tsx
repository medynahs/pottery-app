// src/screens/kiln/AddKilnModal.tsx
import {
  InfoSheet,
  ModalCard,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { useAppStore } from '@/src/store';
import React from 'react';
import { ScrollView } from 'react-native';
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
  const sheetHeight = useModalSheetHeight();
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
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
            <ModalSheetHeader>
              <Text className="text-2xl font-serif font-bold text-foreground">{isEditing ? 'Edit Kiln' : 'Add Kiln'}</Text>
            </ModalSheetHeader>

            <ScrollView
              className="px-6 pt-4"
              style={{ flex: 1, minHeight: 0 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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

            <ModalSheetFooter>
              <Button onPress={handleSave} disabled={!canSave} className="w-full">
                <Text className="font-semibold">{isEditing ? 'Save Changes' : 'Add Kiln'}</Text>
              </Button>
            </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
    </>
  );
}
