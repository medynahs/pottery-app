// src/screens/PiecesScreen.tsx
import { ConfirmSheet, PickSheet, type PickSheetOption } from '@/src/components/AppSheets';
import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { EmptyState } from '@/src/components/EmptyState';
import { SearchField } from '@/src/components/SearchField';
import { StudioTabScreen } from '@/src/components/StudioTabScreen';
import { Text } from '@/src/components/ui/text';
import { TAB_SCROLL_BOTTOM_PADDING } from '@/src/constants/tabScreenLayout';
import { formatGlazeDisplayName } from '@/src/screens/glazes/glazeVersionUtils';
import { useAppStore } from '@/src/store';
import { countPiecePhotos } from '@/src/utils/premiumGate';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BookOpen, CheckSquare, ChevronUp, Copy, Edit3, Globe, Images, Layers, Lock, Plus, Share2, SlidersHorizontal, Tag, Trash2, Users } from 'lucide-react-native';
import React from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { MainTabHeader } from '../../components/MainTabHeader';
import type { Piece, PieceVisibility } from '../../types/pieces';
import {
  CEMETERY_ACCENT,
  CEMETERY_BORDER_SUBTLE,
  CEMETERY_PILL_ACTIVE,
  CEMETERY_PILL_ACTIVE_BORDER,
  CEMETERY_PILL_INACTIVE_BG,
  CEMETERY_TEXT,
  CEMETERY_TEXT_SUBTLE
} from './cemeteryTheme';
import { BatchCard } from './components/BatchCard';
import {
  CemeteryGardenEmpty,
  CemeteryGardenView,
  useCemeteryHeadstoneWidth,
} from './components/CemeteryGardenView';
import { CemeteryPieceCard } from './components/CemeteryPieceCard';
import { CemeteryScrollAtmosphere } from './components/CemeteryScrollAtmosphere';
import { FilterSortSheet } from './components/FilterSortSheet';
import { PieceCard } from './components/PieceCard';
import { PieceSelectionBar } from './components/PieceSelectionBar';
import { usePiecesScreen } from './hooks/usePiecesScreen';
import { useLazyPieceAssetsHydration } from './hooks/useLazyPieceAssetsHydration';
import { AddPieceModal } from './modals/AddPieceModal';
import { CemeterySacrificeModal } from './modals/CemeterySacrificeModal';
import { PieceJournalModal } from './modals/PieceJournalModal';
import { PiecePhotoGalleryModal } from './modals/PiecePhotoGalleryModal';
import { PieceStatusSheet } from './modals/PieceStatusSheet';
import { StageAdvanceCelebrationModal, type StageAdvanceCelebration } from './modals/StageAdvanceCelebrationModal';
import { StageAdvanceFlowModal } from './modals/StageAdvanceFlowModal';
import { STAGE_LABEL } from './utils/constants';
import { collectPiecePhotos } from './utils/piecePhotos';

const VISIBILITY_LABEL: Record<PieceVisibility, string> = {
  private: 'Private',
  friends: 'Friends',
  public: 'Public',
};

const itemLayout = LinearTransition
  .duration(420)
  .easing(Easing.inOut(Easing.cubic));

