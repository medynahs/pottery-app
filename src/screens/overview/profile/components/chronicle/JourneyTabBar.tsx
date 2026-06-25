import { Text } from '@/src/components/ui/text';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export type JourneyTab = 'overview' | 'achievements';

const TABS: { id: JourneyTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'achievements', label: 'Achievements' },
];

export function JourneyTabBar({
  active,
  onChange,
}: {
  active: JourneyTab;
  onChange: (tab: JourneyTab) => void;
}) {
  return (
    <View style={styles.shell}>
      <View style={styles.track}>
        {TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onChange(tab.id)}
              activeOpacity={0.85}
              style={[styles.tab, selected && styles.tabSelected]}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              <Text style={[styles.tabLabel, selected ? styles.tabLabelSelected : styles.tabLabelIdle]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'hsl(40 50% 99%)',
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(34 34% 84%)',
  },
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'hsl(35 42% 88%)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabSelected: {
    backgroundColor: 'hsl(40 50% 99%)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabLabelSelected: {
    color: 'hsl(24 55% 22%)',
  },
  tabLabelIdle: {
    color: 'hsl(32 28% 44%)',
  },
});
