import { useCommunityComposer } from '@/src/hooks/useCommunityComposer';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { isGlazeOutcome } from '@/src/screens/glazes/glazePieceLink';
import { apiSetPieceVisibility } from '@/src/services/pieces';
import { useAppStore, useVisiblePieces } from '@/src/store';
import { schedulePiecePhotoSync } from '@/src/utils/pieceAssetSync';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import type { ScrollView as ScrollViewType } from 'react-native';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import type { DisplayItem, Piece, PiecePhoto, PieceVisibility } from '../../../types/pieces';
import type { StageAdvanceCelebration } from '../modals/StageAdvanceCelebrationModal';
import type { StageAdvanceCapture, StageAdvanceRequest } from '../modals/StageAdvanceFlowModal';
import { ActiveFilters, EMPTY_FILTERS, SortKey, countActiveFilters, pieceMatchesFilters } from '../utils/pieceFilterUtils';
import { pieceMatchesSearch } from '../utils/pieceSearch';
import { buildPieceSharePreset } from '../utils/sharePieceToCommunity';
import { CEMETERY_STAGE_ID, FINISHED_STAGE_ID, getAdvanceOrder, getConfiguredNextStage, isExpectedStageAdvance } from '../utils/stageFlow';
import { STAGE_ICONS, resolveStageIcon } from '../utils/stageIconUtils';
import { schedulePiecesSync, usePiecesSyncStatus } from './usePiecesSync';

function getSetName(name: string) {
  return name.replace(/\s+\d+$/, '');
}

