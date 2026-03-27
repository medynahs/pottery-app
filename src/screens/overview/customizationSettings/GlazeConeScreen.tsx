import { Text } from '@/src/components/ui/text';
import { CONE_TEMPS_CELSIUS, GLAZE_TEMPS } from '@/src/screens/pieces/utils/constants';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { Check, Zap } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GlazeConeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const setDefaultGlazeTemp = useAppStore((s) => s.setDefaultGlazeTemp);

  function handleSelect(cone: string) {
    setDefaultGlazeTemp(defaultGlazeTemp === cone ? null : cone);
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Glaze Cone
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            Select your default glaze firing temperature
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
        <View className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-4 flex-row items-start gap-3">
          <Zap size={16} color="hsl(38 80% 50%)" className="mt-0.5" />
          <Text className="text-xs text-amber-700 flex-1 leading-relaxed">
            This cone will be pre-selected when you add a new piece. You can still override it per piece.
          </Text>
        </View>

        {/* Cone list */}
        <View className="bg-card rounded-2xl border border-border overflow-hidden">
          {GLAZE_TEMPS.map((cone, index) => {
            const selected = defaultGlazeTemp === cone;
            const isLast = index === GLAZE_TEMPS.length - 1;
            return (
              <TouchableOpacity
                key={cone}
                onPress={() => handleSelect(cone)}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}
              >
                <View className="w-9 h-9 rounded-xl items-center justify-center bg-amber-50 mr-3">
                  <Zap size={16} color="hsl(38 80% 50%)" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">{cone}</Text>
                  <Text className="text-xs text-muted-foreground">{CONE_TEMPS_CELSIUS[cone]}°C</Text>
                </View>
                {selected && (
                  <View className="w-6 h-6 rounded-full bg-amber-500 items-center justify-center">
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clear default button */}
        {defaultGlazeTemp && (
          <TouchableOpacity
            onPress={() => setDefaultGlazeTemp(null)}
            className="mt-3 items-center py-3"
          >
            <Text className="text-sm text-muted-foreground">Clear default</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
