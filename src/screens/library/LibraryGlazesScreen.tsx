import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { ChevronRight, Droplets } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LibraryGlazesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);

  const recentGlazes = React.useMemo(
    () => glazes
      .map((glaze) => ({
        ...glaze,
        tests: glazeTests.filter((test) => test.glazeId === glaze.id).length,
      }))
      .slice(0, 6),
    [glazeTests, glazes],
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-4 border-b border-border bg-background">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Glazes
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Your recipes and tests in one place.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} className="px-4 py-2 rounded-full bg-muted">
            <Text className="text-sm font-medium text-foreground">Done</Text>
          </TouchableOpacity>
        </View>
      </View>

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

        <View className="px-6 mt-6 mb-3 flex-row items-end justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>My Recipes</Text>
            <Text className="text-xs text-muted-foreground mt-1">Your current glaze set.</Text>
          </View>
          <Text className="text-xs font-semibold text-primary">{recentGlazes.length} shown</Text>
        </View>

        <View className="px-6 gap-3 mb-10">
          {recentGlazes.length > 0 ? recentGlazes.map((glaze) => (
            <Card key={glaze.id} className="p-4">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 pr-3">
                  <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{glaze.name}</Text>
                  <Text className="text-xs text-muted-foreground mt-1">{glaze.colorFamily} · {glaze.coneRange}</Text>
                </View>
                <Badge variant="outline" className="rounded-full px-2.5 py-1">
                  <Text className="text-[10px] font-medium text-muted-foreground">{glaze.tests} tests</Text>
                </Badge>
              </View>
            </Card>
          )) : (
            <Card className="p-4">
              <Text className="text-sm text-muted-foreground">No glazes yet. Add your first recipe in Glaze Atlas.</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
