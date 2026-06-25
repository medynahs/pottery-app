import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Zap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { JOURNEY_PAGE } from '../../journeyTheme';

export function AchievementsHero({
  title,
  nextTitle,
  badgesUntilNext,
  earnedCount,
  totalBadges,
}: {
  title: string;
  nextTitle: string | null;
  badgesUntilNext: number;
  earnedCount: number;
  totalBadges: number;
}) {
  const pct = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;
  const ringSize = 84;
  const stroke = 8;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <View style={styles.shell}>
      <LinearGradient
        colors={[...JOURNEY_PAGE.achievementsGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.row}>
          <View style={{ width: ringSize, height: ringSize }}>
            <Svg width={ringSize} height={ringSize}>
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="rgba(58, 40, 16, 0.12)"
                strokeWidth={stroke}
                fill="rgba(255, 251, 242, 0.7)"
              />
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={JOURNEY_PAGE.goldRing}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeLinecap="round"
                rotation={-90}
                origin={`${ringSize / 2}, ${ringSize / 2}`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={styles.pctText}>{pct}%</Text>
            </View>
          </View>

          <View style={styles.copy}>
            <View style={styles.labelRow}>
              <Sparkles size={12} color="hsl(35 65% 32%)" />
              <Text style={styles.label}>Collection</Text>
            </View>
            <View style={styles.titleRow}>
              <Zap size={16} color="hsl(39 57% 51%)" />
              <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.subtitle}>
              {earnedCount}/{totalBadges} earned
              {nextTitle ? ` · ${badgesUntilNext} until ${nextTitle}` : ' · complete'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradient: {
    shadowColor: JOURNEY_PAGE.scrollShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: 'hsl(24 55% 22%)',
  },
  copy: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'hsl(35 65% 32%)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 20,
    fontWeight: '700',
    color: 'hsl(24 55% 22%)',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 20,
    color: 'hsl(32 28% 44%)',
  },
});
