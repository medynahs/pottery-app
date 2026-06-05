// src/screens/kiln/FiringDetailModal.tsx
import { ConfirmSheet, ModalCard, ModalShell } from '@/src/components/AppSheets';
import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Trash2, X } from 'lucide-react-native';
import React from 'react';
import { Image, Modal, ScrollView, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { Firing, FiringResult } from '../../../types/kiln';
import type { Piece } from '../../../types/pieces';
import { FIRING_TYPE_LABELS } from '../constants';
import {
    useDeleteFiringMutation,
    useUpdateFiringMutation,
} from '../hooks/useFiringsSync';
import { FiringDetailContent } from './FiringDetailContent';

interface FiringDetailModalProps {
  firing: Firing | null;
  visible: boolean;
  onClose: () => void;
}

export function FiringDetailModal({ firing, visible, onClose }: FiringDetailModalProps) {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const kilns = useAppStore((state) => state.kilns);
  const pieces = useAppStore((state) => state.pieces);
  const currencySymbol = useAppStore((state) => state.pricingSettings.currencySymbol);
  const assignPiecesToFiring = useAppStore((state) => state.assignPiecesToFiring);
  const completeFiring = useAppStore((state) => state.completeFiring);
  const deleteFiring = useAppStore((state) => state.deleteFiring);
  const updateFiring = useAppStore((state) => state.updateFiring);
  const deleteFiringMutation = useDeleteFiringMutation();
  const updateFiringMutation = useUpdateFiringMutation();

  const liveFiring = useAppStore((state) => state.firings.find((currentFiring) => currentFiring.id === firing?.id));

  const [resultNotes, setResultNotes] = React.useState('');
  const [selectedResult, setSelectedResult] = React.useState<FiringResult>('success');
  const [showCompletionForm, setShowCompletionForm] = React.useState(false);
  const [showPiecePicker, setShowPiecePicker] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [firingCeremonyVisible, setFiringCeremonyVisible] = React.useState(false);
  const [firingCeremonyName, setFiringCeremonyName] = React.useState('');
  const [piecePhotoPreview, setPiecePhotoPreview] = React.useState<{ uri: string; name: string } | null>(null);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    setResultNotes('');
    setSelectedResult('success');
    setShowCompletionForm(false);
    setShowPiecePicker(false);
  }, [visible]);

  const handlePreviewPieceImage = (piece: Piece) => {
    const uri = piece.photo ?? piece.imgUrl;
    if (!uri) return;
    setPiecePhotoPreview({ uri, name: piece.name });
  };

  const handleOpenPieceJournal = (piece: Piece) => {
    onClose();
    router.push({
      pathname: '/(tabs)/pieces',
      params: { openJournalPieceId: String(piece.id) },
    });
  };

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
  const isCompleted = liveFiring.state === 'completed';

  const handleComplete = () => {
    completeFiring(liveFiring.id, selectedResult, resultNotes);
    const now = new Date().toISOString();
    updateFiringMutation.mutate({
      ...liveFiring,
      state: 'completed',
      completedAt: now,
      notes: liveFiring.notes,
      result: selectedResult,
      resultNotes,
    });
    setShowCompletionForm(false);
    if (selectedResult === 'success') {
      setFiringCeremonyName(liveFiring.name);
      setFiringCeremonyVisible(true);
    }
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const toggleAssignPiece = (pieceId: number) => {
    if (assignedPieceIdSet.has(pieceId)) {
      const next = { ...liveFiring, pieceIds: liveFiring.pieceIds.filter((id) => id !== pieceId) };
      updateFiring(next);
      updateFiringMutation.mutate(next);
      return;
    }

    assignPiecesToFiring(liveFiring.id, [pieceId]);
    updateFiringMutation.mutate({
      ...liveFiring,
      pieceIds: Array.from(new Set([...liveFiring.pieceIds, pieceId])),
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
      onConfirm={() => {
        deleteFiring(liveFiring.id);
        deleteFiringMutation.mutate(liveFiring);
        setConfirmDeleteOpen(false);
        onClose();
      }}
      onCancel={() => setConfirmDeleteOpen(false)}
    />
    <CeremonyOverlay
      visible={firingCeremonyVisible}
      emoji="🔥"
      title="Firing complete!"
      subtitle={firingCeremonyName ? `"${firingCeremonyName}" came out beautifully.` : 'The kiln delivered.'}
      footnote="Pieces advanced from the firing."
      tint="rgba(211, 120, 60, 1)"
      durationMs={3000}
      onDismiss={() => { setFiringCeremonyVisible(false); onClose(); }}
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
              onPreviewPieceImage={handlePreviewPieceImage}
              onOpenPieceJournal={handleOpenPieceJournal}
              onTogglePiecePicker={() => setShowPiecePicker((current) => !current)}
              onToggleAssignPiece={toggleAssignPiece}
              showCompletionForm={showCompletionForm}
              selectedResult={selectedResult}
              onSelectResult={setSelectedResult}
              resultNotes={resultNotes}
              onChangeResultNotes={setResultNotes}
              onCancelCompletion={() => setShowCompletionForm(false)}
              onComplete={handleComplete}
              onMarkPickedUp={() => setShowCompletionForm(true)}
            />
          </ScrollView>


      </ModalCard>
    </ModalShell>

    <Modal
      visible={piecePhotoPreview !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setPiecePhotoPreview(null)}
    >
      <View className="flex-1 justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
        <Pressable
          onPress={() => setPiecePhotoPreview(null)}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View className="mx-5 rounded-2xl overflow-hidden bg-card border border-border">
          {piecePhotoPreview ? (
            <Image
              source={{ uri: piecePhotoPreview.uri }}
              style={{ width: '100%', height: 340 }}
              resizeMode="cover"
            />
          ) : null}
          <View className="px-4 py-3 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {piecePhotoPreview?.name ?? 'Piece'}
            </Text>
            <TouchableOpacity
              onPress={() => setPiecePhotoPreview(null)}
              className="px-3 py-1.5 rounded-lg border border-border bg-background"
            >
              <Text className="text-xs font-semibold text-muted-foreground">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}
