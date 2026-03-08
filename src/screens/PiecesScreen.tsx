// src/screens/PiecesScreen.tsx
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { Layers, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import type { ScrollView as ScrollViewType } from 'react-native';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { AddPieceModal } from './pieces/AddPieceModal';
import { BatchCard } from './pieces/BatchCard';
import { CemeteryBanner } from './pieces/CemeteryBanner';
import { INITIAL_PIECES, STAGES, nextStage } from './pieces/constants';
import { ActiveFilters, EMPTY_FILTERS, FilterSortSheet, SortKey, countActiveFilters } from './pieces/FilterSortSheet';
import { PieceActionSheet } from './pieces/PieceActionSheet';
import { PieceCard } from './pieces/PieceCard';
import { PieceJournalModal } from './pieces/PieceJournalModal';
import type { Piece } from './pieces/types';

function getSetName(name: string) {
  return name.replace(/\s+\d+$/, '');
}

type DisplayItem =
  | { type: 'single'; piece: Piece }
  | { type: 'batch'; pieces: Piece[]; batchId: string }
  | { type: 'set-header'; batchId: string; name: string; count: number };

type GridRow =
  | { type: 'batch'; batchId: string; pieces: Piece[] }
  | { type: 'pair'; items: Piece[] }
  | { type: 'set-header'; batchId: string; name: string; count: number };

export default function PiecesScreen() {
  const [pieces, setPieces] = React.useState<Piece[]>(INITIAL_PIECES);
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

  // Collapse same-stage batch groups into BatchCards; expand individually on demand
  const displayItems = React.useMemo((): DisplayItem[] => {
    const result: DisplayItem[] = [];
    const processedGroups = new Set<string>(); // batchId::stage
    const emittedHeaders = new Set<string>();  // batchId

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
        // Collapsed batch card
        result.push({ type: 'batch', pieces: group, batchId: piece.batchId });
      } else if (group.length > 1 && expandedBatches.has(piece.batchId)) {
        // Expanded — emit a set-header once per batch, then individual pieces
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
        // Only 1 piece at this stage (batch diverged) — plain card
        result.push({ type: 'single', piece: group[0] });
      }
    }
    return result;
  }, [filteredPieces, expandedBatches]);

  // Build grid rows: batch/set-header = full width; singles pair into 2-col
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

  const handleAdd = (pieces: Piece[]) => {
    setPieces(prev => [...pieces, ...prev]);
    setAddOpen(false);
  };

  const handleEditPiece = React.useCallback((updated: Piece) => {
    setPieces(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditPiece(undefined);
  }, []);

  const handleDelete = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    Alert.alert(
      'Delete Piece?',
      `"${piece.name}" will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => setPieces(prev => prev.filter(p => p.id !== pieceId)) },
      ]
    );
  }, [pieces]);

  const handleDuplicate = React.useCallback((piece: Piece) => {
    const now = new Date().toISOString();
    setPieces(prev => [{
      ...piece,
      id: Date.now(),
      name: `${piece.name} (copy)`,
      createdAt: now,
      timeline: [{ stage: piece.stage, timestamp: now }],
      batchId: undefined,
      batchSize: undefined,
    }, ...prev]);
  }, []);

  const handleDuplicateBatch = React.useCallback((batchId: string) => {
    const batch = pieces.filter(p => p.batchId === batchId);
    if (!batch.length) return;
    const now = new Date().toISOString();
    const newBatchId = `batch-${Date.now()}`;
    setPieces(prev => [
      ...batch.map((p, i) => ({
        ...p,
        id: Date.now() + i + 1,
        createdAt: now,
        timeline: [{ stage: p.stage, timestamp: now }],
        batchId: newBatchId,
      })),
      ...prev,
    ]);
  }, [pieces]);

  const handleUpdateJournalEntry = React.useCallback(
    (pieceId: number, entryIndex: number, patch: { notes?: string; photo?: string }) => {
      setPieces(prev =>
        prev.map(p => {
          if (p.id !== pieceId) return p;
          const timeline = p.timeline.map((entry, i) =>
            i === entryIndex ? { ...entry, ...patch } : entry
          );
          return { ...p, timeline };
        })
      );
      // Keep journalPiece in sync so the modal reflects the save
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
    []
  );

  const toggleExpand = React.useCallback((batchId: string) => {
    setExpandedBatches(prev => {
      const next = new Set(prev);
      next.has(batchId) ? next.delete(batchId) : next.add(batchId);
      return next;
    });
  }, []);

  const handleAdvanceBatch = React.useCallback((batchId: string, stage: string) => {
    const timestamp = new Date().toISOString();
    setPieces(prev => prev.map(p => {
      if (p.batchId !== batchId || p.stage !== stage) return p;
      const next = nextStage(p.stage);
      if (!next) return p;
      return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
    }));
  }, []);

  const handleAdvance = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const doAdvanceSingle = () => {
      setPieces(prev => prev.map(p => {
        if (p.id !== pieceId) return p;
        const next = nextStage(p.stage);
        if (!next) return p;
        const timestamp = new Date().toISOString();
        return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
      }));
    };

    if (piece.batchId) {
      const batchMates = pieces.filter(
        p => p.batchId === piece.batchId && p.stage === piece.stage && nextStage(p.stage)
      );
      if (batchMates.length > 1) {
        Alert.alert(
          'Advance Piece',
          `Move just "${piece.name}", or all ${batchMates.length} pieces at this stage in the batch?`,
          [
            { text: 'Just this one', onPress: doAdvanceSingle },
            {
              text: `All ${batchMates.length} in batch`,
              onPress: () => {
                const ids = new Set(batchMates.map(p => p.id));
                setPieces(prev => prev.map(p => {
                  if (!ids.has(p.id)) return p;
                  const next = nextStage(p.stage);
                  if (!next) return p;
                  const timestamp = new Date().toISOString();
                  return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
                }));
              },
            },
          ]
        );
        return;
      }
    }

    doAdvanceSingle();
  }, [pieces]);

  const handleSendToCemetery = React.useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    Alert.alert(
      'Send to Cemetery?',
      `"${piece.name}" will be laid to rest. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rest in clay 🪦',
          style: 'destructive',
          onPress: () => {
            const timestamp = new Date().toISOString();
            setPieces(prev => prev.map(p =>
              p.id !== pieceId ? p : {
                ...p,
                stage: 'cemetery',
                timeline: [...p.timeline, { stage: 'cemetery', timestamp }],
              }
            ));
          },
        },
      ]
    );
  }, [pieces]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-20 pb-4 bg-background border-b border-border">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-serif font-bold text-foreground">My Pieces</Text>
          <TouchableOpacity
            className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-md"
            onPress={() => setAddOpen(true)}
          >
            <Plus size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="flex-1 relative justify-center">
            <View className="absolute left-4 z-10">
              <Search size={16} color="hsl(24 20% 40%)" />
            </View>
            <Input
              placeholder="Search pieces..."
              value={search}
              onChangeText={setSearch}
              className="pl-11 rounded-2xl bg-card border-border"
            />
          </View>
          <TouchableOpacity
            onPress={() => setFiltersOpen(true)}
            className={`w-11 h-11 rounded-2xl items-center justify-center border ${
              activeFilterCount > 0 ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'
            }`}
          >
            <SlidersHorizontal
              size={16}
              color={activeFilterCount > 0 ? 'hsl(15 50% 50%)' : 'hsl(24 20% 40%)'}
            />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary items-center justify-center">
                <Text className="text-[9px] font-bold text-primary-foreground">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stage Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-2 px-6 py-4"
        >
          {STAGES.map(({ id, label, Icon }) => {
            const isActive = activeStage === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveStage(id)}
                className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
                  isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                }`}
              >
                <Icon size={14} color={isActive ? 'hsl(34 35% 92%)' : 'hsl(24 20% 40%)'} />
                <Text className={`text-sm font-medium ${isActive ? 'text-background' : 'text-muted-foreground'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="px-6 pb-8">
          {activeStage === 'cemetery' && (
            <CemeteryBanner count={pieces.filter(p => p.stage === 'cemetery').length} />
          )}

          {gridRows.map((row, i) => {
            if (row.type === 'batch') {
              return (
                <BatchCard
                  key={`batch-${row.batchId}-${row.pieces[0].stage}`}
                  pieces={row.pieces}
                  onAdvanceAll={() => handleAdvanceBatch(row.batchId, row.pieces[0].stage)}
                  onExpand={() => toggleExpand(row.batchId)}
                />
              );
            }
            if (row.type === 'set-header') {
              return (
                <TouchableOpacity
                  key={`header-${row.batchId}`}
                  onPress={() => toggleExpand(row.batchId)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between py-2 mb-1"
                >
                  <View className="flex-row items-center gap-2">
                    <Layers size={12} color="hsl(24 20% 40%)" />
                    <Text className="text-xs font-body-medium text-muted-foreground">
                      {row.name} · Set of {row.count}
                    </Text>
                  </View>
                  <Text className="text-xs text-primary font-body-medium">Collapse ↑</Text>
                </TouchableOpacity>
              );
            }
            return (
              <View key={i} className="flex-row gap-4 mb-4">
                {row.items.map(piece => (
                  <PieceCard
                    key={piece.id}
                    piece={piece}
                    onAdvance={() => handleAdvance(piece.id)}
                    onSendToCemetery={piece.stage !== 'cemetery' ? () => handleSendToCemetery(piece.id) : undefined}
                    onJournal={() => setJournalPiece(piece)}
                    onMore={() => setActionSheetPiece(piece)}
                  />
                ))}
                {row.items.length === 1 && <View className="flex-1" />}
              </View>
            );
          })}

          {filteredPieces.length === 0 && (
            <View className="items-center py-16">
              <Text className="text-muted-foreground text-sm">No pieces found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AddPieceModal
        visible={addOpen || editPiece !== undefined}
        onClose={() => { setAddOpen(false); setEditPiece(undefined); }}
        onAdd={handleAdd}
        editPiece={editPiece}
        onEdit={handleEditPiece}
      />
      <PieceJournalModal
        piece={journalPiece}
        visible={journalPiece !== null}
        onClose={() => setJournalPiece(null)}
        onUpdateEntry={handleUpdateJournalEntry}
      />
      <PieceActionSheet
        piece={actionSheetPiece}
        visible={actionSheetPiece !== null}
        onClose={() => setActionSheetPiece(null)}
        onEdit={() => { setEditPiece(actionSheetPiece ?? undefined); setActionSheetPiece(null); }}
        onDuplicate={() => actionSheetPiece && handleDuplicate(actionSheetPiece)}
        onDuplicateBatch={actionSheetPiece?.batchId ? () => handleDuplicateBatch(actionSheetPiece!.batchId!) : undefined}
        onDelete={() => actionSheetPiece && handleDelete(actionSheetPiece.id)}
      />
      <FilterSortSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sortKey={sortKey}
        onSortChange={setSortKey}
        filters={filters}
        onFiltersChange={setFilters}
        allPieces={pieces}
      />
    </View>
  );
}

