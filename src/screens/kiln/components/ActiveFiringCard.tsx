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
import { FIRING_STATE_COLOR } from '../utils/kilnUtils';

/** Per-state gradient: warm at top fading to card background at bottom */
const FIRING_GRADIENT: Record<FiringState, [string, string, string]> = {
  scheduled: ['#dbeafe', '#eff6ff', '#ffffff'],
  loading:   ['#fef3c7', '#fffbeb', '#ffffff'],
  firing:    ['#ffedd5', '#fff7ed', '#ffffff'],
  cooling:   ['#cffafe', '#ecfeff', '#ffffff'],
  unloading: ['#dcfce7', '#f0fdf4', '#ffffff'],
  completed: ['#dcfce7', '#f0fdf4', '#ffffff'],
};

/** Map auto status → gradient key */
const AUTO_STATUS_GRADIENT: Record<string, FiringState> = {
  waiting:  'scheduled',
  firing:   'firing',
  cooling:  'cooling',
  ready:    'unloading',
  completed:'completed',
};

const MILESTONE_LABELS: [string, string, string] = ['Queued', 'Firing', 'Ready'];
const MILESTONE_AUTO_STATUSES = ['waiting', 'firing', 'ready'];

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
  const muted = 'rgba(0,0,0,0.18)';

  return (
    <View className="w-full">
      {/* Connector line behind dots */}
      <View style={{ position: 'absolute', top: 6, left: '12%', right: '12%', height: 2, backgroundColor: muted, zIndex: 0 }} />
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
                  backgroundColor: isPast || isCurrent ? accentColor : muted,
                  borderWidth: isCurrent ? 2.5 : 0,
                  borderColor: isCurrent ? accentColor : 'transparent',
                  transform: [{ scale: isCurrent ? 1.35 : 1 }],
                  zIndex: 1,
                  marginBottom: 5,
                }}
              />
              <Text
                className="text-center"
                style={{
                  fontSize: 10,
                  fontWeight: isCurrent ? '700' : '400',
                  color: isCurrent ? accentColor : 'rgba(0,0,0,0.45)',
                }}
              >
                {label}
              </Text>
              <Text
                className="text-center"
                style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', marginTop: 1 }}
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
  const accentColor = FIRING_STATE_COLOR[gradientKey] ?? 'hsl(15 80% 52%)';

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
        style={{ borderWidth: 1.25, borderColor: accentColor, padding: 0 }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          {/* Accent top strip */}
          <View className="h-1" style={{ backgroundColor: accentColor }} />

          <View className="px-3.5 pt-3 pb-3 items-center">
            <Image
              source={require('../../../../assets/animations/activeOven.gif')}
              style={{ width: 72, height: 72, marginBottom: 6 }}
              resizeMode="contain"
            />

            {/* Status badge */}
            <View
              className="px-2.5 py-0.5 rounded-full mb-2"
              style={{ backgroundColor: `${accentColor}22` }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: accentColor }}>
                {statusLabel}
              </Text>
            </View>

            {/* Firing name */}
            <Text className="text-lg font-serif font-bold text-foreground mb-0.5 text-center" numberOfLines={1}>
              {liveFiring.name}
            </Text>

            {/* Subtitle — type · cone · kiln · pieces */}
            <Text className="text-xs text-muted-foreground mb-3 text-center" numberOfLines={1}>
              {FIRING_TYPE_LABELS[liveFiring.type]} · Cone {liveFiring.cone}
              {kiln ? ` · ${kiln.name}` : ''}
              {` · ${liveFiring.pieceIds.length} piece${liveFiring.pieceIds.length !== 1 ? 's' : ''}`}
            </Text>

            {/* Milestone strip */}
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