export default function PiecesScreen() {
  useLazyPieceAssetsHydration();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cemeteryColumns = screenWidth >= 430 ? 3 : 2;
  const cemeteryHeadstoneWidth = useCemeteryHeadstoneWidth(screenWidth, cemeteryColumns);
  const cemeteryColumnStyle = cemeteryColumns === 3
    ? { width: '31.5%' as const, marginBottom: 12 }
    : { width: '48%' as const, marginBottom: 12 };
  const params = useLocalSearchParams<{
    openJournalPieceId?: string | string[];
    openJournalStage?: string | string[];
    openJournalNonce?: string | string[];
    stage?: string | string[];
  }>();
  const handledOpenJournalIdRef = React.useRef<string | null>(null);
  const [journalOpenOptions, setJournalOpenOptions] = React.useState<{
    initialStage?: string;
  }>({});
  const [stageTransition, setStageTransition] = React.useState<StageAdvanceCelebration | null>(null);
  const [firstPieceCeremony, setFirstPieceCeremony] = React.useState(false);
  const [batchActionPieces, setBatchActionPieces] = React.useState<Piece[] | null>(null);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedPieceIds, setSelectedPieceIds] = React.useState<Set<number>>(() => new Set());
  const [galleryPiece, setGalleryPiece] = React.useState<Piece | null>(null);
  const [statusSheetPiece, setStatusSheetPiece] = React.useState<Piece | null>(null);
  const [visibilitySheetPiece, setVisibilitySheetPiece] = React.useState<Piece | null>(null);
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const seenCeremonies = useAppStore((s) => s.seenCeremonies);
  const glazes = useAppStore((s) => s.glazes);
  const piecesCompactCards = useAppStore((s) => s.piecesCompactCards);
  const markCeremonyAsSeen = useAppStore((s) => s.markCeremonyAsSeen);

  const {
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
  } = usePiecesScreen();

  const exitSelectionMode = React.useCallback(() => {
    setSelectionMode(false);
    setSelectedPieceIds(new Set());
  }, []);

  const enterSelectionWith = React.useCallback((targetPieces: Piece[]) => {
    if (targetPieces.length === 0) return;
    setSelectionMode(true);
    setSelectedPieceIds(new Set(targetPieces.map((piece) => piece.id)));
  }, []);

  const togglePieceSelection = React.useCallback((pieceId: number) => {
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      if (next.has(pieceId)) next.delete(pieceId);
      else next.add(pieceId);
      if (next.size === 0) setSelectionMode(false);
      return next;
    });
  }, []);

  const toggleBatchSelection = React.useCallback((batchPieces: Piece[]) => {
    setSelectionMode(true);
    setSelectedPieceIds((prev) => {
      const next = new Set(prev);
      const allSelected = batchPieces.every((piece) => next.has(piece.id));
      if (allSelected) {
        batchPieces.forEach((piece) => next.delete(piece.id));
      } else {
        batchPieces.forEach((piece) => next.add(piece.id));
      }
      if (next.size === 0) setSelectionMode(false);
      return next;
    });
  }, []);

  const selectedPieces = React.useMemo(
    () => pieces.filter((piece) => selectedPieceIds.has(piece.id)),
    [pieces, selectedPieceIds],
  );

  const selectionAdvanceInfo = React.useMemo(() => {
    if (selectedPieces.length === 0) return null;

    const stages = new Set(selectedPieces.map((piece) => piece.stage));
    if (stages.size !== 1) {
      return { canAdvance: false as const, reason: 'mixed-stages' as const };
    }

    const stage = selectedPieces[0].stage;
    const nextStageId = getNextStageId(stage);
    if (!nextStageId || stage === 'cemetery') {
      return { canAdvance: false as const, reason: 'terminal-stage' as const };
    }

    return {
      canAdvance: true as const,
      nextStageLabel: stageLookup[nextStageId]?.label ?? nextStageId,
    };
  }, [selectedPieces, getNextStageId, stageLookup]);

  const handleSelectionAdvance = React.useCallback(() => {
    if (!selectionAdvanceInfo?.canAdvance) return;
    handleAdvanceBatch(selectedPieces);
    exitSelectionMode();
  }, [selectionAdvanceInfo, selectedPieces, handleAdvanceBatch, exitSelectionMode]);

  const pieceStageLabels = React.useMemo(() => {
    const labels: Record<string, string> = {};
    for (const [id, info] of Object.entries(stageLookup)) {
      if (id !== 'all') labels[id] = info.label;
    }
    return labels;
  }, [stageLookup]);

  const galleryPhotos = React.useMemo(
    () => (galleryPiece ? collectPiecePhotos(galleryPiece, pieceStageLabels) : []),
    [galleryPiece, pieceStageLabels],
  );

  const selectionHint = React.useMemo(() => {
    if (!selectionAdvanceInfo || selectionAdvanceInfo.canAdvance) return undefined;
    if (selectionAdvanceInfo.reason === 'mixed-stages') {
      return 'Select pieces at the same stage to advance together';
    }
    return 'Selected pieces cannot advance further';
  }, [selectionAdvanceInfo]);

  const advanceLinkedGlazeNames = React.useMemo(() => {
    if (!advanceRequest) return [];
    const names = advanceRequest.pieceIds
      .map((id) => pieces.find((piece) => piece.id === id))
      .filter((piece): piece is Piece => !!piece?.glazeId)
      .map((piece) => {
        const glaze = glazes.find((item) => item.id === piece.glazeId);
        return glaze ? formatGlazeDisplayName(glaze) : null;
      })
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names));
  }, [advanceRequest, glazes, pieces]);

  const openJournal = React.useCallback((
    piece: Piece,
    options: { initialStage?: string } = {},
  ) => {
    setJournalPiece(piece);
    setJournalOpenOptions(options);
  }, [setJournalPiece]);

  const closeJournal = React.useCallback(() => {
    setJournalPiece(null);
    setJournalOpenOptions({});
  }, [setJournalPiece]);

  React.useEffect(() => {
    const rawId = Array.isArray(params.openJournalPieceId)
      ? params.openJournalPieceId[0]
      : params.openJournalPieceId;
    const rawStage = Array.isArray(params.openJournalStage)
      ? params.openJournalStage[0]
      : params.openJournalStage;
    const rawNonce = Array.isArray(params.openJournalNonce)
      ? params.openJournalNonce[0]
      : params.openJournalNonce;
    const openKey = `${rawId ?? ''}:${rawStage ?? ''}:${rawNonce ?? ''}`;

    if (!rawId) {
      handledOpenJournalIdRef.current = null;
      return;
    }
    if (handledOpenJournalIdRef.current === openKey) return;

    const pieceId = Number(rawId);
    if (Number.isNaN(pieceId)) return;

    const piece = useAppStore
      .getState()
      .pieces
      .filter((current) => !current.deleted)
      .find((current) => current.id === pieceId || String(current.id) === String(rawId));
    if (!piece) return;

    openJournal(
      piece,
      rawStage ? { initialStage: rawStage } : {},
    );
    handledOpenJournalIdRef.current = openKey;
    requestAnimationFrame(() => {
      router.replace('/(tabs)/pieces');
    });
  }, [
    params.openJournalPieceId,
    params.openJournalStage,
    params.openJournalNonce,
    pieces,
    router,
    openJournal,
  ]);

  React.useEffect(() => {
    const stageParam = Array.isArray(params.stage) ? params.stage[0] : params.stage;
    if (!stageParam) return;
    setActiveStage(stageParam);
    router.replace('/(tabs)/pieces');
  }, [params.stage, setActiveStage, router]);

  const pieceActionOptions = React.useMemo((): PickSheetOption[] => {
    if (!actionSheetPiece) return [];
    const piece = actionSheetPiece;
    const options: PickSheetOption[] = [
      { label: 'Open journal', icon: BookOpen, onPress: () => openJournal(piece) },
    ];

    if (collectPiecePhotos(piece, pieceStageLabels).length > 0) {
      options.push({
        label: 'View photo gallery',
        icon: Images,
        onPress: () => setGalleryPiece(piece),
      });
    }

    options.push(
      { label: 'Edit details', icon: Edit3, onPress: () => setEditPiece(piece) },
    );

    if (piece.stage !== 'cemetery') {
      options.push({
        label: piece.status ? `Status: ${piece.status}` : 'Update status',
        icon: Tag,
        onPress: () => setStatusSheetPiece(piece),
      });
    }

    options.push(
      { label: 'Duplicate piece', icon: Copy, onPress: () => handleDuplicate(piece) },
      {
        label: 'Select for batch advance',
        icon: CheckSquare,
        onPress: () => enterSelectionWith([piece]),
      },
    );

    if (piece.batchId) {
      options.push({
        label: 'Duplicate entire batch',
        icon: Layers,
        onPress: () => handleDuplicateBatch(piece.batchId!),
      });
    }

    if (isSignedIn && piece.backendId) {
      options.push({
        label: `Visibility: ${VISIBILITY_LABEL[piece.visibility ?? 'private']}`,
        icon: Globe,
        onPress: () => setVisibilitySheetPiece(piece),
      });
    }

    if (isSignedIn) {
      options.push({
        label: 'Share to community',
        icon: Share2,
        onPress: () => handleSharePiece(piece),
      });
    }

    options.push({
      label: 'Delete piece',
      icon: Trash2,
      iconColor: 'hsl(0 55% 45%)',
      destructive: true,
      onPress: () => handleDelete(piece.id),
    });

    return options;
  }, [
    actionSheetPiece,
    pieceStageLabels,
    openJournal,
    setEditPiece,
    handleDuplicate,
    handleDuplicateBatch,
    handleSharePiece,
    handleDelete,
    enterSelectionWith,
  ]);

  const visibilityOptions = React.useMemo((): PickSheetOption[] => {
    if (!visibilitySheetPiece) return [];
    const piece = visibilitySheetPiece;
    const choose = (visibility: PieceVisibility) => {
      setVisibilitySheetPiece(null);
      void handleSetPieceVisibility(piece, visibility);
    };
    return [
      { label: 'Private — only you', icon: Lock, onPress: () => choose('private') },
      { label: 'Friends — people you follow each other', icon: Users, onPress: () => choose('friends') },
      { label: 'Public — anyone', icon: Globe, onPress: () => choose('public') },
    ];
  }, [visibilitySheetPiece, handleSetPieceVisibility]);

  const batchActionOptions = React.useMemo((): PickSheetOption[] => {
    if (!batchActionPieces?.length) return [];
    const rep = batchActionPieces[0];
    const nextStageId = getNextStageId(rep.stage);
    const nextStageLabel = nextStageId ? (stageLookup[nextStageId]?.label ?? nextStageId) : undefined;
    const batchId = rep.batchId ?? String(rep.id);
    const options: PickSheetOption[] = [];

    options.push({
      label: 'Select batch',
      icon: CheckSquare,
      onPress: () => enterSelectionWith(batchActionPieces),
    });
    if (nextStageLabel) {
      options.push({
        label: `Advance all to ${nextStageLabel}`,
        icon: Layers,
        onPress: () => handleAdvanceBatch(batchActionPieces),
      });
    }

    if (rep.batchId) {
      options.push({
        label: 'Duplicate entire batch',
        icon: Copy,
        onPress: () => handleDuplicateBatch(rep.batchId!),
      });
    }

    options.push({
      label: 'Expand batch',
      icon: Layers,
      onPress: () => toggleExpand(batchId),
    });

    return options;
  }, [batchActionPieces, getNextStageId, stageLookup, handleAdvanceBatch, handleDuplicateBatch, toggleExpand, enterSelectionWith]);

  const isCemeteryStage = activeStage === 'cemetery';
  const honoredCount = React.useMemo(
    () => pieces.filter((p) => p.stage === 'cemetery').length,
    [pieces],
  );
  const cemeteryHeaderDescription = React.useMemo(() => {
    if (honoredCount === 0) return 'The garden awaits its first resting place';
    const filterNote =
      search.trim() || activeFilterCount > 0 ? ` · ${filteredPieces.length} shown` : '';
    return `${honoredCount} at rest in the garden${filterNote}`;
  }, [activeFilterCount, filteredPieces.length, honoredCount, search]);

  return (
    <StudioTabScreen cemeteryMode={isCemeteryStage} ornamentOpacity={isCemeteryStage ? 0.05 : 0.34}>
      <StatusBar style={isCemeteryStage ? 'light' : 'auto'} />
      <ConfirmSheet
        visible={pendingDeletePieceId != null}
        title="Delete Piece?"
        body={`"${pieces.find(p => p.id === pendingDeletePieceId)?.name ?? 'This piece'}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDeletePiece}
        onCancel={clearPendingDelete}
      />
      <PickSheet
        visible={!!pendingAdvanceChoice}
        title="Advance Piece"
        body={pendingAdvanceChoice ? `Move just "${pendingAdvanceChoice.pieceName}", or all ${pendingAdvanceChoice.batchCount} pieces at this stage in the batch?` : undefined}
        options={pendingAdvanceChoice ? [
          { label: 'Just this one', onPress: pendingAdvanceChoice.onSingle },
          { label: `All ${pendingAdvanceChoice.batchCount} in batch`, onPress: pendingAdvanceChoice.onAll },
        ] : []}
        onCancel={() => setPendingAdvanceChoice(null)}
      />

      <MainTabHeader
        variant={isCemeteryStage ? 'cemetery' : 'default'}
        title={isCemeteryStage ? 'Honored Pieces' : 'My Pieces'}
        description={
          isCemeteryStage
            ? cemeteryHeaderDescription
            : `${pieces.length} piece${pieces.length !== 1 ? 's' : ''} · ${filteredPieces.length} filtered`
        }
        pressIcon={<Plus size={16} color={isCemeteryStage ? CEMETERY_ACCENT : 'white'} />}
        onPress={() => setAddOpen(true)}
        actionText="Add"
      />

      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-2">
          <SearchField
            variant={isCemeteryStage ? 'cemetery' : 'default'}
            className={`flex-1 ${isCemeteryStage ? 'bg-[#2A1C16]/85 border-[#5A4030]' : 'bg-card/75'}`}
            value={search}
            onChangeText={setSearch}
            placeholder={isCemeteryStage ? 'Search the honored...' : 'Search name or notes...'}
          />
          <TouchableOpacity
            onPress={() => setFiltersOpen(true)}
            className={`w-11 h-11 rounded-2xl items-center justify-center border ${activeFilterCount > 0
                ? 'bg-primary/10 border-primary/30'
                : isCemeteryStage
                  ? 'bg-[#2A1C16]/85 border-[#5A4030]'
                  : 'bg-card/75 border-border'
              }`}
          >
            <SlidersHorizontal
              size={16}
              color={
                activeFilterCount > 0
                  ? 'hsl(39 57% 51%)'
                  : isCemeteryStage
                    ? 'rgba(255, 244, 228, 0.65)'
                    : 'hsl(24 20% 40%)'
              }
            />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary items-center justify-center">
                <Text className="text-[9px] font-bold text-primary-foreground">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <CemeteryScrollAtmosphere active={isCemeteryStage} />

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          style={{ backgroundColor: 'transparent' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: TAB_SCROLL_BOTTOM_PADDING }}
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={refetchPieces}
              tintColor={isCemeteryStage ? 'rgba(255, 244, 228, 0.7)' : undefined}
            />
          }
        >
          {/* Stage Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-2 px-6 py-4"
          >
            {stageTabs.map(({ id, label, Icon }) => {
              const isActive = activeStage === id;
              const isCemeteryTab = id === 'cemetery';
              const cemeteryActive = isCemeteryTab && isActive;

              if (isCemeteryStage) {
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => setActiveStage(id)}
                    className="flex-row items-center gap-1.5 px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor: cemeteryActive
                        ? CEMETERY_PILL_ACTIVE
                        : CEMETERY_PILL_INACTIVE_BG,
                      borderColor: cemeteryActive
                        ? CEMETERY_PILL_ACTIVE_BORDER
                        : CEMETERY_BORDER_SUBTLE,
                    }}
                  >
                    <Icon
                      size={14}
                      color={cemeteryActive ? CEMETERY_TEXT : CEMETERY_TEXT_SUBTLE}
                    />
                    <Text
                      className="text-sm font-medium"
                      style={{ color: cemeteryActive ? CEMETERY_TEXT : CEMETERY_TEXT_SUBTLE }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => setActiveStage(id)}
                  className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
                    }`}
                >
                  <Icon
                    size={14}
                    color={isActive ? 'hsl(34 35% 92%)' : 'hsl(24 20% 40%)'}
                  />
                  <Text
                    className={`text-sm font-medium ${isActive ? 'text-background' : 'text-muted-foreground'
                      }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="px-6">
            {activeStage === 'cemetery' ? (
              <CemeteryGardenView count={honoredCount}>
                {filteredPieces.length > 0 ? (
                  <Animated.View layout={itemLayout} className="flex-row flex-wrap justify-between">
                    {displayItems.map((item) => {
                      if (item.type === 'set-header' || item.type === 'batch') return null;

                      return (
                        <Animated.View
                          key={`piece-${item.piece.id}`}
                          layout={itemLayout}
                          entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}
                          exiting={FadeOutUp.duration(260).easing(Easing.in(Easing.cubic))}
                          style={cemeteryColumnStyle}
                        >
                          <CemeteryPieceCard
                            piece={item.piece}
                            headstoneWidth={cemeteryHeadstoneWidth}
                            selectionMode={selectionMode}
                            selected={selectedPieceIds.has(item.piece.id)}
                            onPress={() => openJournal(item.piece)}
                            onToggleSelect={() => togglePieceSelection(item.piece.id)}
                            onLongPress={() => setActionSheetPiece(item.piece)}
                            onMore={() => setActionSheetPiece(item.piece)}
                          />
                        </Animated.View>
                      );
                    })}
                  </Animated.View>
                ) : pieces.length > 0 ? (
                  <CemeteryGardenEmpty />
                ) : null}
              </CemeteryGardenView>
            ) : (
              <Animated.View layout={itemLayout} className="flex-row flex-wrap justify-between">
                {displayItems.map((item) => {
                  if (item.type === 'set-header') {
                    return (
                      <Animated.View
                        key={`header-${item.batchId}`}
                        layout={itemLayout}
                        entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}
                        exiting={FadeOutUp.duration(260).easing(Easing.in(Easing.cubic))}
                        className="w-full mb-2 mt-0.5"
                      >
                        <TouchableOpacity
                          onPress={() => toggleExpand(item.batchId)}
                          activeOpacity={0.8}
                          className="self-start flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/40"
                        >
                          <Layers size={10} color="hsl(24 20% 40%)" />
                          <Text className="text-[10px] font-body-medium text-muted-foreground">
                            {item.name} · {item.count}
                          </Text>
                          <Text className="text-[10px] font-body-medium text-primary">Collapse</Text>
                          <ChevronUp size={11} color="hsl(39 57% 51%)" />
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  }

                  if (item.type === 'batch') {
                    const representative = item.pieces[0];
                    const nextStageId = representative ? getNextStageId(representative.stage) : null;
                    const nextStageLabel = nextStageId ? (stageLookup[nextStageId]?.label ?? nextStageId) : undefined;
                    const stageLabel = representative ? (stageLookup[representative.stage]?.label ?? representative.stage) : '';
                    return (
                      <Animated.View
                        key={`batch-${item.batchId}`}
                        layout={itemLayout}
                        entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}
                        exiting={FadeOutUp.duration(260).easing(Easing.in(Easing.cubic))}
                        style={{ width: '48%', marginBottom: 16 }}
                      >
                        <BatchCard
                          pieces={item.pieces}
                          onAdvanceAll={() => handleAdvanceBatch(item.pieces)}
                          stageLabel={stageLabel}
                          nextStageLabel={nextStageLabel}
                          selectionMode={selectionMode}
                          selectedCount={item.pieces.filter((piece) => selectedPieceIds.has(piece.id)).length}
                          onExpand={() => toggleExpand(item.batchId)}
                          onMore={() => setBatchActionPieces(item.pieces)}
                          onToggleBatchSelect={() => toggleBatchSelection(item.pieces)}
                        />
                      </Animated.View>
                    );
                  }

                  return (
                    <Animated.View
                      key={`piece-${item.piece.id}`}
                      layout={itemLayout}
                      entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}
                      exiting={FadeOutUp.duration(260).easing(Easing.in(Easing.cubic))}
                      style={{ width: '48%', marginBottom: 16 }}
                    >
                      <PieceCard
                        piece={item.piece}
                        compact={piecesCompactCards}
                        selectionMode={selectionMode}
                        selected={selectedPieceIds.has(item.piece.id)}
                        onPress={() => openJournal(item.piece)}
                        onToggleSelect={() => togglePieceSelection(item.piece.id)}
                        onLongPress={() => setActionSheetPiece(item.piece)}
                        onAdvance={() => handleAdvance(item.piece.id)}
                        stageLabel={stageLookup[item.piece.stage]?.label}
                        nextStageLabel={(() => {
                          const nextStageId = getNextStageId(item.piece.stage);
                          return nextStageId ? (stageLookup[nextStageId]?.label ?? nextStageId) : undefined;
                        })()}
                        progressStageOrder={progressStageOrder}
                        onSendToCemetery={item.piece.stage !== 'cemetery' ? () => handleSendToCemetery(item.piece.id) : undefined}
                        onJournal={() => openJournal(item.piece)}
                        onMore={() => setActionSheetPiece(item.piece)}
                      />
                    </Animated.View>
                  );
                })}
              </Animated.View>
            )}

            {filteredPieces.length === 0 && (
              pieces.length === 0 ? (
                <EmptyState
                  icon={Layers}
                  variant={isCemeteryStage ? 'cemetery' : 'default'}
                  title="Your shelf is waiting"
                  description="Every potter starts with a first lump of clay. Log a piece to track it from wet clay to glazed and fired."
                  ctaLabel="Add your first piece"
                  ctaIcon={Plus}
                  onCtaPress={() => setAddOpen(true)}
                />
              ) : activeStage !== 'cemetery' ? (
                <EmptyState
                  title="No pieces match"
                  description={search.trim() || activeFilterCount > 0
                    ? 'Try a different search or loosen your filters.'
                    : 'Nothing at this stage right now, your pieces are busy elsewhere in the studio.'}
                />
              ) : null
            )}
          </View>
        </ScrollView>
      </View>

      {selectionMode ? (
        <PieceSelectionBar
          variant={isCemeteryStage ? 'cemetery' : 'default'}
          selectedCount={selectedPieceIds.size}
          advanceLabel={
            selectionAdvanceInfo?.canAdvance
              ? `Advance to ${selectionAdvanceInfo.nextStageLabel}`
              : 'Advance'
          }
          canAdvance={!!selectionAdvanceInfo?.canAdvance}
          hint={selectionHint}
          onCancel={exitSelectionMode}
          onAdvance={handleSelectionAdvance}
        />
      ) : null}

      <PiecePhotoGalleryModal
        visible={galleryPiece !== null && galleryPhotos.length > 0}
        title={galleryPiece?.name ?? 'Photos'}
        photos={galleryPhotos}
        onClose={() => setGalleryPiece(null)}
      />

      <CeremonyOverlay
        visible={firstPieceCeremony}
        emoji="🏺"
        title="First piece logged!"
        subtitle="Your studio journey starts here."
        tint="rgba(130, 180, 110, 1)"
        durationMs={3000}
        onDismiss={() => setFirstPieceCeremony(false)}
      />
      <AddPieceModal
        visible={addOpen || editPiece !== undefined}
        onClose={() => { setAddOpen(false); setEditPiece(undefined); }}
        onAdd={(newPieces) => {
          const isFirst = pieces.length === 0 && !seenCeremonies.includes('first-piece');
          handleAdd(newPieces);
          if (isFirst) {
            markCeremonyAsSeen('first-piece');
            setFirstPieceCeremony(true);
          }
        }}
        editPiece={editPiece}
        onEdit={handleEditPiece}
      />
      {journalPiece ? (
        <PieceJournalModal
          piece={journalPiece}
          visible
          initialStage={journalOpenOptions.initialStage}
          onClose={closeJournal}
          onUpdateEntry={handleUpdateJournalEntry}
          onUpdatePiece={handleUpdatePiece}
        />
      ) : null}
      <CemeterySacrificeModal
        piece={cemeteryPiece}
        visible={cemeteryPiece !== null}
        onClose={() => setCemeteryPiece(null)}
        onConfirm={handleConfirmSendToCemetery}
      />
      <PickSheet
        visible={actionSheetPiece !== null}
        title={actionSheetPiece?.name ?? 'Piece actions'}
        body={
          actionSheetPiece
            ? `${STAGE_LABEL[actionSheetPiece.stage] ?? actionSheetPiece.stage} · ${actionSheetPiece.clay}`
            : undefined
        }
        layout="list"
        options={pieceActionOptions}
        onCancel={() => setActionSheetPiece(null)}
      />
      <PickSheet
        visible={visibilitySheetPiece !== null}
        title="Piece visibility"
        body={
          visibilitySheetPiece
            ? `Who can see "${visibilitySheetPiece.name}" when you share it`
            : undefined
        }
        layout="list"
        options={visibilityOptions}
        onCancel={() => setVisibilitySheetPiece(null)}
      />
      <PickSheet
        visible={batchActionPieces !== null}
        title={
          batchActionPieces?.[0]
            ? batchActionPieces[0].name.replace(/\s+\d+$/, '')
            : 'Batch actions'
        }
        body={
          batchActionPieces
            ? `Set of ${batchActionPieces.length} · ${batchActionPieces[0]?.clay ?? ''}`
            : undefined
        }
        layout="list"
        options={batchActionOptions}
        onCancel={() => setBatchActionPieces(null)}
      />
      <FilterSortSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sortKey={sortKey}
        onSortChange={setSortKey}
        filters={filters}
        onFiltersChange={setFilters}
        allPieces={pieces}
        resultCount={filteredPieces.length}
      />
      {statusSheetPiece ? (
        <PieceStatusSheet
          key={statusSheetPiece.id}
          piece={statusSheetPiece}
          onClose={() => setStatusSheetPiece(null)}
          onSave={handleUpdatePiece}
        />
      ) : null}
      <StageAdvanceCelebrationModal
        transition={stageTransition}
        stageLookup={stageLookup}
        onClose={() => setStageTransition(null)}
      />
      <StageAdvanceFlowModal
        request={advanceRequest}
        piecePhotoCount={
          advanceRequest
            ? Math.max(
              0,
              ...advanceRequest.pieceIds.map((id) => {
                const p = pieces.find((piece) => piece.id === id);
                return p ? countPiecePhotos(p) : 0;
              }),
            )
            : 0
        }
        stageLookup={stageLookup}
        linkedGlazeNames={advanceLinkedGlazeNames}
        clayBodyName={
          advanceRequest
            ? pieces.find((piece) => piece.id === advanceRequest.pieceIds[0])?.clay
            : undefined
        }
        defaultBisqueTemp={defaultBisqueTemp}
        defaultGlazeTemp={defaultGlazeTemp}
        onClose={dismissAdvanceRequest}
        onSkip={() => skipAdvanceRequest(setStageTransition)}
        onConfirm={(capture) => commitAdvanceRequest(capture, setStageTransition)}
      />
    </StudioTabScreen>
  );
}

