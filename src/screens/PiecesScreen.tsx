// src/screens/PiecesScreen.tsx
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { Layers, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { AddPieceModal } from './pieces/AddPieceModal';
import { BatchCard } from './pieces/BatchCard';
import { CemeteryBanner } from './pieces/CemeteryBanner';
import { FilterSortSheet } from './pieces/FilterSortSheet';
import { usePiecesScreen } from './pieces/hooks/usePiecesScreen';
import { PieceActionSheet } from './pieces/PieceActionSheet';
import { PieceCard } from './pieces/PieceCard';
import { PieceJournalModal } from './pieces/PieceJournalModal';

export default function PiecesScreen() {
  const {
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

