// src/screens/kiln/FiringDetailModal.tsx
import { ConfirmSheet, ModalCard, ModalShell } from '@/src/components/AppSheets';
import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { ImageLightbox } from '@/src/components/ImageLightbox';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { useCommunityComposer } from '@/src/hooks/useCommunityComposer';
import { useVisiblePieces, useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Trash2, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { Firing, FiringResult, FiringStatusOverride } from '../../../types/kiln';
import type { GlazeOutcome, Piece } from '../../../types/pieces';
import { FIRING_SOURCE_STAGE, FIRING_TYPE_LABELS } from '../constants';
import { buildFiringCostBreakdown } from '../firingEstimations';
import {
  useDeleteFiringMutation,
  useUpdateFiringMutation,
} from '../hooks/useFiringsSync';
import { getFiringDisplayDate } from '../utils/kilnHelpers';
import { KILN_UI } from '../utils/kilnTheme';
import { FiringDetailContent } from './FiringDetailContent';
import { FiringOutcomeBadge } from './FiringOutcomeBadge';

interface FiringDetailModalProps {
  firing: Firing | null;
  visible: boolean;
  onClose: () => void;
}

export function FiringDetailModal({ firing, visible, onClose }: FiringDetailModalProps) {
  const router = useRouter();
  const { height } = useWindowDimensions();

  const kilns = useAppStore((state) => state.kilns);
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const pieces = useVisiblePieces();
  const shareToCommunity = useCommunityComposer();
  const showToast = useAppStore((state) => state.showToast);
  const hasCreatedPost = useAppStore((state) => state.hasCreatedPost);
  const kilnShareHintShown = useAppStore((state) => state.communityKilnShareHintShown);
  const markKilnShareHintShown = useAppStore((state) => state.markCommunityKilnShareHintShown);
  const currencySymbol = useAppStore((state) => state.pricingSettings.currencySymbol);
  const assignPiecesToFiring = useAppStore((state) => state.assignPiecesToFiring);
  const setCompletedFiringPieces = useAppStore((state) => state.setCompletedFiringPieces);
  const setFiringStatusOverride = useAppStore((state) => state.setFiringStatusOverride);
  const completeFiring = useAppStore((state) => state.completeFiring);
  const deleteFiring = useAppStore((state) => state.deleteFiring);
  const updateFiring = useAppStore((state) => state.updateFiring);
  const deleteFiringMutation = useDeleteFiringMutation();
  const updateFiringMutation = useUpdateFiringMutation();

  const liveFiring = useAppStore((state) =>
    state.firings.find((currentFiring) => currentFiring.id === firing?.id),
  );

  const [resultNotes, setResultNotes] = React.useState('');
  const [selectedResult, setSelectedResult] = React.useState<FiringResult>('success');
  const [selectedGlazeOutcome, setSelectedGlazeOutcome] = React.useState<GlazeOutcome | ''>('');
  const [showCompletionForm, setShowCompletionForm] = React.useState(false);
  const [showPiecePicker, setShowPiecePicker] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [firingCeremonyVisible, setFiringCeremonyVisible] = React.useState(false);
  const [firingCeremonyName, setFiringCeremonyName] = React.useState('');
  const [lightbox, setLightbox] = React.useState<{ uri: string; caption?: string } | null>(null);

  React.useEffect(() => {
    if (!visible) return;
    setResultNotes('');
    setSelectedResult('success');
    setSelectedGlazeOutcome('');
    setShowCompletionForm(false);
    setShowPiecePicker(false);
  }, [visible]);

  const handlePreviewPieceImage = (piece: Piece) => {
    const uri = piece.photo ?? piece.imgUrl;
    if (!uri) return;
    setLightbox({ uri, caption: piece.name });
  };

  const handlePreviewFiringPhoto = () => {
    const uri = liveFiring?.photoUri;
    if (!uri) return;
    setLightbox({ uri, caption: liveFiring?.name });
  };

  const handleOpenPieceJournal = (piece: Piece) => {
    onClose();
    requestAnimationFrame(() => {
      router.push({
        pathname: '/(tabs)/pieces',
        params: {
          openJournalPieceId: String(piece.id),
          openJournalNonce: String(Date.now()),
        },
      });
    });
  };

  const assignedPieceIdSet = React.useMemo(
    () => new Set(liveFiring?.pieceIds ?? []),
    [liveFiring?.pieceIds],
  );
  const assignedPieces = React.useMemo(
    () => pieces.filter((piece) => assignedPieceIdSet.has(piece.id)),
    [assignedPieceIdSet, pieces],
  );
  const sourceStage = liveFiring ? FIRING_SOURCE_STAGE[liveFiring.type] : undefined;
  const eligiblePieces = React.useMemo(() => {
    if (!liveFiring || !sourceStage) return [];
    return pieces.filter(
      (piece) =>
        piece.stage !== 'cemetery'
        && (assignedPieceIdSet.has(piece.id) || piece.stage === sourceStage),
    );
  }, [assignedPieceIdSet, liveFiring, pieces, sourceStage]);
  const unassignedPieces = React.useMemo(
    () => pieces.filter((piece) => !assignedPieceIdSet.has(piece.id) && piece.stage !== 'cemetery'),
    [assignedPieceIdSet, pieces],
  );
  const glazeReadyPieces = React.useMemo(
    () => unassignedPieces.filter((piece) => (piece.stage ?? '').trim().toLowerCase() === 'glazing'),
    [unassignedPieces],
  );
  const pieceRows = React.useMemo(() => {
    if (!showPiecePicker) return assignedPieces;
    if (liveFiring?.state === 'completed') {
      return eligiblePieces;
    }
    const unassigned =
      firing?.type === 'glaze'
        ? [...glazeReadyPieces, ...unassignedPieces.filter((p) => (p.stage ?? '').trim().toLowerCase() !== 'glazing')]
        : unassignedPieces;
    return [...assignedPieces, ...unassigned];
  }, [
    assignedPieces,
    eligiblePieces,
    firing?.type,
    glazeReadyPieces,
    liveFiring?.state,
    showPiecePicker,
    unassignedPieces,
  ]);

  const linkedGlazePieces = React.useMemo(
    () => assignedPieces.filter((piece) => piece.glazeId),
    [assignedPieces],
  );

  const kiln = kilns.find((currentKiln) => currentKiln.id === liveFiring?.kilnId);
  const isCompleted = liveFiring?.state === 'completed';

  const costBreakdown = React.useMemo(
    () => buildFiringCostBreakdown({ kiln, pieces: assignedPieces }),
    [assignedPieces, kiln],
  );

  const receiptSurvivedByPieceId = React.useMemo(() => {
    const map = new Map<number, boolean | undefined>();
    for (const receipt of liveFiring?.pieceReceipts ?? []) {
      const piece = pieces.find(
        (candidate) => (candidate.backendId ?? String(candidate.id)) === receipt.pieceBackendId,
      );
      if (piece) map.set(piece.id, receipt.survived);
    }
    return map;
  }, [liveFiring?.pieceReceipts, pieces]);

  const syncFiringMutation = React.useCallback(
    (nextFiring: Firing) => {
      updateFiring(nextFiring);
      updateFiringMutation.mutate(nextFiring);
    },
    [updateFiring, updateFiringMutation],
  );

  const persistStatusOverride = React.useCallback(
    (override: FiringStatusOverride | undefined) => {
      if (!liveFiring) return;
      setFiringStatusOverride(liveFiring.id, override);
      const updated = useAppStore.getState().firings.find((f) => f.id === liveFiring.id);
      if (updated) syncFiringMutation(updated);
    },
    [liveFiring, setFiringStatusOverride, syncFiringMutation],
  );

  const handleSelectResult = React.useCallback((result: FiringResult) => {
    setSelectedResult(result);
    if (result === 'success') {
      setSelectedGlazeOutcome('success');
    }
  }, []);

  const handleShareFiring = React.useCallback(() => {
    if (!isSignedIn || !liveFiring) return;
    shareToCommunity({
      kind: 'kiln_firing',
      firingId: liveFiring.id,
      firingName: liveFiring.name,
      firingType: liveFiring.type,
      cone: liveFiring.cone,
      pieceIds: liveFiring.pieceIds,
      caption: liveFiring.resultNotes ?? '',
    });
  }, [liveFiring, shareToCommunity]);

  if (!firing || !liveFiring) return null;

  const handleComplete = () => {
    const glazeOutcome =
      liveFiring.type === 'glaze' && selectedGlazeOutcome
        ? selectedGlazeOutcome
        : undefined;
    completeFiring(liveFiring.id, selectedResult, resultNotes, glazeOutcome);
    const now = new Date().toISOString();
    const updated = useAppStore.getState().firings.find((f) => f.id === liveFiring.id);
    if (updated) {
      updateFiringMutation.mutate({
        ...updated,
        state: 'completed',
        completedAt: now,
        notes: liveFiring.notes,
        result: selectedResult,
        resultNotes,
      });
    }
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
    if (isCompleted) {
      const nextIds = assignedPieceIdSet.has(pieceId)
        ? liveFiring.pieceIds.filter((id) => id !== pieceId)
        : [...liveFiring.pieceIds, pieceId];
      setCompletedFiringPieces(liveFiring.id, nextIds);
      const updated = useAppStore.getState().firings.find((f) => f.id === liveFiring.id);
      if (updated) syncFiringMutation(updated);
      return;
    }

    if (assignedPieceIdSet.has(pieceId)) {
      const next = { ...liveFiring, pieceIds: liveFiring.pieceIds.filter((id) => id !== pieceId) };
      syncFiringMutation(next);
      return;
    }

    assignPiecesToFiring(liveFiring.id, [pieceId]);
    syncFiringMutation({
      ...liveFiring,
      pieceIds: Array.from(new Set([...liveFiring.pieceIds, pieceId])),
    });
  };

  const assignAllGlazeReady = () => {
    if (glazeReadyPieces.length === 0) return;
    const ids = glazeReadyPieces.map((piece) => piece.id);
    if (isCompleted) {
      setCompletedFiringPieces(
        liveFiring.id,
        Array.from(new Set([...liveFiring.pieceIds, ...ids])),
      );
      const updated = useAppStore.getState().firings.find((f) => f.id === liveFiring.id);
      if (updated) syncFiringMutation(updated);
      return;
    }
    assignPiecesToFiring(liveFiring.id, ids);
    syncFiringMutation({
      ...liveFiring,
      pieceIds: Array.from(new Set([...liveFiring.pieceIds, ...ids])),
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
      onDismiss={() => {
        setFiringCeremonyVisible(false);
        if (isSignedIn && !hasCreatedPost && !kilnShareHintShown) {
          markKilnShareHintShown();
          showToast('Share this firing to the community — tap the button below', 'success');
        }
        onClose();
      }}
    />
    <ModalShell
      visible={visible}
      onClose={onClose}
      backdropColor="rgba(0,0,0,0.5)"
      overlay={
        lightbox ? (
          <ImageLightbox
            embedded
            visible
            uri={lightbox.uri}
            caption={lightbox.caption}
            onClose={() => setLightbox(null)}
          />
        ) : null
      }
    >
      <ModalCard maxHeight={height * 0.95}>
        <View
          className="px-6 pt-5 pb-4 border-b"
          style={{ borderColor: KILN_UI.warmBorder, backgroundColor: KILN_UI.warmBg }}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-4">
              <Text
                className="text-2xl text-foreground"
                style={{ fontFamily: 'Fraunces_700Bold' }}
                numberOfLines={2}
              >
                {liveFiring.name}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1.5">
                {getFiringDisplayDate(liveFiring)}
                {' · '}
                {FIRING_TYPE_LABELS[liveFiring.type]}
              </Text>
              {liveFiring.result ? (
                <View className="mt-2 self-start">
                  <FiringOutcomeBadge result={liveFiring.result} compact />
                </View>
              ) : null}
            </View>
            <View className="flex-row gap-1 items-center">
              {!isCompleted ? (
                <TouchableOpacity onPress={handleDelete} className="p-2" hitSlop={8}>
                  <Trash2 size={16} color={KILN_UI.brownMuted} />
                </TouchableOpacity>
              ) : null}
              <Pressable onPress={onClose} className="p-2">
                <X size={20} color={KILN_UI.brownMuted} />
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView
          className="px-6 pt-4"
          style={{ backgroundColor: KILN_UI.cream }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FiringDetailContent
            liveFiring={liveFiring}
            kiln={kiln}
            currencySymbol={currencySymbol}
            palette={{
              muted: KILN_UI.warmBg,
              mutedForeground: KILN_UI.brownMuted,
              border: KILN_UI.warmBorder,
              foreground: KILN_UI.brown,
              background: KILN_UI.cream,
            }}
            isCompleted={isCompleted}
            assignedPiecesCount={assignedPieces.length}
            pieceRows={pieceRows}
            assignedPieceIdSet={assignedPieceIdSet}
            costLineItems={costBreakdown.lineItems}
            receiptSurvivedByPieceId={receiptSurvivedByPieceId}
            showPiecePicker={showPiecePicker}
            onPreviewFiringPhoto={liveFiring.photoUri ? handlePreviewFiringPhoto : undefined}
            onPreviewPieceImage={handlePreviewPieceImage}
            onOpenPieceJournal={handleOpenPieceJournal}
            onTogglePiecePicker={() => setShowPiecePicker((current) => !current)}
            onToggleAssignPiece={toggleAssignPiece}
            showCompletionForm={showCompletionForm}
            selectedResult={selectedResult}
            onSelectResult={handleSelectResult}
            resultNotes={resultNotes}
            onChangeResultNotes={setResultNotes}
            onCancelCompletion={() => setShowCompletionForm(false)}
            onComplete={handleComplete}
            onMarkPickedUp={() => {
              setSelectedGlazeOutcome('success');
              setShowCompletionForm(true);
            }}
            onSetStatusOverride={(override) => persistStatusOverride(override)}
            onClearStatusOverride={() => persistStatusOverride(undefined)}
            isGlazeFiring={liveFiring.type === 'glaze'}
            linkedGlazePieceCount={linkedGlazePieces.length}
            selectedGlazeOutcome={selectedGlazeOutcome}
            onSelectGlazeOutcome={(outcome) =>
              setSelectedGlazeOutcome(outcome as GlazeOutcome | '')
            }
            glazeReadyPieces={glazeReadyPieces}
            onAssignAllGlazeReady={assignAllGlazeReady}
            onShareToCommunity={isCompleted && isSignedIn ? handleShareFiring : undefined}
          />
        </ScrollView>
      </ModalCard>
    </ModalShell>
    </>
  );
}
