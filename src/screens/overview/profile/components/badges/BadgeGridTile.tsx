import { Text } from '@/src/components/ui/text';
import { Check, Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { BadgeState } from '../../constants/badgeRegistry';
import { JOURNEY_PAGE } from '../../journeyTheme';

export function BadgeGridTile({
  badge,
  onPress,
}: {
  badge: BadgeState;
  onPress: () => void;
}) {
  const { name, icon: Icon, iconColor, progress, unlocked } = badge;
  const progressPct = Math.round(progress * 100);
  const size = 72;
  const stroke = unlocked ? 3 : 4;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = unlocked ? circumference : (progressPct / 100) * circumference;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={styles.tile}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${unlocked ? 'earned' : `${progressPct}% progress`}`}
    >
      <View style={{ width: size, height: size, marginBottom: 8 }}>
        {unlocked ? (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              backgroundColor: JOURNEY_PAGE.earnedGlow,
              transform: [{ scale: 1.08 }],
            }}
          />
        ) : null}

        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={unlocked ? JOURNEY_PAGE.goldRing : 'hsl(34 34% 84%)'}
            strokeWidth={stroke}
            fill={unlocked ? '#FFF9EE' : 'hsl(38 45% 97%)'}
          />
          {!unlocked ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(39 57% 51%)"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeLinecap="round"
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          ) : null}
        </Svg>

        <View style={[styles.iconWrap, { opacity: unlocked ? 1 : 0.75 }]}>
          <Icon size={26} color={iconColor} />
        </View>

        <View
          style={[
            styles.badgeMark,
            {
              backgroundColor: unlocked ? 'hsl(142 45% 42%)' : '#FFFBF2',
              borderColor: unlocked ? 'hsl(142 45% 42%)' : 'hsl(34 34% 84%)',
            },
          ]}
        >
          {unlocked ? (
            <Check size={11} color="white" strokeWidth={3} />
          ) : (
            <Lock size={10} color="hsl(24 20% 45%)" />
          )}
        </View>
      </View>

      <Text style={[styles.name, { color: unlocked ? 'hsl(24 55% 22%)' : 'hsl(32 28% 44%)' }]} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  name: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
