import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import {
  GLAZE_RESULT_LABELS,
  GLAZE_THICKNESS_LABELS,
} from '@/src/screens/glazes/types';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { formatShortDate, glazeCardColor } from './helpers';
import { GlazeThumbnail } from './MediaSlot';

function resultTone(result: GlazeTestTile['resultRating']) {
  if (result === 'great') return { bg: 'bg-green-50 border-green-100', text: 'text-green-700' };
  if (result === 'bad') return { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700' };
  return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' };
}

export function RecentTestWall({
  recentTests,
  glazes,
  onLogTest,
  onPressTest,
}: {
  recentTests: GlazeTestTile[];
  glazes: GlazeLibraryItem[];
  onLogTest: () => void;
  onPressTest: (glazeId: string) => void;
}) {
  return (
    <View className="mt-8 mb-2">
      <View className="px-6 mb-3">
        <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
          Test Log
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          Recent firings across your studio — tap to open the glaze.
        </Text>
      </View>

      {recentTests.length === 0 ? (
        <View className="mx-6 rounded-2xl border border-dashed border-border bg-card/50 px-5 py-8 items-center">
          <Text className="text-sm text-muted-foreground text-center leading-5">
            No test tiles yet. After a firing, log the result here to track what worked.
          </Text>
          <TouchableOpacity onPress={onLogTest} className="mt-4 px-4 py-2 rounded-xl bg-primary">
            <Text className="text-xs font-semibold text-white">Log Test Tile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
        >
          {recentTests.map((test) => {
            const glaze = glazes.find((g) => g.id === test.glazeId);
            const tone = resultTone(test.resultRating);
            const photo = test.photoUri ?? glaze?.testTilePhotoUris[0] ?? glaze?.bucketPhotoUri;
            return (
              <TouchableOpacity
                key={test.id}
                activeOpacity={0.85}
                onPress={() => onPressTest(test.glazeId)}
                className="w-[152px] rounded-2xl border border-border bg-card overflow-hidden"
              >
                <GlazeThumbnail
                  uri={photo}
                  colorHex={glazeCardColor(glaze?.colorFamily ?? test.glazeNameSnapshot)}
                  size={152}
                  rounded={0}
                />
                <View className="p-3">
                  <View className={`self-start px-2 py-0.5 rounded-full border mb-1.5 ${tone.bg}`}>
                    <Text className={`text-[9px] font-bold uppercase ${tone.text}`}>
                      {GLAZE_RESULT_LABELS[test.resultRating]}
                    </Text>
                  </View>
                  <Text className="text-xs font-semibold text-foreground" numberOfLines={2}>
                    {test.glazeNameSnapshot}
                  </Text>
                  <Text className="text-[10px] text-muted-foreground mt-1">
                    {formatShortDate(test.firingDate)} · {test.clayBody}
                  </Text>
                  <Text className="text-[10px] text-muted-foreground">
                    {test.cone} · {GLAZE_THICKNESS_LABELS[test.thickness]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
