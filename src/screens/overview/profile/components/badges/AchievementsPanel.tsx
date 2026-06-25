import { Text } from '@/src/components/ui/text';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  BADGE_CATEGORY_ORDER,
  BADGE_CATEGORY_LABELS,
  groupBadgesByCategory,
  type BadgeCategory,
  type BadgeState,
} from '../../constants/badgeRegistry';
import { useBadgeStates } from '../../hooks/useBadgeStates';
import { useProfileLevel } from '../../hooks/useProfileLevel';
import { AchievementsHero } from './AchievementsHero';
import { BadgeCategorySection } from './BadgeCategorySection';
import { BadgeDetailSheet } from './BadgeDetailSheet';
import { BadgeGridTile } from './BadgeGridTile';

type StatusFilter = 'all' | 'earned' | 'in_progress';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'earned', label: 'Earned' },
  { id: 'in_progress', label: 'In progress' },
];

function filterByStatus(badges: BadgeState[], filter: StatusFilter): BadgeState[] {
  if (filter === 'earned') return badges.filter((b) => b.unlocked);
  if (filter === 'in_progress') return badges.filter((b) => !b.unlocked && b.progress > 0);
  return badges;
}

function FilterChip({
  label,
  active,
  onPress,
  variant,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  variant: 'status' | 'category';
}) {
  const isStatus = variant === 'status';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        isStatus ? styles.statusChip : styles.categoryChip,
        active && (isStatus ? styles.statusChipActive : styles.categoryChipActive),
      ]}
    >
      <Text
        style={[
          isStatus ? styles.statusChipLabel : styles.categoryChipLabel,
          active && (isStatus ? styles.statusChipLabelActive : styles.categoryChipLabelActive),
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function AchievementsPanel() {
  const badges = useBadgeStates();
  const level = useProfileLevel();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory | 'all'>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeState | null>(null);

  const visibleBadges = useMemo(() => {
    let result = filterByStatus(badges, statusFilter);
    if (categoryFilter !== 'all') {
      result = result.filter((b) => b.category === categoryFilter);
    }
    return result;
  }, [badges, statusFilter, categoryFilter]);

  const groups = useMemo(
    () => groupBadgesByCategory(visibleBadges).filter((g) => g.badges.length > 0),
    [visibleBadges],
  );

  const showGrouped = categoryFilter === 'all' && statusFilter === 'all';

  return (
    <>
      <View style={styles.panel}>
        <AchievementsHero
          title={level.title}
          nextTitle={level.nextTitle}
          badgesUntilNext={level.badgesUntilNext}
          earnedCount={level.earnedCount}
          totalBadges={level.totalBadges}
        />

        <Text style={styles.hint}>Tap a badge for details and progress</Text>

        <View style={styles.chipRow}>
          {STATUS_FILTERS.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              active={statusFilter === option.id}
              onPress={() => setStatusFilter(option.id)}
              variant="status"
            />
          ))}
        </View>

        <View style={styles.chipRow}>
          <FilterChip
            label="All"
            active={categoryFilter === 'all'}
            onPress={() => setCategoryFilter('all')}
            variant="category"
          />
          {BADGE_CATEGORY_ORDER.map((cat) => (
            <FilterChip
              key={cat}
              label={BADGE_CATEGORY_LABELS[cat]}
              active={categoryFilter === cat}
              onPress={() => setCategoryFilter(cat)}
              variant="category"
            />
          ))}
        </View>

        <View style={styles.gridWrap}>
          {visibleBadges.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyText}>
                {statusFilter === 'earned'
                  ? 'Keep making and logging — badges appear as you go.'
                  : statusFilter === 'in_progress'
                    ? 'Start a milestone to track progress here.'
                    : 'Try a different filter.'}
              </Text>
            </View>
          ) : showGrouped ? (
            groups.map((group) => (
              <BadgeCategorySection key={group.category} category={group.category} label={group.label}>
                {group.badges.map((badge) => (
                  <BadgeGridTile
                    key={badge.id}
                    badge={badge}
                    onPress={() => setSelectedBadge(badge)}
                  />
                ))}
              </BadgeCategorySection>
            ))
          ) : (
            <View style={styles.gridCard}>
              <View style={styles.gridInner}>
                {visibleBadges.map((badge) => (
                  <BadgeGridTile
                    key={badge.id}
                    badge={badge}
                    onPress={() => setSelectedBadge(badge)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {selectedBadge ? (
        <BadgeDetailSheet
          badge={selectedBadge}
          visible
          onClose={() => setSelectedBadge(null)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingBottom: 32,
  },
  hint: {
    fontSize: 12,
    color: 'hsl(32 28% 44%)',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'hsl(34 34% 84%)',
    backgroundColor: 'hsl(40 50% 99%)',
    marginRight: 8,
    marginBottom: 8,
  },
  statusChipActive: {
    backgroundColor: 'hsl(39 57% 51%)',
    borderColor: 'hsl(39 57% 51%)',
  },
  statusChipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'hsl(32 28% 44%)',
  },
  statusChipLabelActive: {
    color: '#FFF7EC',
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: 'hsl(35 42% 88%)',
  },
  categoryChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'hsl(32 28% 44%)',
  },
  categoryChipLabelActive: {
    color: 'hsl(24 55% 22%)',
  },
  gridWrap: {
    paddingHorizontal: 24,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'hsl(34 34% 84%)',
    backgroundColor: 'hsl(40 50% 99%)',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 18,
    color: 'hsl(24 55% 22%)',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: 'hsl(32 28% 44%)',
    marginTop: 8,
    lineHeight: 20,
  },
  gridCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'hsl(34 34% 84%)',
    backgroundColor: 'hsl(40 50% 99%)',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 4,
  },
  gridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
});
