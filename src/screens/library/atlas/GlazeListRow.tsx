import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import {
  GLAZE_FINISH_LABELS,
  GLAZE_RESULT_LABELS,
} from '@/src/screens/glazes/types';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { formatShortDate, glazeCardColor } from './helpers';
import { GlazeThumbnail } from './MediaSlot';

function resultLabel(result: GlazeTestTile['resultRating']) {
  return GLAZE_RESULT_LABELS[result];
}

export function GlazeListRow({
  glaze,
  lastTest,
}: {
  glaze: GlazeLibraryItem;
  lastTest?: GlazeTestTile;
}) {
  const router = useRouter();
  const photo =
    glaze.bucketPhotoUri ??
    glaze.testTilePhotoUris[0] ??
    lastTest?.photoUri;

  return (
    <Pressable
      onPress={() => router.push(`/glaze/${glaze.id}` as never)}
      className="flex-row items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card active:opacity-85"
    >
      <GlazeThumbnail
        uri={photo}
        colorHex={glazeCardColor(glaze.colorFamily)}
        size={56}
        rounded={14}
      />
      <View className="flex-1 min-w-0">
        <Text className="text-base text-foreground font-semibold" numberOfLines={1}>
          {glaze.name}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          {glaze.defaultCone || glaze.coneRange} · {GLAZE_FINISH_LABELS[glaze.finish]}
        </Text>
        {lastTest ? (
          <Text className="text-[11px] text-muted-foreground mt-1">
            Last test: {resultLabel(lastTest.resultRating)} · {formatShortDate(lastTest.firingDate)}
          </Text>
        ) : (
          <Text className="text-[11px] text-muted-foreground mt-1">No tests logged yet</Text>
        )}
      </View>
      {glaze.favorite ? (
        <Star size={16} color="hsl(38 80% 50%)" fill="hsl(38 80% 50%)" />
      ) : null}
    </Pressable>
  );
}
