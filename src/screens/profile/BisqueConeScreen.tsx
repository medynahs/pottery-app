import { Text } from '@/src/components/ui/text';
import { BISQUE_TEMPS } from '@/src/screens/pieces/constants';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { Check, Flame } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BisqueConeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const defaultBisqueTemp = useAppStore((s) => s.defaultBisqueTemp);
  const setDefaultBisqueTemp = useAppStore((s) => s.setDefaultBisqueTemp);

  function handleSelect(cone: string) {
    // Tap the currently selected cone to deselect (clear default)
    setDefaultBisqueTemp(defaultBisqueTemp === cone ? null : cone);
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Bisque Cone
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            Select your default bisque firing temperature
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-muted px-4 py-2 rounded-full"
        >
          <Text className="text-sm font-medium text-foreground">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Info note */}
        <View className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 mb-4 flex-row items-start gap-3">
          <Flame size={16} color="hsl(25 90% 55%)" className="mt-0.5" />
          <Text className="text-xs text-orange-700 flex-1 leading-relaxed">
            This cone will be pre-selected when you add a new piece. You can still override it per piece.
          </Text>
        </View>

        {/* Cone list */}
        <View className="bg-card rounded-2xl border border-border overflow-hidden">
          {BISQUE_TEMPS.map((cone, index) => {
            const selected = defaultBisqueTemp === cone;
            const isLast = index === BISQUE_TEMPS.length - 1;
            return (
              <TouchableOpacity
                key={cone}
                onPress={() => handleSelect(cone)}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}
              >
                <View className="w-9 h-9 rounded-xl items-center justify-center bg-orange-50 mr-3">
                  <Flame size={16} color="hsl(25 90% 55%)" />
                </View>
                <Text className="flex-1 text-sm font-medium text-foreground">{cone}</Text>
                {selected && (
                  <View className="w-6 h-6 rounded-full bg-orange-500 items-center justify-center">
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clear default button */}
        {defaultBisqueTemp && (
          <TouchableOpacity
            onPress={() => setDefaultBisqueTemp(null)}
            className="mt-3 items-center py-3"
          >
            <Text className="text-sm text-muted-foreground">Clear default</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
