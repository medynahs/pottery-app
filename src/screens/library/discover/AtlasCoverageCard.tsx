import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { CORE_FINISHES, FINISH_LABEL } from './types';

export function AtlasCoverageCard({
  glazeCount,
  finishCounts,
  missingFinishes,
}: {
  glazeCount: number;
  finishCounts: Record<string, number>;
  missingFinishes: string[];
}) {
  if (glazeCount === 0) {
    return (
      <View
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: '#D9C9A8',
          backgroundColor: '#FFFBF4',
          padding: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 20 }}>🏺</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 13, color: '#3A2810' }}
          >
            Your atlas is empty
          </Text>
          <Text style={{ fontSize: 12, color: '#A68555', marginTop: 2, lineHeight: 17 }}>
            Save a recipe below to start tracking your glazes.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#D9C9A8',
        backgroundColor: '#FFFBF4',
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1.4,
          color: '#A68555',
          marginBottom: 10,
        }}
      >
        Your Atlas Coverage
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {CORE_FINISHES.map((f) => {
          const count = finishCounts[f] ?? 0;
          const has = count > 0;
          return (
            <View
              key={f}
              style={{
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: has ? '#F4EAD8' : '#F0EBE0',
                borderWidth: 1,
                borderColor: has ? '#D9C9A8' : '#E8DDD0',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: has ? '#8B6030' : '#C4B48C',
                }}
              >
                {has ? `${count} ${FINISH_LABEL[f]}` : `No ${FINISH_LABEL[f]}`}
              </Text>
            </View>
          );
        })}
      </View>
      {missingFinishes.length > 0 && (
        <Text style={{ fontSize: 11, color: '#A68555', marginTop: 10, lineHeight: 16 }}>
          No {missingFinishes[0].toLowerCase()} glazes yet, recipes below can fill the gap.
        </Text>
      )}
    </View>
  );
}
