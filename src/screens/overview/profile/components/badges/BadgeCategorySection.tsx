import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { BadgeCategory } from '../../constants/badgeRegistry';

const CATEGORY_ACCENTS: Record<BadgeCategory, string> = {
  kiln: '#D4644A',
  atlas: '#5B8FA8',
  volume: '#6B8FC4',
  technique: '#B87BB8',
  studio: '#6B9E78',
  memorial: '#8B7355',
  sales: '#C98352',
  mastery: '#C9A227',
  consistency: '#7B6FD6',
  community: '#E07A5F',
};

export function BadgeCategorySection({
  category,
  label,
  children,
}: {
  category: BadgeCategory;
  label: string;
  children: React.ReactNode;
}) {
  const accent = CATEGORY_ACCENTS[category];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <LinearGradient
          colors={[accent, accent + '88']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.accentBar}
        />
        <Text style={[styles.headerLabel, { color: accent }]}>{label}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.grid}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  accentBar: {
    width: 28,
    height: 4,
    borderRadius: 99,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'hsl(34 34% 84%)',
    backgroundColor: 'hsl(40 50% 99%)',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
});
