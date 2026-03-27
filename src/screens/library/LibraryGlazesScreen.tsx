import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { ChevronRight, Droplets } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function LibraryGlazesScreen() {

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);

  // Folder/collection state
  const [newFolder, setNewFolder] = React.useState('');
  const [showAddFolder, setShowAddFolder] = React.useState(false);

  // Get all unique collections from glazes
  const collections = React.useMemo(() => {
    const set = new Set<string>();
    glazes.forEach((g) => g.collections.forEach((c) => set.add(c)));
    return Array.from(set).filter(Boolean).sort();
  }, [glazes]);

  // Group glazes by collection
  const glazesByCollection = React.useMemo(() => {
    const map: Record<string, typeof glazes> = {};
    collections.forEach((c) => { map[c] = []; });
    glazes.forEach((g) => {
      if (g.collections.length === 0) {
        map['Unsorted'] = map['Unsorted'] || [];
        map['Unsorted'].push(g);
      } else {
        g.collections.forEach((c) => map[c].push(g));
      }
    });
    return map;
  }, [glazes, collections]);

  // Add folder handler (adds a dummy glaze with the new collection for demo, real impl would update state)
  const handleAddFolder = () => {
    if (!newFolder.trim() || collections.includes(newFolder.trim())) return;
    // In real app, would update a folder list or add a dummy glaze to create the folder
    setNewFolder('');
    setShowAddFolder(false);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-5">
          <TouchableOpacity onPress={() => router.push('/glaze-library' as never)} activeOpacity={0.86}>
            <View className="rounded-[30px] overflow-hidden border border-blue-200 bg-blue-50">
              <View className="px-5 pt-5 pb-4" style={{ backgroundColor: 'rgba(218, 236, 248, 0.95)' }}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-blue-700 mb-2">My Glaze Collection</Text>
                    <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>Glaze Atlas</Text>
                    <Text className="text-sm text-blue-900 mt-2 leading-6">
                      Open your recipes, test tiles, and kiln-context learning.
                    </Text>
                  </View>
                  <View className="w-14 h-14 rounded-[20px] bg-white/85 items-center justify-center">
                    <Droplets size={24} color="hsl(213 80% 55%)" />
                  </View>
                </View>

                <View className="flex-row gap-3 mt-5">
                  <View className="flex-1 rounded-2xl bg-white/80 px-4 py-3">
                    <Text className="text-[10px] font-semibold uppercase tracking-[1.3px] text-blue-700">Glazes</Text>
                    <Text className="text-2xl text-foreground mt-1" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{glazes.length}</Text>
                  </View>
                  <View className="flex-1 rounded-2xl bg-white/80 px-4 py-3">
                    <Text className="text-[10px] font-semibold uppercase tracking-[1.3px] text-blue-700">Tests</Text>
                    <Text className="text-2xl text-foreground mt-1" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{glazeTests.length}</Text>
                  </View>
                </View>
              </View>

              <View className="px-5 py-4 bg-card/80 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Open glaze library</Text>
                  <Text className="text-xs text-muted-foreground mt-1">Track your own glaze recipes and outcomes.</Text>
                </View>
                <ChevronRight size={18} color="hsl(213 80% 55%)" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Folder/Collection UI */}
        <View className="px-6 mt-6 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Collections</Text>
            <TouchableOpacity onPress={() => setShowAddFolder((v) => !v)} className="px-3 py-1 rounded-full bg-muted" activeOpacity={0.8}>
              <Text className="text-xs font-semibold text-foreground">Add Folder</Text>
            </TouchableOpacity>
          </View>
          {showAddFolder && (-
            <View className="flex-row items-center mb-2 gap-2">
              <View className="flex-1 bg-card rounded-xl px-3 py-2 border border-border">
                <TextInput
                  value={newFolder}
                  onChangeText={setNewFolder}
                  placeholder="Folder name"
                  className="text-sm text-foreground"
                  style={{ fontFamily: 'Fraunces_600SemiBold', padding: 0, backgroundColor: 'transparent' }}
                  maxLength={32}
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity onPress={handleAddFolder} className="px-3 py-2 rounded-xl bg-primary" activeOpacity={0.8}>
                <Text className="text-xs font-semibold text-background">Create</Text>
              </TouchableOpacity>
            </View>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {collections.length === 0 && (
              <View className="px-4 py-2 rounded-xl bg-muted">
                <Text className="text-xs text-muted-foreground">No folders yet</Text>
              </View>
            )}
            {collections.map((c) => (
              <View key={c} className="px-4 py-2 rounded-xl bg-card border border-border">
                <Text className="text-xs font-semibold text-foreground">{c}</Text>
              </View>
            ))}
            {glazesByCollection['Unsorted'] && (
              <View className="px-4 py-2 rounded-xl bg-muted border border-border">
                <Text className="text-xs font-semibold text-muted-foreground">Unsorted</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Glazes by Collection */}
        {collections.map((c) => (
          <View key={c} className="px-6 mb-6">
            <Text className="text-base font-bold text-foreground mb-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{c}</Text>
            {glazesByCollection[c].length > 0 ? glazesByCollection[c].map((glaze) => (
              <Card key={glaze.id} className="p-4 mb-2">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{glaze.name}</Text>
                    <Text className="text-xs text-muted-foreground mt-1">{glaze.colorFamily} · {glaze.coneRange}</Text>
                  </View>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1">
                    <Text className="text-[10px] font-medium text-muted-foreground">{glazeTests.filter((t) => t.glazeId === glaze.id).length} tests</Text>
                  </Badge>
                </View>
              </Card>
            )) : (
              <Card className="p-4 mb-2">
                <Text className="text-sm text-muted-foreground">No glazes in this folder.</Text>
              </Card>
            )}
          </View>
        ))}
        {/* Unsorted glazes */}
        {glazesByCollection['Unsorted'] && (
          <View className="px-6 mb-6">
            <Text className="text-base font-bold text-muted-foreground mb-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Unsorted</Text>
            {glazesByCollection['Unsorted'].length > 0 ? glazesByCollection['Unsorted'].map((glaze) => (
              <Card key={glaze.id} className="p-4 mb-2">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{glaze.name}</Text>
                    <Text className="text-xs text-muted-foreground mt-1">{glaze.colorFamily} · {glaze.coneRange}</Text>
                  </View>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1">
                    <Text className="text-[10px] font-medium text-muted-foreground">{glazeTests.filter((t) => t.glazeId === glaze.id).length} tests</Text>
                  </Badge>
                </View>
              </Card>
            )) : (
              <Card className="p-4 mb-2">
                <Text className="text-sm text-muted-foreground">No glazes in this folder.</Text>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default LibraryGlazesScreen;
