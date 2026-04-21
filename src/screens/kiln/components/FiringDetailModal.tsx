// src/screens/kiln/FiringDetailModal.tsx
import { ConfirmSheet, ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Button } from '@/src/components/ui/button';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import { ChevronRight, Trash2, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { Firing, FiringResult } from '../../../types/kiln';
import { FIRING_STATE_LABELS, FIRING_TYPE_LABELS, nextFiringState } from '../constants';
import { formatReadyDate, getExpectedReadyAt } from '../firingEstimations';
import { FiringDetailContent } from './FiringDetailContent';

interface FiringDetailModalProps {
  firing: Firing | null;
  visible: boolean;
  onClose: () => void;
}

export function FiringDetailModal({ firing, visible, onClose }: FiringDetailModalProps) {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const kilns = useAppStore((state) => state.kilns);
  const pieces = useAppStore((state) => state.pieces);
  const currencySymbol = useAppStore((state) => state.pricingSettings.currencySymbol);
  const updateFiringState = useAppStore((state) => state.updateFiringState);
  const assignPiecesToFiring = useAppStore((state) => state.assignPiecesToFiring);
  const completeFiring = useAppStore((state) => state.completeFiring);
  const deleteFiring = useAppStore((state) => state.deleteFiring);
  const updateFiring = useAppStore((state) => state.updateFiring);

  const liveFiring = useAppStore((state) => state.firings.find((currentFiring) => currentFiring.id === firing?.id));

  const [resultNotes, setResultNotes] = React.useState('');
  const [selectedResult, setSelectedResult] = React.useState<FiringResult>('success');
  const [showCompletionForm, setShowCompletionForm] = React.useState(false);
  const [showPiecePicker, setShowPiecePicker] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    setResultNotes('');
    setSelectedResult('success');
    setShowCompletionForm(false);
    setShowPiecePicker(false);
  }, [visible]);

  const assignedPieceIdSet = React.useMemo(() => new Set(liveFiring?.pieceIds ?? []), [liveFiring?.pieceIds]);
  const assignedPieces = React.useMemo(
    () => pieces.filter((piece) => assignedPieceIdSet.has(piece.id)),
    [assignedPieceIdSet, pieces]
  );
  const unassignedPieces = React.useMemo(
    () => pieces.filter((piece) => !assignedPieceIdSet.has(piece.id) && piece.stage !== 'cemetery'),
    [assignedPieceIdSet, pieces]
  );
  const pieceRows = React.useMemo(
    () => (showPiecePicker ? [...assignedPieces, ...unassignedPieces] : assignedPieces),
    [assignedPieces, showPiecePicker, unassignedPieces]
  );

  if (!firing || !liveFiring) return null;

  const kiln = kilns.find((currentKiln) => currentKiln.id === liveFiring.kilnId);
  const next = nextFiringState(liveFiring.state);
  const isCompleted = liveFiring.state === 'completed';
  const expectedReadyAt = getExpectedReadyAt(liveFiring, kiln);
  const formattedExpectedReady = formatReadyDate(expectedReadyAt);

  const handleAdvanceState = () => {
    if (!next) return;

    if (next === 'completed') {
      setShowCompletionForm(true);
      return;
    }

    updateFiringState(liveFiring.id, next);
  };

  const handleComplete = () => {
    completeFiring(liveFiring.id, selectedResult, resultNotes);
    setShowCompletionForm(false);
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const toggleAssignPiece = (pieceId: number) => {
    if (assignedPieceIdSet.has(pieceId)) {
      updateFiring({ ...liveFiring, pieceIds: liveFiring.pieceIds.filter((id) => id !== pieceId) });
      return;
    }

    assignPiecesToFiring(liveFiring.id, [pieceId]);
  };

  const handleStatusOverride = (override: 'fired' | 'ready' | 'picked-up') => {
    const now = new Date().toISOString();

    if (override === 'fired') {
      updateFiring({
        ...liveFiring,
        state: 'firing',
        startedAt: liveFiring.startedAt ?? now,
        statusOverride: 'fired',
      });
      return;
    }

    if (override === 'ready') {
      updateFiring({
        ...liveFiring,
        state: 'unloading',
        statusOverride: 'ready',
      });
      return;
    }

    updateFiring({
      ...liveFiring,
      state: 'completed',
      completedAt: now,
      statusOverride: 'picked-up',
      result: liveFiring.result ?? 'success',
      resultNotes: liveFiring.resultNotes ?? 'Marked as picked up',
    });
  };

  return (
    <>
    <ConfirmSheet
      visible={confirmDeleteOpen}
      title="Delete Firing?"
      body={`Delete "${liveFiring.name}"? This cannot be undone.`}
      confirmLabel="Delete"
      destructive
      onConfirm={() => { deleteFiring(liveFiring.id); setConfirmDeleteOpen(false); onClose(); }}
      onCancel={() => setConfirmDeleteOpen(false)}
    />
    <ModalShell visible={visible} onClose={onClose} backdropColor="rgba(0,0,0,0.5)">
      <ModalCard maxHeight={height * 0.95}>

          <View className="flex-row justify-between items-start px-6 pb-4 border-b border-border">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-serif font-bold text-foreground" numberOfLines={1}>
                {liveFiring.name}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                {FIRING_TYPE_LABELS[liveFiring.type]} · Cone {liveFiring.cone}
              </Text>
            </View>
            <View className="flex-row gap-2 items-center">
              {!isCompleted ? (
                <TouchableOpacity onPress={handleDelete} className="p-2">
                  <Trash2 size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              ) : null}
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <FiringDetailContent
              liveFiring={liveFiring}
              kiln={kiln}
              formattedExpectedReady={formattedExpectedReady}
              currencySymbol={currencySymbol}
              palette={{
                muted: colors.muted,
                mutedForeground: colors.mutedForeground,
                border: colors.border,
                foreground: colors.foreground,
                background: colors.background,
              }}
              isCompleted={isCompleted}
              assignedPiecesCount={assignedPieces.length}
              pieceRows={pieceRows}
              assignedPieceIdSet={assignedPieceIdSet}
              showPiecePicker={showPiecePicker}
              onTogglePiecePicker={() => setShowPiecePicker((current) => !current)}
              onToggleAssignPiece={toggleAssignPiece}
              showCompletionForm={showCompletionForm}
              selectedResult={selectedResult}
              onSelectResult={setSelectedResult}
              resultNotes={resultNotes}
              onChangeResultNotes={setResultNotes}
              onCancelCompletion={() => setShowCompletionForm(false)}
              onComplete={handleComplete}
              onStatusOverride={handleStatusOverride}
            />
          </ScrollView>

          {!isCompleted && !showCompletionForm && next ? (
            <View className="px-6 pb-8 pt-3 border-t border-border">
              <Button onPress={handleAdvanceState} className="w-full">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold text-primary-foreground">Advance to {FIRING_STATE_LABELS[next]}</Text>
                  <ChevronRight size={16} color="white" />
                </View>
              </Button>
            </View>
          ) : null}
      </ModalCard>
    </ModalShell>
    </>
  );
}
