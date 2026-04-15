import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

export function StatsStrip({
  glazeCount,
  testCount,
  collectionCount,
}: {
  glazeCount: number;
  testCount: number;
  collectionCount: number;
}) {
  const stats = [
    { label: 'Glazes', value: glazeCount },
    { label: 'Tests', value: testCount },
    { label: 'Collections', value: collectionCount },
  ];

  return (
    <View
      style={{
        marginHorizontal: 24,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {stats.map(({ label, value }, i) => (
        <React.Fragment key={label}>
          <View>
            <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: '#3A2810' }}>
              {value}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: '#A68555',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
              }}
            >
              {label}
            </Text>
          </View>
          {i < stats.length - 1 && (
            <View style={{ width: 1, height: 30, backgroundColor: '#D9C9A8' }} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
