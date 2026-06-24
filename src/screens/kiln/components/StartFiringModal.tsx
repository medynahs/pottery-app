// src/screens/kiln/StartFiringModal.tsx
import {
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
import { useVisiblePieces, useAppStore } from '@/src/store';
import React from 'react';
import {
    View
} from 'react-native';
import type { Firing } from '../../../types/kiln';
import { KILN_TYPE_LABELS } from '../constants';
import { estimateFiringCost, estimateReadyDateIso } from '../firingEstimations';
import {
  getReadyQueueEmptyMessage,
  getReadyQueuePieces,
} from '../utils/kilnQueue';
import { KilnEmergencyNotesCard } from './KilnMaintenanceSection';
import { isKilnChecklistComplete, PreFiringChecklist } from './PreFiringChecklist';
import type { StartFiringFormValues, StartFiringModalStep } from './StartFiringModalContent';
import {
    EMPTY_START_FIRING_FORM,
    StartFiringModalContent,
} from './StartFiringModalContent';

interface StartFiringModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (firing: Firing) => void;
  /** Pre-select kiln id */
  defaultKilnId?: string;
}

export function StartFiringModal({ visible, onClose, onStart, defaultKilnId }: StartFiringModalProps) {
  const sheetHeight = useModalSheetHeight();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const kilns = useAppStore((s) => s.kilns);
  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);
  const kilnChecklist = useAppStore((s) => s.kilnChecklist);
  const toggleKilnChecklistItem = useAppStore((s) => s.toggleKilnChecklistItem);
  const addKilnChecklistItem = useAppStore((s) => s.addKilnChecklistItem);
  const removeKilnChecklistItem = useAppStore((s) => s.removeKilnChecklistItem);
  const resetKilnChecklist = useAppStore((s) => s.resetKilnChecklist);

  const [form, setForm] = React.useState<StartFiringFormValues>(EMPTY_START_FIRING_FORM);
  const [selectedPieceIds, setSelectedPieceIds] = React.useState<Set<number>>(new Set());
  const [step, setStep] = React.useState<StartFiringModalStep>('setup');

  const kilnOptions = React.useMemo(
    () => kilns.map((k) => ({ value: k.id, label: `${k.name} (${KILN_TYPE_LABELS[k.type]})` })),
    [kilns]
  );

  const readyQueuePieces = React.useMemo(
    () => getReadyQueuePieces({ pieces, firingType: form.type, firings, sort: 'longest' }),
    [pieces, form.type, firings],
  );

  const readyQueueEmptyMessage = React.useMemo(
    () => getReadyQueueEmptyMessage(form.type),
    [form.type],
  );

  React.useEffect(() => {
    if (!visible) return;
    resetKilnChecklist();
    setForm({
      ...EMPTY_START_FIRING_FORM,
      submissionDate: new Date().toISOString().slice(0, 10),
      kilnId: defaultKilnId ?? kilns[0]?.id ?? '',
    });
    setSelectedPieceIds(new Set());
    setStep('setup');
  }, [visible, defaultKilnId, kilns, resetKilnChecklist]);

  React.useEffect(() => {
    setSelectedPieceIds((prev) => {
      const allowed = new Set(readyQueuePieces.map((piece) => piece.id));
      const next = new Set([...prev].filter((id) => allowed.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [form.type, readyQueuePieces]);

  const togglePiece = (id: number) => {
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedKiln = React.useMemo(
    () => kilns.find((kiln) => kiln.id === form.kilnId),
    [form.kilnId, kilns]
  );

  const selectedPieces = React.useMemo(
    () => readyQueuePieces.filter((piece) => selectedPieceIds.has(piece.id)),
    [readyQueuePieces, selectedPieceIds]
  );

  const handleStart = React.useCallback(() => {
    if (!form.name.trim()) return;

    const now = new Date().toISOString();
    const expectedReadyAt = estimateReadyDateIso({
      type: form.type,
      location: form.location,
      submissionDate: form.submissionDate,
      kiln: selectedKiln,
    });
    const { totalCost, costPerPiece } = estimateFiringCost({
      kiln: selectedKiln,
      pieces: selectedPieces,
    });

    const firing: Firing = {
      id: `firing-${Date.now()}`,
      kilnId: form.kilnId,
      name: form.name.trim(),
      type: form.type,
      location: form.location,
      cone: form.cone,
      state: 'scheduled',
      submissionDate: form.submissionDate,
      expectedReadyAt,
      estimatedTotalCost: totalCost ?? undefined,
      estimatedCostPerPiece: costPerPiece ?? undefined,
      pieceIds: Array.from(selectedPieceIds),
      clayBodiesUsed: form.clayBodiesUsed
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      glazeNotes: form.glazeNotes.trim() || undefined,
      notes: form.notes.trim(),
      createdAt: now,
    };
    onStart(firing);
    onClose();
  }, [form, onClose, onStart, selectedKiln, selectedPieceIds, selectedPieces]);

  const hasKilnSelection = kilns.length > 0 && form.kilnId.trim().length > 0;
  const setupComplete = form.name.trim().length > 0 && selectedPieceIds.size > 0 && hasKilnSelection;
  const checklistComplete = isKilnChecklistComplete(kilnChecklist);

  const readyAssignablePieceIds = React.useMemo(
    () => new Set(readyQueuePieces.map((piece) => piece.id)),
    [readyQueuePieces],
  );

  const allReadySelected =
    readyAssignablePieceIds.size > 0 &&
    [...readyAssignablePieceIds].every((id) => selectedPieceIds.has(id));

  const handleSelectAllReady = () => {
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      if (allReadySelected) {
        readyAssignablePieceIds.forEach((id) => next.delete(id));
      } else {
        readyAssignablePieceIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const expectedReadyAt = React.useMemo(
    () =>
      estimateReadyDateIso({
        type: form.type,
        location: form.location,
        submissionDate: form.submissionDate,
        kiln: selectedKiln,
      }),
    [form.location, form.submissionDate, form.type, selectedKiln]
  );

  const costEstimate = React.useMemo(
    () => estimateFiringCost({ kiln: selectedKiln, pieces: selectedPieces }),
    [selectedKiln, selectedPieces]
  );

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
            <ModalSheetHeader>
              <Text className="text-2xl font-serif font-bold text-foreground">Schedule a Firing</Text>
            </ModalSheetHeader>

            <ModalFormScrollView
              className="px-6"
              style={{ flex: 1, minHeight: 0 }}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {step === 'safety' ? (
                <View className="mb-6">
                  <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Step 2 of 3 · Pre-load safety
                  </Text>
                  <Text className="text-sm text-muted-foreground leading-5 mb-4">
                    Walk through this before loading{selectedKiln ? ` ${selectedKiln.name}` : ' the kiln'}. Custom steps you add are saved for next time.
                  </Text>
                  {selectedKiln?.emergencyNotes?.trim() ? (
                    <View className="mb-4">
                      <KilnEmergencyNotesCard notes={selectedKiln.emergencyNotes} />
                    </View>
                  ) : null}
                  <PreFiringChecklist
                    items={kilnChecklist}
                    onToggle={toggleKilnChecklistItem}
                    onAdd={addKilnChecklistItem}
                    onRemove={removeKilnChecklistItem}
                  />
                </View>
              ) : (
                <StartFiringModalContent
                  step={step === 'setup' ? 'setup' : 'confirm'}
                  form={form}
                  setForm={setForm}
                  selectedPieceIds={selectedPieceIds}
                  togglePiece={togglePiece}
                  kilnOptions={kilnOptions}
                  kilns={kilns}
                  selectedKiln={selectedKiln}
                  sortedAssignablePieces={readyQueuePieces}
                  readyAssignablePieceIds={readyAssignablePieceIds}
                  allReadySelected={allReadySelected}
                  handleSelectAllReady={handleSelectAllReady}
                  readyQueueEmptyMessage={readyQueueEmptyMessage}
                  selectedPieces={selectedPieces}
                  costEstimate={costEstimate}
                  expectedReadyAt={expectedReadyAt}
                  currencySymbol={currencySymbol}
                  palette={{
                    primary: colors.primary,
                    border: colors.border,
                    foreground: colors.foreground,
                    background: colors.background,
                    mutedForeground: colors.mutedForeground,
                  }}
                />
              )}
            </ModalFormScrollView>

            <ModalSheetFooter>
              {step === 'setup' ? (
                <>
                  <Button
                    onPress={() => setStep('safety')}
                    disabled={!setupComplete}
                    className="w-full"
                  >
                    <Text className="font-semibold">Continue to safety check</Text>
                  </Button>
                  {!setupComplete ? (
                    <Text className="text-xs text-muted-foreground mt-2 text-center">
                      Add a firing name, pick at least one piece, and select a kiln to continue.
                    </Text>
                  ) : null}
                </>
              ) : step === 'safety' ? (
                <>
                  <View className="flex-row gap-3">
                    <Button variant="outline" onPress={() => setStep('setup')} className="flex-1">
                      <Text className="font-semibold">Back</Text>
                    </Button>
                    <Button
                      onPress={() => setStep('confirm')}
                      disabled={!checklistComplete}
                      className="flex-1"
                    >
                      <Text className="font-semibold">Review schedule</Text>
                    </Button>
                  </View>
                  {!checklistComplete ? (
                    <Text className="text-xs text-muted-foreground mt-2 text-center">
                      Complete every checklist item before continuing.
                    </Text>
                  ) : null}
                </>
              ) : (
                <View className="flex-row gap-3">
                  <Button variant="outline" onPress={() => setStep('safety')} className="flex-1">
                    <Text className="font-semibold">Back</Text>
                  </Button>
                  <Button onPress={handleStart} disabled={!setupComplete} className="flex-1">
                    <Text className="font-semibold">Schedule Firing</Text>
                  </Button>
                </View>
              )}
            </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
