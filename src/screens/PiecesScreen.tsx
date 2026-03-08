// src/screens/PiecesScreen.tsx
import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { ArchiveX, Droplets, Flame, Heart, PackageCheck, Plus, Search, Sparkles, Wind } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';

const STAGES = [
  { id: 'all', label: 'All', Icon: PackageCheck },
  { id: 'wet', label: 'Wet/Leather', Icon: Droplets },
  { id: 'bone-dry', label: 'Bone Dry', Icon: Wind },
  { id: 'bisque', label: 'Bisque Fired', Icon: Flame },
  { id: 'glaze', label: 'Glazed', Icon: PackageCheck },
  { id: 'cemetery', label: 'Cemetery', Icon: ArchiveX },
];

const MOCK_PIECES = [
  { id: 1, name: 'Speckled Mug', stage: 'bisque', date: 'Oct 12', clay: 'B-Mix', imgUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Tall Vase', stage: 'bone-dry', date: 'Oct 15', clay: 'Speckled Buff', imgUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Matcha Bowl', stage: 'wet', date: 'Oct 18', clay: 'Porcelain', imgUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'Planter Pot', stage: 'cemetery', date: 'Sep 22', clay: 'Red Stoneware', notes: 'Cracked in bisque', imgUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400&auto=format&fit=crop' },
  { id: 5, name: 'Yunomi Cup', stage: 'glaze', date: 'Oct 20', clay: 'B-Mix', imgUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=400&auto=format&fit=crop' },
  { id: 6, name: 'Serving Bowl', stage: 'bisque', date: 'Oct 8', clay: 'Porcelain', imgUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=400&auto=format&fit=crop' },
];

const STAGE_LABEL: Record<string, string> = {
  wet: 'Wet/Leather',
  'bone-dry': 'Bone Dry',
  bisque: 'Bisque',
  glaze: 'Glazed',
  cemetery: 'Honored',
};

export default function PiecesScreen() {
  const [activeStage, setActiveStage] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const filteredPieces = MOCK_PIECES.filter(p =>
    (activeStage === 'all' || p.stage === activeStage) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Pair pieces into rows of 2
  const rows: (typeof MOCK_PIECES)[] = [];
  for (let i = 0; i < filteredPieces.length; i += 2) {
    rows.push(filteredPieces.slice(i, i + 2));
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-20 pb-4 bg-background border-b border-border">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-serif font-bold text-foreground">My Pieces</Text>
          <TouchableOpacity className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-md">
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
                  isActive
                    ? 'bg-foreground border-foreground'
                    : 'bg-card border-border'
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
          {/* Cemetery banner */}
          {activeStage === 'cemetery' && (
            <Card className="mb-6 p-8 items-center border-2 border-dashed border-muted bg-muted/30">
              <Text className="text-2xl font-serif font-bold text-foreground italic mb-2">
                The Kiln Gods' Garden
              </Text>
              <Text className="text-sm text-muted-foreground text-center leading-relaxed max-w-[240px]">
                "Every crack is a lesson, every explosion a story. We honor the pieces that didn't make it."
              </Text>
              <View className="flex-row items-center gap-6 mt-6">
                <View className="items-center">
                  <Text className="text-xl font-serif font-bold text-primary">12</Text>
                  <Text className="text-[10px] uppercase tracking-widest text-muted-foreground">Honored</Text>
                </View>
                <View className="w-px h-8 bg-border" />
                <View className="items-center">
                  <Sparkles size={18} color="hsl(38 55% 55%)" />
                  <Text className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Lessons</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Grid */}
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-4 mb-4">
              {row.map(piece => (
                <TouchableOpacity key={piece.id} className="flex-1" activeOpacity={0.85}>
                  <Card className="overflow-hidden flex-1">
                    {/* Image */}
                    <View className="aspect-square bg-muted/40 relative">
                      <Image
                        source={{ uri: piece.imgUrl }}
                        className="w-full h-full"
                        style={piece.stage === 'cemetery' ? { opacity: 0.5 } : undefined}
                        resizeMode="cover"
                      />
                      <View className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-card/90 border-0 rounded-full px-2.5 py-1">
                          <Text className="text-[10px] font-bold text-foreground">
                            {STAGE_LABEL[piece.stage] ?? piece.stage}
                          </Text>
                        </Badge>
                      </View>
                    </View>

                    {/* Info */}
                    <View className="p-3 bg-card">
                      <Text className="font-serif font-bold text-sm text-foreground" numberOfLines={1}>
                        {piece.name}
                      </Text>
                      <Text className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">
                        {piece.clay}
                      </Text>
                      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
                        <Text className="text-[10px] font-bold text-muted-foreground">{piece.date}</Text>
                        {piece.stage === 'cemetery' && (
                          <View className="flex-row items-center gap-1">
                            <Heart size={10} color="hsl(15 50% 50%)" fill="hsl(15 50% 50%)" />
                            <Text className="text-[10px] font-bold text-primary uppercase tracking-tight">
                              Remembered
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
              {/* Fill empty slot in last odd row */}
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
    </View>
  );
}