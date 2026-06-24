// src/screens/kiln/AddKilnModal.tsx
import {
  InfoSheet,
  ModalCard,
  ModalFormScrollView,
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
import { useAppStore } from '@/src/store';
import React from 'react';
import type { Kiln } from '../../../types/kiln';
import { DEFAULT_KILN_MAX_TEMP_C, trimOrEmpty } from '../utils/kilnHelpers';
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

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    if (editKiln) {
      setForm({
        name: editKiln.name ?? '',
        imageUri: editKiln.imageUri ?? '',
        type: editKiln.type ?? 'electric',
        maxTempC: String(editKiln.maxTempC ?? DEFAULT_KILN_MAX_TEMP_C),
        coneRange: editKiln.coneRange ?? '',
        shelves: String(editKiln.shelves ?? 0),
        size: editKiln.size ?? '',
        location: editKiln.location ?? '',
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
        pricingBaseRate: editKiln.pricingBaseRate != null ? String(editKiln.pricingBaseRate) : '',
        notes: editKiln.notes ?? '',
        emergencyNotes: editKiln.emergencyNotes ?? '',
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

  const handleSave = () => {
    const maxTempC = parseInt(form.maxTempC ?? '', 10);
    if (!trimOrEmpty(form.name) || !maxTempC || maxTempC <= 0) return;

    const kiln: Kiln = {
      id: editKiln?.id ?? `kiln-${Date.now()}`,
      name: trimOrEmpty(form.name),
      imageUri: trimOrEmpty(form.imageUri) || undefined,
      type: form.type,
      maxTempC,
      coneRange: trimOrEmpty(form.coneRange),
      shelves: parseInt(form.shelves ?? '0', 10) || 0,
      size: trimOrEmpty(form.size),
      location: trimOrEmpty(form.location),
      queueDelayDays: parseFloat(form.queueDelayDays ?? '') || undefined,
      cycleDurationDays: parseFloat(form.cycleDurationDays ?? '') || undefined,
      pickupDelayDays: parseFloat(form.pickupDelayDays ?? '') || undefined,
      runsEveryDays: parseFloat(form.runsEveryDays ?? '') || undefined,
      pricingModel: form.pricingModel,
      pricingBaseRate: parseFloat(form.pricingBaseRate ?? '') || undefined,
      notes: trimOrEmpty(form.notes),
      emergencyNotes: trimOrEmpty(form.emergencyNotes),
      maintenanceLogs: editKiln?.maintenanceLogs ?? [],
      createdAt: editKiln?.createdAt ?? new Date().toISOString(),
    };

    onSave(kiln);
    onClose();
  };

  const canSave =
    trimOrEmpty(form.name).length > 0
    && parseInt(form.maxTempC ?? '', 10) > 0;

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

            <ModalFormScrollView
              className="px-6"
              style={{ flex: 1, minHeight: 0 }}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <AddKilnModalForm
                form={form}
                setForm={setForm}
                openHelp={openHelp}
                onToggleHelp={toggleHelp}
                showAdvancedTiming={showAdvancedTiming}
                onToggleAdvancedTiming={() => setShowAdvancedTiming((current) => !current)}
                currencySymbol={currencySymbol}
                palette={{
                  border: colors.border,
                  foreground: colors.foreground,
                  background: colors.background,
                  mutedForeground: colors.mutedForeground,
                }}
              />
            </ModalFormScrollView>

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