export function usePiecesScreen() {
  const pieces = useVisiblePieces();
  const addPieces = useAppStore((s) => s.addPieces);
  const updatePiece = useAppStore((s) => s.updatePiece);
  const deletePiece = useAppStore((s) => s.deletePiece);
  const duplicatePiece = useAppStore((s) => s.duplicatePiece);
  const duplicateBatch = useAppStore((s) => s.duplicateBatch);
  const updateJournalEntry = useAppStore((s) => s.updateJournalEntry);
  const advancePiecesToStage = useAppStore((s) => s.advancePiecesToStage);
  const showToast = useAppStore((s) => s.showToast);
  const sendToCemetery = useAppStore((s) => s.sendToCemetery);
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const defaultBisqueTemp = useAppStore((s) => s.defaultBisqueTemp);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const shareToCommunity = useCommunityComposer();

  // ── Backend sync ────────────────────────────────────────────────────────────
  const { isSyncing, refetchPieces } = usePiecesSyncStatus();

  const [activeStage, setActiveStage] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);
  const [editPiece, setEditPiece] = React.useState<Piece | undefined>(undefined);
  const [journalPiece, setJournalPiece] = React.useState<Piece | null>(null);
  const [actionSheetPiece, setActionSheetPiece] = React.useState<Piece | null>(null);
  const [cemeteryPiece, setCemeteryPiece] = React.useState<Piece | null>(null);
  const [expandedBatches, setExpandedBatches] = React.useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = React.useState<SortKey>('newest');
  const [filters, setFilters] = React.useState<ActiveFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [advanceRequest, setAdvanceRequest] = React.useState<StageAdvanceRequest | null>(null);
  const scrollRef = React.useRef<ScrollViewType>(null);

  // Lifted out of Alert.alert, screen renders ConfirmSheet / PickSheet for these
  const [pendingDeletePieceId, setPendingDeletePieceId] = React.useState<number | null>(null);
  const [pendingAdvanceChoice, setPendingAdvanceChoice] = React.useState<{
    pieceName: string;
    batchCount: number;
    onSingle: () => void;
    onAll: () => void;
  } | null>(null);

  const activeFilterCount = countActiveFilters(filters);

  const { enabledStages, stages } = useStageConfig();
  const stageTabs = React.useMemo(() => [
    { id: 'all', label: 'Active', Icon: STAGE_ICONS.all },
    ...enabledStages.map(s => ({ id: s.id, label: s.label, Icon: resolveStageIcon(s) })),
  ], [enabledStages]);

  const stageLookup = React.useMemo(() => {
    const lookup: Record<string, { label: string; Icon: LucideIcon }> = {
      all: { label: 'Active', Icon: STAGE_ICONS.all as LucideIcon },
    };

    for (const stage of stages) {
      lookup[stage.id] = {
        label: stage.label,
        Icon: resolveStageIcon(stage) as LucideIcon,
      };
    }

    return lookup;
  }, [stages]);

  const progressStageOrder = React.useMemo(() => getAdvanceOrder(stages), [stages]);

  const getNextStageId = React.useCallback(
    (stageId: string) => getConfiguredNextStage(stageId, stages),
    [stages]
  );

  React.useEffect(() => {
    if (activeStage !== 'all' && !activeStage.includes(',') && !enabledStages.some(s => s.id === activeStage)) {
      setActiveStage('all');
    }
  }, [enabledStages, activeStage]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeStage]);

  React.useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const filteredPieces = React.useMemo(() => {
    const stageIds = activeStage.includes(',') ? activeStage.split(',') : null;
    const result = pieces.filter(p =>
      (stageIds
        ? stageIds.includes(p.stage)
        : activeStage === 'all'
          ? p.stage !== CEMETERY_STAGE_ID
          : p.stage === activeStage) &&
      pieceMatchesSearch(p, search) &&
      pieceMatchesFilters(p, filters)
    );
    switch (sortKey) {
      case 'oldest':
        return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'name-asc':
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return result.sort((a, b) => b.name.localeCompare(a.name));
      case 'updated':
        return result.sort((a, b) => {
          const aTs = a.timeline[a.timeline.length - 1]?.timestamp ?? a.createdAt;
          const bTs = b.timeline[b.timeline.length - 1]?.timestamp ?? b.createdAt;
          return new Date(bTs).getTime() - new Date(aTs).getTime();
        });
      default:
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [pieces, activeStage, search, filters, sortKey]);

  const displayItems = React.useMemo((): DisplayItem[] => {
    const result: DisplayItem[] = [];
    const processedGroups = new Set<string>();
    const emittedHeaders = new Set<string>();

    for (const piece of filteredPieces) {
      if (!piece.batchId) {
        result.push({ type: 'single', piece });
        continue;
      }
      const groupKey = `${piece.batchId}::${piece.stage}`;
      if (processedGroups.has(groupKey)) continue;
      processedGroups.add(groupKey);

      const group = filteredPieces.filter(
        p => p.batchId === piece.batchId && p.stage === piece.stage
      );

      if (group.length > 1 && !expandedBatches.has(piece.batchId)) {
        result.push({ type: 'batch', pieces: group, batchId: piece.batchId });
      } else if (group.length > 1 && expandedBatches.has(piece.batchId)) {
        if (!emittedHeaders.has(piece.batchId)) {
          emittedHeaders.add(piece.batchId);
          const allInBatch = filteredPieces.filter(p => p.batchId === piece.batchId);
          result.push({
            type: 'set-header',
            batchId: piece.batchId,
            name: getSetName(piece.name),
            count: allInBatch.length,
          });
        }
        for (const p of group) result.push({ type: 'single', piece: p });
      } else {
        result.push({ type: 'single', piece: group[0] });
      }
    }
    return result;
  }, [filteredPieces, expandedBatches]);

  const handleAdd = (newPieces: Piece[]) => {
    addPieces(newPieces);
    setAddOpen(false);
    schedulePiecesSync();
    for (const piece of newPieces) {
      schedulePiecePhotoSync(piece.id);
    }
  };

  const handleUpdatePiece = React.useCallback((updated: Piece) => {
    updatePiece(updated);
    setJournalPiece((current) => (current?.id === updated.id ? updated : current));
    setActionSheetPiece((current) => (current?.id === updated.id ? updated : current));
    schedulePiecesSync();
    schedulePiecePhotoSync(updated.id);
  }, [updatePiece]);

  const handleEditPiece = React.useCallback((updated: Piece) => {
    handleUpdatePiece(updated);
    setEditPiece(undefined);
  }, [handleUpdatePiece]);

  const handleDelete = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    setPendingDeletePieceId(pieceId);
  }, [pieces]);

  const confirmDeletePiece = React.useCallback(() => {
    if (pendingDeletePieceId == null) return;
    deletePiece(pendingDeletePieceId);
    schedulePiecesSync();
    setPendingDeletePieceId(null);
  }, [pendingDeletePieceId, deletePiece]);

  const clearPendingDelete = React.useCallback(() => setPendingDeletePieceId(null), []);

  const handleDuplicate = React.useCallback((piece: Piece) => {
    duplicatePiece(piece);
    schedulePiecesSync();
  }, [duplicatePiece]);

  const handleDuplicateBatch = React.useCallback((batchId: string) => {
    duplicateBatch(batchId);
    schedulePiecesSync();
  }, [duplicateBatch]);

  const handleUpdateJournalEntry = React.useCallback(
    (pieceId: number, entryIndex: number, patch: { notes?: string; photos?: PiecePhoto[] }) => {
      updateJournalEntry(pieceId, entryIndex, patch);
      setJournalPiece(prev =>
        prev?.id === pieceId
          ? {
              ...prev,
              timeline: prev.timeline.map((entry, i) =>
                i === entryIndex ? { ...entry, ...patch } : entry
              ),
            }
          : prev
      );
      schedulePiecesSync();
      schedulePiecePhotoSync(pieceId);
    },
    [updateJournalEntry]
  );

  const toggleExpand = React.useCallback((batchId: string) => {
    LayoutAnimation.configureNext({
      duration: 380,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });

    setExpandedBatches(prev => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  }, []);

  const handleAdvanceBatch = React.useCallback((batchPiecesAtStage: Piece[]) => {
    const representative = batchPiecesAtStage[0];
    if (!representative) return;

    const toStage = getNextStageId(representative.stage);
    if (!toStage) return;

    setAdvanceRequest({
      pieceIds: batchPiecesAtStage.map((piece) => piece.id),
      fromStage: representative.stage,
      toStage,
      pieceName: getSetName(representative.name),
      count: batchPiecesAtStage.length,
      isBatch: true,
    });
  }, [getNextStageId]);

  const handleAdvance = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const toStage = getNextStageId(piece.stage);
    if (!toStage) return;

    const queueSingle = () => {
      setAdvanceRequest({
        pieceIds: [piece.id],
        fromStage: piece.stage,
        toStage,
        pieceName: piece.name,
        count: 1,
        isBatch: false,
      });
    };

    if (piece.batchId) {
      const batchMates = pieces.filter(
        p => p.batchId === piece.batchId && p.stage === piece.stage && !!getNextStageId(p.stage)
      );

      if (batchMates.length > 1) {
        const onSingle = queueSingle;
        const onAll = () => {
          setAdvanceRequest({
            pieceIds: batchMates.map((p) => p.id),
            fromStage: piece.stage,
            toStage,
            pieceName: getSetName(piece.name),
            count: batchMates.length,
            isBatch: true,
          });
        };
        setPendingAdvanceChoice({
          pieceName: piece.name,
          batchCount: batchMates.length,
          onSingle,
          onAll,
        });
        return;
      }
    }

    queueSingle();
  }, [pieces, getNextStageId]);

  const dismissAdvanceRequest = React.useCallback(() => {
    setAdvanceRequest(null);
  }, []);

  const commitAdvanceRequest = React.useCallback((
    capture: StageAdvanceCapture,
    onAdvanced?: (transition: StageAdvanceCelebration) => void,
  ) => {
    if (!advanceRequest) return;

    const { fromStage, toStage, pieceIds } = advanceRequest;

    if (!isExpectedStageAdvance(fromStage, toStage, stages)) {
      showToast('This stage transition is no longer available. Refresh and try again.', 'error');
      setAdvanceRequest(null);
      return;
    }

    const notes = capture.notes?.trim();
    const entryPatch = {
      notes: notes || undefined,
      photos: capture.photo ? [{ uri: capture.photo }] : undefined,
      bisqueTemp: toStage === 'bisque' && capture.bisqueTemp ? capture.bisqueTemp : undefined,
      glazeTemp: toStage === 'glaze-fired' && capture.glazeTemp ? capture.glazeTemp : undefined,
      status: toStage === FINISHED_STAGE_ID && capture.status ? capture.status : undefined,
    };
    const hasEntryPatch = Object.values(entryPatch).some((value) => value != null && value !== '');

    const metadataPatch: Partial<Pick<Piece, 'bisqueTemp' | 'glazeTemp' | 'status' | 'glazeOutcome' | 'soldPrice'>> = {};
    if (toStage === 'bisque' && capture.bisqueTemp) metadataPatch.bisqueTemp = capture.bisqueTemp;
    if (toStage === 'glaze-fired' && capture.glazeTemp) metadataPatch.glazeTemp = capture.glazeTemp;
    if (toStage === FINISHED_STAGE_ID && capture.status) metadataPatch.status = capture.status;
    if (
      (toStage === 'glaze-fired' || toStage === FINISHED_STAGE_ID)
      && capture.glazeOutcome
      && isGlazeOutcome(capture.glazeOutcome)
    ) {
      metadataPatch.glazeOutcome = capture.glazeOutcome;
    }
    if (
      toStage === FINISHED_STAGE_ID
      && capture.status?.toLowerCase() === 'sold'
      && capture.soldPrice != null
      && !Number.isNaN(capture.soldPrice)
    ) {
      metadataPatch.soldPrice = capture.soldPrice;
    }
    const hasMetadataPatch = Object.keys(metadataPatch).length > 0;

    const advancedCount = advancePiecesToStage({
      pieceIds,
      fromStage,
      toStage,
      entryPatch: hasEntryPatch ? entryPatch : undefined,
      metadataPatch: hasMetadataPatch ? metadataPatch : undefined,
    });

    if (advancedCount === 0) {
      showToast('Could not advance, the piece may have already moved stages.', 'error');
      setAdvanceRequest(null);
      return;
    }

    schedulePiecesSync();

    for (const pieceId of pieceIds) {
      schedulePiecePhotoSync(pieceId);
    }

    onAdvanced?.({
      fromStage,
      toStage,
      pieceName: advanceRequest.pieceName,
      count: advancedCount,
      isBatch: advanceRequest.isBatch,
    });

    setAdvanceRequest(null);
  }, [advanceRequest, stages, advancePiecesToStage, showToast]);

  const skipAdvanceRequest = React.useCallback((onAdvanced?: (transition: StageAdvanceCelebration) => void) => {
    commitAdvanceRequest({}, onAdvanced);
  }, [commitAdvanceRequest]);

  const handleSendToCemetery = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    setCemeteryPiece(piece);
  }, [pieces]);

  const handleConfirmSendToCemetery = React.useCallback((
    pieceId: number,
    memorial: { epitaph?: string; causeOfDeath?: string }
  ) => {
    sendToCemetery(pieceId, memorial);
    schedulePiecesSync();
    setCemeteryPiece((current) => (current?.id === pieceId ? null : current));
  }, [sendToCemetery]);

  const handleSharePiece = React.useCallback((piece: Piece) => {
    if (!isSignedIn) return;
    shareToCommunity(buildPieceSharePreset(piece));
  }, [isSignedIn, shareToCommunity]);

  const handleSetPieceVisibility = React.useCallback(async (piece: Piece, visibility: PieceVisibility) => {
    // Visibility is server-authoritative (the backend reconciles storage buckets), so it
    // goes straight through the endpoint, not the offline sync. Reflect it locally after.
    if (!piece.backendId || piece.visibility === visibility) return;
    try {
      await apiSetPieceVisibility(piece.backendId, visibility);
      updatePiece({ ...piece, visibility });
      showToast(`Piece is now ${visibility}`, 'success');
    } catch {
      showToast('Could not update visibility. Try again.', 'error');
    }
  }, [updatePiece, showToast]);

  return {
    pieces,
    filteredPieces,
    displayItems,
    isSyncing,
    refetchPieces,
    stageTabs,
    stageLookup,
    progressStageOrder,
    getNextStageId,
    defaultBisqueTemp,
    defaultGlazeTemp,
    activeFilterCount,
    activeStage, setActiveStage,
    search, setSearch,
    addOpen, setAddOpen,
    editPiece, setEditPiece,
    journalPiece, setJournalPiece,
    actionSheetPiece, setActionSheetPiece,
    cemeteryPiece, setCemeteryPiece,
    sortKey, setSortKey,
    filters, setFilters,
    filtersOpen, setFiltersOpen,
    scrollRef,
    handleAdd,
    handleUpdatePiece,
    handleEditPiece,
    handleDelete,
    confirmDeletePiece,
    clearPendingDelete,
    pendingDeletePieceId,
    pendingAdvanceChoice,
    setPendingAdvanceChoice,
    handleDuplicate,
    handleDuplicateBatch,
    handleUpdateJournalEntry,
    toggleExpand,
    advanceRequest,
    handleAdvanceBatch,
    handleAdvance,
    dismissAdvanceRequest,
    commitAdvanceRequest,
    skipAdvanceRequest,
    handleSendToCemetery,
    handleConfirmSendToCemetery,
    handleSharePiece,
    handleSetPieceVisibility,
    };
}
