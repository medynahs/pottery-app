import { SettingsGroup } from '@/src/components/SettingsGroup';
import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Plus, Repeat2, Trash2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RhythmIconBadge } from './components/RhythmIconBadge';
import { RhythmScreenHeader } from './components/RhythmScreenHeader';
import { RhythmTipCard } from './components/RhythmTipCard';
import { resolveRitualIcon } from './studioRhythmIcons';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StudioRhythmRitualsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rituals = useAppStore((s) => s.studioRhythm.rituals);
  const toggleRitual = useAppStore((s) => s.toggleStudioRitual);
  const removeRitual = useAppStore((s) => s.removeStudioRitual);

  return (
    <View className="flex-1 bg-background">
      <RhythmScreenHeader
        title="Studio rituals"
        subtitle="Optional: weekly habits like cleanup or glaze mixing"
      />

      <ScrollView
        className="flex-1 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mb-4">
          <RhythmTipCard
            title="What are rituals?"
            body="Small repeating tasks you want to remember. Toggle on the ones that fit, you can always add custom rituals later."
          />
        </View>
        <View className="flex-row items-center justify-between px-6 mb-2">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your rituals
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/profile/studio-rhythm/ritual')}
            activeOpacity={0.8}
            className="flex-row items-center gap-1 rounded-full bg-primary px-3 py-1.5"
          >
            <Plus size={12} color="#fff" />
            <Text className="text-xs font-semibold text-primary-foreground">Add ritual</Text>
          </TouchableOpacity>
        </View>

        <SettingsGroup>
          <Text className="text-xs text-muted-foreground pt-3 pb-2 leading-5">
            Toggle on the rituals that fit your week. Tap a row to edit it.
          </Text>
          {rituals.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-sm font-semibold text-foreground mb-1">No rituals yet</Text>
              <Text className="text-xs text-muted-foreground text-center leading-5 mb-4 px-4">
                Add glaze mixing, cleanup, or photo days to your rhythm.
              </Text>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl px-4 mb-3"
                onPress={() => router.push('/profile/studio-rhythm/ritual')}
              >
                <Text className="text-sm">Create a ritual</Text>
              </Button>
            </View>
          ) : (
            rituals.map((ritual, idx) => {
              const Icon = resolveRitualIcon(ritual);
              return (
                <View
                  key={ritual.id}
                  className={`flex-row items-center gap-3 py-3.5 ${
                    idx < rituals.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/profile/studio-rhythm/ritual', params: { id: ritual.id } })}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-3 flex-1"
                  >
                    <RhythmIconBadge
                      Icon={Icon}
                      color={ritual.enabled ? 'hsl(39 57% 51%)' : 'hsl(24 20% 55%)'}
                      backgroundColor={ritual.enabled ? 'hsl(39 55% 96%)' : 'hsl(34 20% 96%)'}
                      size="md"
                    />
                    <View className="flex-1">
                      <Text className={`text-sm font-semibold ${ritual.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {ritual.label}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Repeat2 size={10} color="hsl(24 20% 55%)" />
                        <Text className="text-xs text-muted-foreground capitalize">
                          {ritual.cadence}
                          {ritual.dayOfWeek !== undefined ? ` · ${DAY_LABELS[ritual.dayOfWeek]}` : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-2">
                    <Switch
                      value={ritual.enabled}
                      onValueChange={() => toggleRitual(ritual.id)}
                      trackColor={{ false: 'hsl(34 25% 82%)', true: '#8B6A2A' }}
                      thumbColor="#fff"
                    />
                    {ritual.id.startsWith('ritual-custom-') && (
                      <TouchableOpacity
                        onPress={() => removeRitual(ritual.id)}
                        activeOpacity={0.7}
                        className="w-8 h-8 rounded-lg items-center justify-center bg-red-50 border border-red-100"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Trash2 size={14} color="hsl(0 55% 45%)" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}
