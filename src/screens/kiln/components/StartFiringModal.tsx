// src/screens/kiln/StartFiringModal.tsx
import {
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
import { useVisiblePieces, useAppStore } from '@/src/store';
import React from 'react';
import {
    ScrollView,
    View
} from 'react-native';
import type { Firing } from '../../../types/kiln';
import { FIRING_SOURCE_STAGE, KILN_TYPE_LABELS } from '../constants';
import { estimateFiringCost, estimateReadyDateIso } from '../firingEstimations';
import type { StartFiringFormValues } from './StartFiringModalContent';
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

  const [form, setForm] = React.useState<StartFiringFormValues>(EMPTY_START_FIRING_FORM);
  const [selectedPieceIds, setSelectedPieceIds] = React.useState<Set<number>>(new Set());
  const [step, setStep] = React.useState<'setup' | 'confirm'>('setup');

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
        ...EMPTY_START_FIRING_FORM,
        submissionDate: new Date().toISOString().slice(0, 10),
        kilnId: defaultKilnId ?? kilns[0]?.id ?? '',
      });
      setSelectedPieceIds(new Set());
      setStep('setup');
    }
  }, [visible, defaultKilnId, kilns]);

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
    () => assignablePieces.filter((piece) => selectedPieceIds.has(piece.id)),
    [assignablePieces, selectedPieceIds]
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
  const canContinueToReview = form.name.trim().length > 0 && selectedPieceIds.size > 0 && hasKilnSelection;
  const canStart = canContinueToReview;

  const readyStage = FIRING_SOURCE_STAGE[form.type] ?? FIRING_SOURCE_STAGE.bisque;
  const assignedPieceIds = React.useMemo(() => {
    const next = new Set<number>();
    firings
      .filter((firing) => firing.state !== 'completed')
      .forEach((firing) => firing.pieceIds.forEach((pieceId) => next.add(pieceId)));
    return next;
  }, [firings]);

  const readyAssignablePieceIds = React.useMemo(
    () =>
      new Set(
        assignablePieces
          .filter((p) => p.stage === readyStage && !assignedPieceIds.has(p.id))
          .map((p) => p.id)
      ),
    [assignablePieces, readyStage, assignedPieceIds]
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

  const sortedAssignablePieces = React.useMemo(() => {
    return [...assignablePieces].sort((a, b) => {
      const aAssigned = assignedPieceIds.has(a.id);
      const bAssigned = assignedPieceIds.has(b.id);

      if (aAssigned !== bAssigned) {
        return aAssigned ? 1 : -1;
      }

      const aReady = a.stage === readyStage;
      const bReady = b.stage === readyStage;

      if (aReady !== bReady) {
        return aReady ? -1 : 1;
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [assignablePieces, assignedPieceIds, readyStage]);

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
              <Text className="text-2xl font-serif font-bold text-foreground">Start Firing</Text>
            </ModalSheetHeader>

            <ScrollView
              className="px-6 pt-4"
              style={{ flex: 1, minHeight: 0 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <StartFiringModalContent
                step={step}
                form={form}
                setForm={setForm}
                selectedPieceIds={selectedPieceIds}
                togglePiece={togglePiece}
                kilnOptions={kilnOptions}
                kilns={kilns}
                selectedKiln={selectedKiln}
                sortedAssignablePieces={sortedAssignablePieces}
                assignedPieceIds={assignedPieceIds}
                readyStage={readyStage}
                readyAssignablePieceIds={readyAssignablePieceIds}
                allReadySelected={allReadySelected}
                handleSelectAllReady={handleSelectAllReady}
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
            </ScrollView>

            <ModalSheetFooter>
              {step === 'setup' ? (
                <>
                  <Button
                    onPress={() => setStep('confirm')}
                    disabled={!canContinueToReview}
                    className="w-full"
                  >
                    <Text className="font-semibold">Review & Confirm</Text>
                  </Button>
                  {!canContinueToReview ? (
                    <Text className="text-xs text-muted-foreground mt-2 text-center">
                      Add a firing name, pick at least one piece, and select a kiln to continue.
                    </Text>
                  ) : null}
                </>
              ) : (
                <View className="flex-row gap-3">
                  <Button variant="outline" onPress={() => setStep('setup')} className="flex-1">
                    <Text className="font-semibold">Back to Setup</Text>
                  </Button>
                  <Button onPress={handleStart} disabled={!canStart} className="flex-1">
                    <Text className="font-semibold">Schedule Firing</Text>
                  </Button>
                </View>
              )}
            </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}

