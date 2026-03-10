import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store';
import React from 'react';
import type { ScrollView as ScrollViewType } from 'react-native';
import { Alert } from 'react-native';
import { nextStage } from '../constants';
import { ActiveFilters, EMPTY_FILTERS, SortKey, countActiveFilters } from '../FilterSortSheet';
import { STAGE_ICONS, resolveStageIcon } from '../stageIconUtils';
import type { DisplayItem, GridRow, Piece } from '../types';

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
  const advanceBatch = useAppStore((s) => s.advanceBatch);
  const sendToCemetery = useAppStore((s) => s.sendToCemetery);

  const [activeStage, setActiveStage] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);
  const [editPiece, setEditPiece] = React.useState<Piece | undefined>(undefined);
  const [journalPiece, setJournalPiece] = React.useState<Piece | null>(null);
  const [actionSheetPiece, setActionSheetPiece] = React.useState<Piece | null>(null);
  const [expandedBatches, setExpandedBatches] = React.useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = React.useState<SortKey>('newest');
  const [filters, setFilters] = React.useState<ActiveFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const scrollRef = React.useRef<ScrollViewType>(null);

  const activeFilterCount = countActiveFilters(filters);

  const { enabledStages } = useStageConfig();
  const stageTabs = React.useMemo(() => [
    { id: 'all', label: 'All', Icon: STAGE_ICONS.all },
    ...enabledStages.map(s => ({ id: s.id, label: s.label, Icon: resolveStageIcon(s) })),
  ], [enabledStages]);

  React.useEffect(() => {
    if (activeStage !== 'all' && !enabledStages.some(s => s.id === activeStage)) {
      setActiveStage('all');
    }
  }, [enabledStages, activeStage]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeStage]);

  const filteredPieces = React.useMemo(() => {
    const result = pieces.filter(p =>
      (activeStage === 'all' || p.stage === activeStage) &&
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

  const gridRows = React.useMemo((): GridRow[] => {
    const rows: GridRow[] = [];
    let pending: Piece | null = null;
    const flush = () => {
      if (pending) { rows.push({ type: 'pair', items: [pending] }); pending = null; }
    };
    for (const item of displayItems) {
      if (item.type === 'batch') {
        flush();
        rows.push({ type: 'batch', batchId: item.batchId, pieces: item.pieces });
      } else if (item.type === 'set-header') {
        flush();
        rows.push(item);
      } else {
        if (pending) { rows.push({ type: 'pair', items: [pending, item.piece] }); pending = null; }
        else pending = item.piece;
      }
    }
    flush();
    return rows;
  }, [displayItems]);

  const handleAdd = (newPieces: Piece[]) => {
    addPieces(newPieces);
    setAddOpen(false);
  };

  const handleEditPiece = React.useCallback((updated: Piece) => {
    updatePiece(updated);
    setEditPiece(undefined);
  }, [updatePiece]);

  const handleDelete = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    Alert.alert(
      'Delete Piece?',
      `"${piece.name}" will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePiece(pieceId) },
      ]
    );
  }, [pieces, deletePiece]);

  const handleDuplicate = React.useCallback((piece: Piece) => {
    duplicatePiece(piece);
  }, [duplicatePiece]);

  const handleDuplicateBatch = React.useCallback((batchId: string) => {
    duplicateBatch(batchId);
  }, [duplicateBatch]);

  const handleUpdateJournalEntry = React.useCallback(
    (pieceId: number, entryIndex: number, patch: { notes?: string; photo?: string }) => {
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
    setExpandedBatches(prev => {
      const next = new Set(prev);
      next.has(batchId) ? next.delete(batchId) : next.add(batchId);
      return next;
    });
  }, []);

  const handleAdvanceBatch = React.useCallback((batchId: string, stage: string) => {
    advanceBatch(batchId, stage);
  }, [advanceBatch]);

  const handleAdvance = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    if (piece.batchId) {
      const batchMates = pieces.filter(
        p => p.batchId === piece.batchId && p.stage === piece.stage && nextStage(p.stage)
      );
      if (batchMates.length > 1) {
        Alert.alert(
          'Advance Piece',
          `Move just "${piece.name}", or all ${batchMates.length} pieces at this stage in the batch?`,
          [
            { text: 'Just this one', onPress: () => advancePiece(pieceId) },
            { text: `All ${batchMates.length} in batch`, onPress: () => advancePieceIds(batchMates.map(p => p.id)) },
          ]
        );
        return;
      }
    }

    advancePiece(pieceId);
  }, [pieces, advancePiece, advancePieceIds]);

  const handleSendToCemetery = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    Alert.alert(
      'Send to Cemetery?',
      `"${piece.name}" will be laid to rest. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rest in clay 🪦', style: 'destructive', onPress: () => sendToCemetery(pieceId) },
      ]
    );
  }, [pieces, sendToCemetery]);

  return {
    pieces,
    filteredPieces,
    gridRows,
    stageTabs,
    activeFilterCount,
    activeStage, setActiveStage,
    search, setSearch,
    addOpen, setAddOpen,
    editPiece, setEditPiece,
    journalPiece, setJournalPiece,
    actionSheetPiece, setActionSheetPiece,
    sortKey, setSortKey,
    filters, setFilters,
    filtersOpen, setFiltersOpen,
    scrollRef,
    handleAdd,
    handleEditPiece,
    handleDelete,
    handleDuplicate,
    handleDuplicateBatch,
    handleUpdateJournalEntry,
    toggleExpand,
    handleAdvanceBatch,
    handleAdvance,
    handleSendToCemetery,
  };
}
