// src/screens/PiecesScreen.tsx
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { ChevronUp, Layers, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { AddPieceModal } from './pieces/AddPieceModal';
import { BatchCard } from './pieces/BatchCard';
import { CemeteryBanner } from './pieces/CemeteryBanner';
import { CemeterySacrificeModal } from './pieces/CemeterySacrificeModal';
import { FilterSortSheet } from './pieces/FilterSortSheet';
import { usePiecesScreen } from './pieces/hooks/usePiecesScreen';
import { PieceActionSheet } from './pieces/PieceActionSheet';
import { PieceCard } from './pieces/PieceCard';
import { PieceJournalModal } from './pieces/PieceJournalModal';
import { StageAdvanceCelebrationModal, type StageAdvanceCelebration } from './pieces/StageAdvanceCelebrationModal';
import { StageAdvanceFlowModal } from './pieces/StageAdvanceFlowModal';

const itemLayout = LinearTransition
  .duration(420)
  .easing(Easing.inOut(Easing.cubic));

export default function PiecesScreen() {
  const [stageTransition, setStageTransition] = React.useState<StageAdvanceCelebration | null>(null);

  const {
    pieces,
    filteredPieces,
    displayItems,
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
    handleEditPiece,
    handleDelete,
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
          {stageTabs.map(({ id, label, Icon }) => {
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

