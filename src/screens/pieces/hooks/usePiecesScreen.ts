import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import type { ScrollView as ScrollViewType } from 'react-native';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import type { DisplayItem, Piece } from '../../../types/pieces';
import { ActiveFilters, EMPTY_FILTERS, SortKey, countActiveFilters } from '../components/FilterSortSheet';
import type { StageAdvanceCelebration } from '../modals/StageAdvanceCelebrationModal';
import type { StageAdvanceCapture, StageAdvanceRequest } from '../modals/StageAdvanceFlowModal';
import { FINISHED_STAGE_ID, getAdvanceOrder, getConfiguredNextStage } from '../utils/stageFlow';
import { STAGE_ICONS, resolveStageIcon } from '../utils/stageIconUtils';
import { useCreatePieceMutation, useDeletePieceMutation, usePiecesSync, useUpdatePieceMutation } from './usePiecesSync';

function getSetName(name: string) {
  return name.replace(/\s+\d+$/, '');
}

export function usePiecesScreen() {
  const pieces = useAppStore((s) => s.pieces);
  const addPieces = useAppStore((s) => s.addPieces);
  const updatePiece = useAppStore((s) => s.updatePiece);
  const deletePiece = useAppStore((s) => s.deletePiece);
  const duplicatePiece = useAppStore((s) => s.duplicatePiece);
  const duplicateBatch = useAppStore((s) => s.duplicateBatch);
  const updateJournalEntry = useAppStore((s) => s.updateJournalEntry);
  const advancePiece = useAppStore((s) => s.advancePiece);
  const advancePieceIds = useAppStore((s) => s.advancePieceIds);
  const sendToCemetery = useAppStore((s) => s.sendToCemetery);
  const defaultBisqueTemp = useAppStore((s) => s.defaultBisqueTemp);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);

  // ── Backend sync ────────────────────────────────────────────────────────────
  const syncQuery = usePiecesSync();
  const { mutate: createPiece } = useCreatePieceMutation();
  const { mutate: syncPieceUpdate } = useUpdatePieceMutation();
  const { mutate: deletePieceRemote } = useDeletePieceMutation();

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

  // Lifted out of Alert.alert — screen renders ConfirmSheet / PickSheet for these
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
    { id: 'all', label: 'All', Icon: STAGE_ICONS.all },
    ...enabledStages.map(s => ({ id: s.id, label: s.label, Icon: resolveStageIcon(s) })),
  ], [enabledStages]);

  const stageLookup = React.useMemo(() => {
    const lookup: Record<string, { label: string; Icon: LucideIcon }> = {
      all: { label: 'All', Icon: STAGE_ICONS.all as LucideIcon },
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
      (stageIds ? stageIds.includes(p.stage) : (activeStage === 'all' || p.stage === activeStage)) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase())) &&
      (filters.clays.length === 0 || filters.clays.includes(p.clay)) &&
      (filters.forms.length === 0 || (!!p.form && filters.forms.includes(p.form))) &&
      (filters.formingMethods.length === 0 || (!!p.formingMethod && filters.formingMethods.includes(p.formingMethod))) &&
      (filters.statuses.length === 0 || (!!p.status && filters.statuses.includes(p.status))) &&
      (filters.firingTypes.length === 0 || (!!p.firingType && filters.firingTypes.includes(p.firingType)))
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
    // Persist each new piece to the backend (fire-and-forget; backendId stamped on success)
    for (const localPiece of newPieces) {
      createPiece({ localPiece });
    }
  };

  const handleUpdatePiece = React.useCallback((updated: Piece) => {
    updatePiece(updated);
    setJournalPiece((current) => (current?.id === updated.id ? updated : current));
    setActionSheetPiece((current) => (current?.id === updated.id ? updated : current));
    setEditPiece((current) => (current?.id === updated.id ? updated : current));
    // Sync name/description/status changes to the backend if the piece is already registered
    if (updated.backendId) {
      syncPieceUpdate(updated);
    }
  }, [updatePiece, syncPieceUpdate]);

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
    const piece = pieces.find(p => p.id === pendingDeletePieceId);
    deletePiece(pendingDeletePieceId);
    if (piece) deletePieceRemote(piece);
    setPendingDeletePieceId(null);
  }, [pendingDeletePieceId, deletePiece, deletePieceRemote, pieces]);

  const clearPendingDelete = React.useCallback(() => setPendingDeletePieceId(null), []);

  const handleDuplicate = React.useCallback((piece: Piece) => {
    duplicatePiece(piece);
  }, [duplicatePiece]);

  const handleDuplicateBatch = React.useCallback((batchId: string) => {
    duplicateBatch(batchId);
  }, [duplicateBatch]);

  const handleUpdateJournalEntry = React.useCallback(
    (pieceId: number, entryIndex: number, patch: { notes?: string; photos?: string[] }) => {
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

    const targetPieces = advanceRequest.pieceIds
      .map((id) => pieces.find((piece) => piece.id === id))
      .filter((piece): piece is Piece => !!piece);

    if (targetPieces.length === 0) {
      setAdvanceRequest(null);
      return;
    }

    const notes = capture.notes?.trim();
    const journalPatch = {
      notes: notes || undefined,
      photos: capture.photo ? [capture.photo] : undefined,
    };
    const hasJournalPatch = !!journalPatch.notes || !!journalPatch.photos;

    const bisqueTemp = advanceRequest.toStage === 'bisque' ? capture.bisqueTemp : undefined;
    const glazeTemp = advanceRequest.toStage === 'glaze-fired' ? capture.glazeTemp : undefined;
    const status = advanceRequest.toStage === FINISHED_STAGE_ID ? capture.status : undefined;

    targetPieces.forEach((piece) => {
      if (!bisqueTemp && !glazeTemp && !status) return;

      updatePiece({
        ...piece,
        bisqueTemp: bisqueTemp || piece.bisqueTemp,
        glazeTemp: glazeTemp || piece.glazeTemp,
        status: status || piece.status,
      });
    });

    if (targetPieces.length === 1) {
      advancePiece(targetPieces[0].id);
    } else {
      advancePieceIds(targetPieces.map((piece) => piece.id));
    }

    if (hasJournalPatch) {
      targetPieces.forEach((piece) => {
        updateJournalEntry(piece.id, piece.timeline.length, journalPatch);
      });
    }

    onAdvanced?.({
      fromStage: advanceRequest.fromStage,
      toStage: advanceRequest.toStage,
      pieceName: advanceRequest.pieceName,
      count: advanceRequest.count,
      isBatch: advanceRequest.isBatch,
    });

    setAdvanceRequest(null);
  }, [advanceRequest, pieces, updatePiece, advancePiece, advancePieceIds, updateJournalEntry]);

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
    setCemeteryPiece((current) => (current?.id === pieceId ? null : current));
  }, [sendToCemetery]);

  return {
    pieces,
    filteredPieces,
    displayItems,
    isSyncing: syncQuery.isFetching,
    refetchPieces: syncQuery.refetch,
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
  };
}
