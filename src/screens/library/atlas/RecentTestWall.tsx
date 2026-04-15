import { Text } from '@/src/components/ui/text';
import {
    GLAZE_THICKNESS_LABELS,
    type GlazeLibraryItem,
    type GlazeTestTile,
} from '@/src/screens/glazes/types';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { formatShortDate, glazeCardColor } from './helpers';

export function RecentTestWall({
  recentTests,
  glazes,
}: {
  recentTests: GlazeTestTile[];
  glazes: GlazeLibraryItem[];
}) {
  return (
    <>
      <View
        style={{
          marginHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#3A2810' }}
          >
            Recent Test Wall
          </Text>
          <Text style={{ fontSize: 10, color: '#A68555', marginTop: 2 }}>
            Latest glaze behavior snapshots
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {recentTests.map((test) => {
          const colorFamily =
            glazes.find((g) => g.id === test.glazeId)?.colorFamily ?? test.glazeNameSnapshot;
          const surfaceColor = glazeCardColor(colorFamily);
          return (
            <View
              key={test.id}
              style={{
                width: 148,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#E8D9BE',
                backgroundColor: '#FFFBF4',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 108,
                  backgroundColor: surfaceColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '700',
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                    color: 'rgba(58,40,16,0.7)',
                  }}
                >
                  {test.resultRating === 'great'
                    ? 'Success'
                    : test.resultRating === 'interesting'
                      ? 'Interesting'
                      : 'Retry'}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Fraunces_600SemiBold',
                    fontSize: 13,
                    color: '#3A2810',
                    textAlign: 'center',
                    marginTop: 6,
                  }}
                  numberOfLines={2}
                >
                  {test.glazeNameSnapshot}
                </Text>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#3A2810' }}>
                  {test.clayBody}
                </Text>
                <Text style={{ fontSize: 10, color: '#A68555', marginTop: 2 }}>
                  {test.cone} · {GLAZE_THICKNESS_LABELS[test.thickness]}
                </Text>
                <Text style={{ fontSize: 10, color: '#A68555', marginTop: 1 }}>
                  {formatShortDate(test.firingDate)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={{
          marginHorizontal: 24,
          marginTop: 24,
          marginBottom: 20,
          height: 1,
          backgroundColor: '#E8D9BE',
        }}
      />
    </>
  );
}
