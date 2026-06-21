import { CustomizationSettingsShell } from '@/src/components/settings/CustomizationSettingsShell';
import { Text } from '@/src/components/ui/text';
import { BISQUE_TEMPS, CONE_TEMPS_CELSIUS } from '@/src/screens/pieces/utils/constants';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { Check, Flame } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function BisqueConeScreen() {
  const router = useRouter();
  const defaultBisqueTemp = useAppStore((s) => s.defaultBisqueTemp);
  const setDefaultBisqueTemp = useAppStore((s) => s.setDefaultBisqueTemp);
  const markSetupProgress = useAppStore((s) => s.markSetupProgress);
  const [draft, setDraft] = useState<string | null>(defaultBisqueTemp);

  function handleSelect(cone: string) {
    setDraft((prev) => (prev === cone ? null : cone));
  }

  function handleSave() {
    setDefaultBisqueTemp(draft);
    markSetupProgress('bisqueConeReviewed');
    router.back();
  }

  return (
    <CustomizationSettingsShell
      eyebrow="Firing defaults"
      title="Choose your bisque cone"
      subtitle="This cone will be pre-selected when you add a new piece. You can still override it per piece."
      onBack={() => router.back()}
      onSave={handleSave}
    >
      <View className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-4 flex-row items-start gap-3">
        <Flame size={16} color="hsl(39 57% 51%)" className="mt-0.5" />
        <Text className="text-xs text-primary flex-1 leading-relaxed">
          Bisque firings are usually lower than glaze firings. Pick the cone you use most often at your studio or kiln.
        </Text>
      </View>

      <View className="bg-card rounded-2xl border border-border overflow-hidden">
        {BISQUE_TEMPS.map((cone, index) => {
          const selected = draft === cone;
          const isLast = index === BISQUE_TEMPS.length - 1;
          return (
            <TouchableOpacity
              key={cone}
              onPress={() => handleSelect(cone)}
              activeOpacity={0.7}
              className={`flex-row items-center px-4 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}
              style={selected ? { backgroundColor: 'rgba(242, 194, 94, 0.22)' } : undefined}
            >
              <View className="w-9 h-9 rounded-xl items-center justify-center bg-primary/10 mr-3">
                <Flame size={16} color="hsl(39 57% 51%)" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">{cone}</Text>
                <Text className="text-xs text-muted-foreground">{CONE_TEMPS_CELSIUS[cone]}°C</Text>
              </View>
              {selected ? (
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
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
