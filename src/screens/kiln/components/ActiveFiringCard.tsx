// src/screens/kiln/components/ActiveFiringCard.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import type { Firing, FiringState } from '../../../types/kiln';
import { FIRING_TYPE_LABELS } from '../constants';
import {
    getAutoFiringStatus,
    getCalculatedTimeline
} from '../firingEstimations';
import { KILN_UI } from '../utils/kilnTheme';

/** Warm brown gradients, stronger contrast at top, cream at bottom */
const FIRING_GRADIENT: Record<FiringState, [string, string, string]> = {
  scheduled: ['#D4C4A8', '#EDE4D3', KILN_UI.cream],
  loading:   ['#C9A66B', '#E8D9BE', KILN_UI.cream],
  firing:    ['#A67C52', '#DCC9A3', KILN_UI.cream],
  cooling:   ['#8B7355', '#D4C4A8', KILN_UI.cream],
  unloading: ['#6B5344', '#C9B896', KILN_UI.cream],
  completed: ['#5C4A32', '#B8A882', KILN_UI.cream],
};

const AUTO_STATUS_GRADIENT: Record<string, FiringState> = {
  waiting:  'scheduled',
  firing:   'firing',
  cooling:  'cooling',
  ready:    'unloading',
  completed:'completed',
};

const AUTO_STATUS_ACCENT: Record<string, string> = {
  waiting: KILN_UI.brownMuted,
  firing: '#6B4423',
  cooling: '#5C4033',
  ready: KILN_UI.brown,
  completed: '#3D5C2E',
};

const MILESTONE_LABELS: [string, string, string] = ['Queued', 'Firing', 'Ready'];

function MilestoneStrip({
  autoStatus,
  submittedLabel,
  firesOnLabel,
  readyOnLabel,
  accentColor,
}: {
  autoStatus: string;
  submittedLabel: string;
  firesOnLabel: string;
  readyOnLabel: string;
  accentColor: string;
}) {
  const currentIdx = autoStatus === 'waiting' ? 0 : autoStatus === 'firing' || autoStatus === 'cooling' ? 1 : 2;
  const dateLabels = [submittedLabel, `~${firesOnLabel}`, `~${readyOnLabel}`];
  const trackColor = 'rgba(58, 40, 16, 0.18)';
  const muted = 'rgba(58, 40, 16, 0.35)';

  return (
    <View className="w-full">
      <View
        style={{
          position: 'absolute',
          top: 6,
          left: '12%',
          right: '12%',
          height: 2,
          backgroundColor: trackColor,
          zIndex: 0,
        }}
      />
      <View className="flex-row justify-between mb-1">
        {MILESTONE_LABELS.map((label, i) => {
          const isPast = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <View key={label} className="items-center" style={{ flex: 1 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: isPast || isCurrent ? accentColor : trackColor,
                  borderWidth: isCurrent ? 2.5 : 0,
                  borderColor: isCurrent ? KILN_UI.cream : 'transparent',
                  transform: [{ scale: isCurrent ? 1.35 : 1 }],
                  zIndex: 1,
                  marginBottom: 5,
                }}
              />
              <Text
                className="text-center"
                style={{
                  fontSize: 10,
                  fontWeight: isCurrent ? '700' : '500',
                  color: isCurrent ? accentColor : muted,
                }}
              >
                {label}
              </Text>
              <Text
                className="text-center"
                style={{ fontSize: 9, color: muted, marginTop: 1 }}
              >
                {dateLabels[i]}
              </Text>
            </View>
          );
        })}
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

  const autoStatus = getAutoFiringStatus(liveFiring, kiln);
  const timeline = getCalculatedTimeline(liveFiring, kiln);

  const gradientKey = AUTO_STATUS_GRADIENT[autoStatus] ?? 'scheduled';
  const gradient = FIRING_GRADIENT[gradientKey];
  const accentColor = AUTO_STATUS_ACCENT[autoStatus] ?? KILN_UI.brown;

  const statusLabel =
    autoStatus === 'waiting'  ? 'In Queue' :
    autoStatus === 'firing'   ? 'Firing'   :
    autoStatus === 'cooling'  ? 'Cooling'  :
    autoStatus === 'ready'    ? 'Ready for Pickup' :
                                'Completed';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} className="mb-3">
      <Card
        className="overflow-hidden"
        style={{ borderWidth: 1, borderColor: KILN_UI.brownSoftBorder, padding: 0 }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View className="h-1" style={{ backgroundColor: accentColor }} />

          <View className="px-3.5 pt-3 pb-3 items-center">
            <Image
              source={require('../../../../assets/animations/activeOven.gif')}
              style={{ width: 72, height: 72, marginBottom: 6 }}
              resizeMode="contain"
            />

            <View
              className="px-2.5 py-0.5 rounded-full mb-2 border"
              style={{
                backgroundColor: KILN_UI.brownSoft,
                borderColor: KILN_UI.brownSoftBorder,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: accentColor }}>
                {statusLabel}
              </Text>
            </View>

            <Text
              className="text-lg font-serif font-bold mb-0.5 text-center"
              style={{ color: KILN_UI.brown }}
              numberOfLines={1}
            >
              {liveFiring.name}
            </Text>

            <Text className="text-xs mb-3 text-center" style={{ color: KILN_UI.brownMuted }} numberOfLines={1}>
              {FIRING_TYPE_LABELS[liveFiring.type]} · Cone {liveFiring.cone}
              {kiln ? ` · ${kiln.name}` : ''}
              {` · ${liveFiring.pieceIds.length} piece${liveFiring.pieceIds.length !== 1 ? 's' : ''}`}
            </Text>

            <View className="w-full mb-2">
              <MilestoneStrip
                autoStatus={autoStatus}
                submittedLabel={timeline.submittedLabel}
                firesOnLabel={timeline.firesOnLabel}
                readyOnLabel={timeline.readyOnLabel}
                accentColor={accentColor}
              />
            </View>

            <Text className="text-xs font-semibold mt-2" style={{ color: accentColor }}>
              Tap to view details ›
            </Text>
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );
}
