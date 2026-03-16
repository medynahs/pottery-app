import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { generateStudioRhythmSuggestions } from '@/src/screens/overview/generateStudioRhythmSuggestions';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export function StudioRhythmPanel() {
  const router = useRouter();
  const pieces = useAppStore((state) => state.pieces);
  const firings = useAppStore((state) => state.firings);
  const studioRhythmConfig = useAppStore((state) => state.studioRhythmConfig);

  const suggestions = React.useMemo(
    () =>
      generateStudioRhythmSuggestions({
        pieces,
        firings,
        routineConfiguration: studioRhythmConfig,
        upcomingEvents: [],
      }),
    [firings, pieces, studioRhythmConfig]
  );

  return (
    <View className="gap-3">
      <Text className="text-lg font-serif font-bold text-foreground">Studio Rhythm</Text>
      <Text className="text-sm text-muted-foreground">Gentle observations from your studio today.</Text>

      {suggestions.length === 0 ? (
        <Card className="rounded-2xl border-border bg-card p-4">
          <Text className="text-sm text-muted-foreground">
            Studio feels steady right now. Follow your own pace.
          </Text>
        </Card>
      ) : (
        suggestions.map((suggestion) => (
          <Card key={suggestion.type} className="rounded-2xl border-border bg-card p-4">
            <Text className="text-sm text-foreground mb-3">{suggestion.text}</Text>
            <Button
              size="sm"
              variant="outline"
              className="self-start rounded-xl px-4"
              onPress={() => router.push(suggestion.route)}
            >
              <Text className="text-sm">{suggestion.actionLabel}</Text>
            </Button>
          </Card>
        ))
      )}
    </View>
  );
}
