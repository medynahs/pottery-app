// src/screens/kiln/components/ActiveFiringCard.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { LinearGradient } from 'expo-linear-gradient';
import { Layers, Timer } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { FIRING_STATE_LABELS, FIRING_STATE_ORDER, FIRING_TYPE_LABELS } from '../constants';
import { formatReadyDate, getExpectedReadyAt } from '../firingEstimations';
import type { Firing, FiringState } from '../types';
import { FIRING_STATE_COLOR, formatDate } from './kilnUtils';

/** Per-state gradient: warm at top fading to card background at bottom */
const FIRING_GRADIENT: Record<FiringState, [string, string, string]> = {
  scheduled: ['#dbeafe', '#eff6ff', '#ffffff'],
  loading:   ['#fef3c7', '#fffbeb', '#ffffff'],
  firing:    ['#ffedd5', '#fff7ed', '#ffffff'],
  cooling:   ['#cffafe', '#ecfeff', '#ffffff'],
  unloading: ['#dcfce7', '#f0fdf4', '#ffffff'],
  completed: ['#dcfce7', '#f0fdf4', '#ffffff'],
};

const ACTIVE_STATES = ['loading', 'firing', 'cooling', 'unloading'] as const;
const ACTIVE_STATE_LABELS: Record<string, string> = {
  loading: 'Loading Kiln',
  firing: 'Firing',
  cooling: 'Cooling Down',
  unloading: 'Ready to Unload',
};

function FiringProgressBar({ state }: { state: string }) {
  const totalSteps = FIRING_STATE_ORDER.length - 1; // exclude 'completed'
  const currentIdx = FIRING_STATE_ORDER.indexOf(state as any);
  const progress = currentIdx < 0 ? 0 : currentIdx / totalSteps;

  return (
    <View className="w-full">
      <View className="flex-row justify-between mb-2">
        <Text className="text-xs font-semibold text-foreground">Progress</Text>
        <Text className="text-xs font-semibold text-foreground">
          {FIRING_STATE_LABELS[state as keyof typeof FIRING_STATE_LABELS] ?? state}
        </Text>
      </View>
      <View
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
      >
        <View
          className="h-2 rounded-full"
          style={{
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: FIRING_STATE_COLOR[state as keyof typeof FIRING_STATE_COLOR] ?? 'hsl(15 80% 52%)',
          }}
        />
      </View>
      <View className="flex-row justify-between mt-1.5">
        {FIRING_STATE_ORDER.filter((s) => s !== 'completed').map((s) => (
          <View
            key={s}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor:
                FIRING_STATE_ORDER.indexOf(s) <= currentIdx
                  ? FIRING_STATE_COLOR[state as keyof typeof FIRING_STATE_COLOR] ?? 'hsl(15 80% 52%)'
                  : 'rgba(0,0,0,0.15)',
            }}
          />
        ))}
      </View>
    </View>
  );
}

interface ActiveFiringCardProps {
  firing: Firing;
  onPress: () => void;
}

export function ActiveFiringCard({ firing, onPress }: ActiveFiringCardProps) {
  const kiln = useAppStore((s) => s.kilns.find((k) => k.id === firing.kilnId));
  const liveFiring = useAppStore((s) => s.firings.find((f) => f.id === firing.id)) ?? firing;
  const stateColor = FIRING_STATE_COLOR[liveFiring.state];
  const gradient = FIRING_GRADIENT[liveFiring.state];
  const expectedReadyAt = getExpectedReadyAt(liveFiring, kiln);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} className="mb-3">
      <Card
        className="overflow-hidden"
        style={{ borderWidth: 1.25, borderColor: stateColor, padding: 0 }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          {/* Accent top strip */}
          <View className="h-1" style={{ backgroundColor: stateColor }} />

          <View className="px-3.5 pt-3 pb-3 items-center">
            <Image
              source={require('../../../../assets/animations/activeOven.gif')}
              style={{ width: 82, height: 82, marginBottom: 6 }}
              resizeMode="contain"
            />

            {/* Firing name */}
            <Text className="text-lg font-serif font-bold text-foreground mb-0.5 text-center" numberOfLines={1}>
              {liveFiring.name}
            </Text>

            {/* Subtitle */}
            <Text className="text-xs text-muted-foreground mb-2 text-center" numberOfLines={1}>
              {FIRING_TYPE_LABELS[liveFiring.type]} · Cone {liveFiring.cone}
              {kiln ? ` · ${kiln.name}` : ''}
            </Text>

            {/* Progress bar */}
            <View className="w-full mb-2">
              <FiringProgressBar state={liveFiring.state} />
            </View>

            {/* Stats row */}
            <View className="flex-row gap-2 w-full">
              <View
                className="flex-1 rounded-xl p-2 items-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              >
                <Layers size={13} color="hsl(24 20% 40%)" />
                <Text className="text-xs font-semibold text-foreground mt-1">
                  {liveFiring.pieceIds.length} piece{liveFiring.pieceIds.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View
                className="flex-1 rounded-xl p-2 items-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              >
                <Timer size={13} color="hsl(24 20% 40%)" />
                <Text className="text-xs font-semibold text-foreground mt-1">
                  {liveFiring.startedAt ? `Since ${formatDate(liveFiring.startedAt)}` : 'Not started'}
                </Text>
              </View>
            </View>

            <Text className="text-xs text-muted-foreground mt-2">
              Expected ready: <Text className="font-semibold text-foreground">{formatReadyDate(expectedReadyAt)}</Text>
            </Text>

            {liveFiring.notes ? (
              <Text className="text-xs text-muted-foreground mt-2 italic text-center" numberOfLines={1}>
                {liveFiring.notes}
              </Text>
            ) : null}

            <Text className="text-xs font-semibold mt-2" style={{ color: stateColor }}>
              Tap to view details ›
            </Text>
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );
}
