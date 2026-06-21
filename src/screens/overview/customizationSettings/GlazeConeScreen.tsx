import { CustomizationSettingsShell } from '@/src/components/settings/CustomizationSettingsShell';
import { Text } from '@/src/components/ui/text';
import { CONE_TEMPS_CELSIUS, GLAZE_TEMPS } from '@/src/screens/pieces/utils/constants';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { Check, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function GlazeConeScreen() {
  const router = useRouter();
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const setDefaultGlazeTemp = useAppStore((s) => s.setDefaultGlazeTemp);
  const markSetupProgress = useAppStore((s) => s.markSetupProgress);
  const [draft, setDraft] = useState<string | null>(defaultGlazeTemp);

  function handleSelect(cone: string) {
    setDraft((prev) => (prev === cone ? null : cone));
  }

  function handleSave() {
    setDefaultGlazeTemp(draft);
    markSetupProgress('glazeConeReviewed');
    router.back();
  }

  return (
    <CustomizationSettingsShell
      eyebrow="Firing defaults"
      title="Choose your glaze cone"
      subtitle="This cone will be pre-selected when you add a new piece. You can still override it per piece."
      onBack={() => router.back()}
      onSave={handleSave}
    >
      <View className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-4 flex-row items-start gap-3">
        <Zap size={16} color="hsl(38 80% 50%)" className="mt-0.5" />
        <Text className="text-xs text-amber-700 flex-1 leading-relaxed">
          Glaze firings are usually hotter than bisque. Match this to the cone your glazes are formulated for.
        </Text>
      </View>

      <View className="bg-card rounded-2xl border border-border overflow-hidden">
        {GLAZE_TEMPS.map((cone, index) => {
          const selected = draft === cone;
          const isLast = index === GLAZE_TEMPS.length - 1;
          return (
            <TouchableOpacity
              key={cone}
              onPress={() => handleSelect(cone)}
              activeOpacity={0.7}
              className={`flex-row items-center px-4 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}
              style={selected ? { backgroundColor: 'rgba(242, 194, 94, 0.22)' } : undefined}
            >
              <View className="w-9 h-9 rounded-xl items-center justify-center bg-amber-50 mr-3">
                <Zap size={16} color="hsl(38 80% 50%)" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">{cone}</Text>
                <Text className="text-xs text-muted-foreground">{CONE_TEMPS_CELSIUS[cone]}°C</Text>
              </View>
              {selected ? (
                <View className="w-6 h-6 rounded-full bg-amber-500 items-center justify-center">
                  <Check size={14} color="#fff" strokeWidth={3} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {draft ? (
        <TouchableOpacity onPress={() => setDraft(null)} className="mt-3 items-center py-3">
          <Text className="text-sm text-muted-foreground">Clear selection</Text>
        </TouchableOpacity>
      ) : null}
    </CustomizationSettingsShell>
  );
}
