// src/screens/PiecesScreen.tsx
import { ConfirmSheet, PickSheet } from '@/src/components/AppSheets';
import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronUp, Layers, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { MainTabHeader } from '../../components/MainTabHeader';
import { BatchCard } from './components/BatchCard';
import { CemeteryBanner } from './components/CemeteryBanner';
import { FilterSortSheet } from './components/FilterSortSheet';
import { PieceActionSheet } from './components/PieceActionSheet';
import { PieceCard } from './components/PieceCard';
import { usePiecesScreen } from './hooks/usePiecesScreen';
import { AddPieceModal } from './modals/AddPieceModal';
import { CemeterySacrificeModal } from './modals/CemeterySacrificeModal';
import { PieceJournalModal } from './modals/PieceJournalModal';
import { StageAdvanceCelebrationModal, type StageAdvanceCelebration } from './modals/StageAdvanceCelebrationModal';
import { StageAdvanceFlowModal } from './modals/StageAdvanceFlowModal';

const itemLayout = LinearTransition
  .duration(420)
  .easing(Easing.inOut(Easing.cubic));

export default function PiecesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openJournalPieceId?: string | string[]; stage?: string | string[] }>();
  const handledOpenJournalIdRef = React.useRef<string | null>(null);
  const [stageTransition, setStageTransition] = React.useState<StageAdvanceCelebration | null>(null);
  const [firstPieceCeremony, setFirstPieceCeremony] = React.useState(false);
  const seenCeremonies = useAppStore((s) => s.seenCeremonies);
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
  } = usePiecesScreen();

  React.useEffect(() => {
    const rawId = Array.isArray(params.openJournalPieceId)
      ? params.openJournalPieceId[0]
      : params.openJournalPieceId;

    if (!rawId || handledOpenJournalIdRef.current === rawId) return;

    const pieceId = Number(rawId);
    if (Number.isNaN(pieceId)) return;

    const piece = pieces.find((current) => current.id === pieceId);
    if (!piece) return;

    setJournalPiece(piece);
    handledOpenJournalIdRef.current = rawId;
    router.replace('/(tabs)/pieces');
  }, [params.openJournalPieceId, pieces, router, setJournalPiece]);

  React.useEffect(() => {
    const stageParam = Array.isArray(params.stage) ? params.stage[0] : params.stage;
    if (!stageParam) return;
    setActiveStage(stageParam);
    router.replace('/(tabs)/pieces');
  }, [params.stage, setActiveStage, router]);

  return (
    <View className="flex-1 bg-background">
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
      
      <MainTabHeader title='My Pieces' description={`${pieces.length} piece${pieces.length !== 1 ? 's' : ''} · ${filteredPieces.length} filtered`} pressIcon={<Plus size={16} color="white" />} onPress={() => setAddOpen(true)}  actionText='Add' />

      <View className="px-6 pt-4 pb-2 bg-background ">
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
            className={`w-11 h-11 rounded-2xl items-center justify-center border ${activeFilterCount > 0 ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'
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

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isSyncing} onRefresh={refetchPieces} />
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
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveStage(id)}
                className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
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
                      <ChevronUp size={11} color="hsl(15 50% 50%)" />
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
                      onExpand={() => toggleExpand(item.batchId)}
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
                    onAdvance={() => handleAdvance(item.piece.id)}
                    stageLabel={stageLookup[item.piece.stage]?.label}
                    nextStageLabel={(() => {
                      const nextStageId = getNextStageId(item.piece.stage);
                      return nextStageId ? (stageLookup[nextStageId]?.label ?? nextStageId) : undefined;
                    })()}
                    progressStageOrder={progressStageOrder}
                    onSendToCemetery={item.piece.stage !== 'cemetery' ? () => handleSendToCemetery(item.piece.id) : undefined}
                    onJournal={() => setJournalPiece(item.piece)}
                    onMore={() => setActionSheetPiece(item.piece)}
                  />
                </Animated.View>
              );
            })}
          </Animated.View>

          {filteredPieces.length === 0 && (
            <View className="items-center py-16">
              <Text className="text-muted-foreground text-sm">No pieces found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

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
      <PieceJournalModal
        piece={journalPiece}
        visible={journalPiece !== null}
        onClose={() => setJournalPiece(null)}
        onUpdateEntry={handleUpdateJournalEntry}
        onUpdatePiece={handleUpdatePiece}
      />
      <CemeterySacrificeModal
        piece={cemeteryPiece}
        visible={cemeteryPiece !== null}
        onClose={() => setCemeteryPiece(null)}
        onConfirm={handleConfirmSendToCemetery}
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
      <StageAdvanceCelebrationModal
        transition={stageTransition}
        stageLookup={stageLookup}
        onClose={() => setStageTransition(null)}
      />
      <StageAdvanceFlowModal
        request={advanceRequest}
        stageLookup={stageLookup}
        defaultBisqueTemp={defaultBisqueTemp}
        defaultGlazeTemp={defaultGlazeTemp}
        onClose={dismissAdvanceRequest}
        onSkip={() => skipAdvanceRequest(setStageTransition)}
        onConfirm={(capture) => commitAdvanceRequest(capture, setStageTransition)}
      />
    </View>
  );
}

