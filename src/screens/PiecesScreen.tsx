// src/screens/PiecesScreen.tsx
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { Plus, Search } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { AddPieceModal } from './pieces/AddPieceModal';
import { CemeteryBanner } from './pieces/CemeteryBanner';
import { PieceCard } from './pieces/PieceCard';
import { INITIAL_PIECES, STAGES } from './pieces/constants';
import type { Piece } from './pieces/types';

export default function PiecesScreen() {
  const [pieces, setPieces] = React.useState<Piece[]>(INITIAL_PIECES);
  const [activeStage, setActiveStage] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);

  const filteredPieces = pieces.filter(p =>
    (activeStage === 'all' || p.stage === activeStage) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const rows: Piece[][] = [];
  for (let i = 0; i < filteredPieces.length; i += 2) {
    rows.push(filteredPieces.slice(i, i + 2));
  }

  const handleAdd = (piece: Piece) => {
    setPieces(prev => [piece, ...prev]);
    setAddOpen(false);
  };

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

        <View className="relative justify-center">
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
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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

          {rows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-4 mb-4">
              {row.map(piece => (
                <PieceCard key={piece.id} piece={piece} />
              ))}
              {row.length === 1 && <View className="flex-1" />}
            </View>
          ))}

          {filteredPieces.length === 0 && (
            <View className="items-center py-16">
              <Text className="text-muted-foreground text-sm">No pieces found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AddPieceModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
    </View>
  );
}

