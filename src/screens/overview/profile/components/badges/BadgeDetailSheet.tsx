import { ModalCard, ModalShell, ModalSheetHeader } from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Lock, Sparkles } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { BadgeState } from '../../constants/badgeRegistry';
import { JOURNEY_PAGE } from '../../journeyTheme';

export function BadgeDetailSheet({
  badge,
  visible,
  onClose,
}: {
  badge: BadgeState;
  visible: boolean;
  onClose: () => void;
}) {
  const { name, desc, icon: Icon, iconColor, current, target, progress, unlocked } = badge;
  const progressPct = Math.round(progress * 100);

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard variant={unlocked ? 'pottery' : 'default'} withHandle={false}>
        <ModalSheetHeader>
          <View style={styles.headerRow}>
            {unlocked ? <Sparkles size={16} color="hsl(35 65% 32%)" /> : null}
            <Text style={[styles.headerTitle, unlocked ? styles.headerTitleUnlocked : undefined]}>
              {unlocked ? 'Achievement unlocked' : 'Achievement'}
            </Text>
          </View>
        </ModalSheetHeader>

        <View style={styles.body}>
          <View style={styles.iconBlock}>
            {unlocked ? (
              <LinearGradient
                colors={['#F5E8C8', '#FFFBF2']}
                style={styles.iconCircleUnlocked}
              >
                <Icon size={44} color={iconColor} />
              </LinearGradient>
            ) : (
              <View style={styles.iconCircleLocked}>
                <Icon size={44} color={iconColor} />
              </View>
            )}

            <View
              style={[
                styles.statusMark,
                {
                  backgroundColor: unlocked ? 'hsl(142 45% 42%)' : '#FFFBF2',
                  borderColor: unlocked ? 'hsl(142 45% 42%)' : JOURNEY_PAGE.parchmentBorder,
                },
              ]}
            >
              {unlocked ? (
                <Check size={16} color="white" strokeWidth={3} />
              ) : (
                <Lock size={14} color="hsl(24 20% 45%)" />
              )}
            </View>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.desc}>{desc}</Text>

          {unlocked ? (
            <View style={styles.earnedPill}>
              <Text style={styles.earnedLabel}>Earned</Text>
            </View>
          ) : (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Progress</Text>
                <Text style={styles.progressCount}>
                  {current}/{target}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
              <Text style={styles.progressHint}>{progressPct}% there — keep at it!</Text>
            </View>
          )}
        </View>
      </ModalCard>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'hsl(32 28% 44%)',
  },
  headerTitleUnlocked: {
    color: 'hsl(24 55% 22%)',
  },
  body: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  iconBlock: {
    position: 'relative',
    marginBottom: 16,
  },
  iconCircleUnlocked: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: JOURNEY_PAGE.goldRing,
  },
  iconCircleLocked: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'hsl(34 34% 84%)',
    backgroundColor: 'hsl(35 42% 88%)',
  },
  statusMark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  name: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: 'hsl(24 55% 22%)',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: 'hsl(32 28% 44%)',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  earnedPill: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(242, 194, 94, 0.2)',
    borderColor: JOURNEY_PAGE.goldRing,
  },
  earnedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'hsl(35 65% 32%)',
  },
  progressCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: JOURNEY_PAGE.parchmentBorder,
    backgroundColor: '#FFFBF2',
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'hsl(24 55% 22%)',
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '600',
    color: 'hsl(32 28% 44%)',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'hsl(35 42% 88%)',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'hsl(39 57% 51%)',
  },
  progressHint: {
    fontSize: 11,
    color: 'hsl(32 28% 44%)',
  },
});
