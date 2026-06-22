import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { getFiringSessionLabel } from '@/src/utils/firingSessionLabels';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Clock3, Package, Receipt } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import type { Firing } from '../../../types/kiln';
import { FIRING_TYPE_LABELS } from '../constants';
import { formatReadyDate, getExpectedReadyAt } from '../firingEstimations';
import { KILN_UI } from '../utils/kilnTheme';

const STATUS_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  Scheduled: { bg: KILN_UI.brownSoft, fg: KILN_UI.brownMuted, border: KILN_UI.brownSoftBorder },
  Firing: { bg: 'rgba(166, 124, 82, 0.18)', fg: '#6B4423', border: 'rgba(107, 68, 35, 0.25)' },
  Cooling: { bg: 'rgba(139, 115, 85, 0.18)', fg: '#5C4033', border: 'rgba(92, 64, 51, 0.25)' },
  'Ready to unload': { bg: 'rgba(58, 40, 16, 0.12)', fg: KILN_UI.brown, border: KILN_UI.brownSoftBorder },
};

const HERO_GRADIENT: [string, string, string] = ['#A67C52', '#DCC9A3', KILN_UI.cream];

type FiringSessionCardProps = {
  firing: Firing;
  kilnName: string;
  currencySymbol?: string;
  variant?: 'hero' | 'compact';
  onPress: () => void;
};

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-1 min-w-[86px] rounded-xl px-2.5 py-2 border"
      style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.brownSoft }}
    >
      <View className="flex-row items-center gap-1 mb-1">
        <Icon size={11} color={KILN_UI.brownMuted} />
        <Text className="text-[10px] uppercase tracking-wider" style={{ color: KILN_UI.brownMuted }}>
          {label}
        </Text>
      </View>
      <Text className="text-xs font-semibold" style={{ color: KILN_UI.brown }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function FiringSessionCard({
  firing,
  kilnName,
  currencySymbol = '€',
  variant = 'compact',
  onPress,
}: FiringSessionCardProps) {
  const kiln = useAppStore((s) => s.kilns.find((k) => k.id === firing.kilnId));
  const statusLabel = getFiringSessionLabel(firing, kiln);
  const statusColors = STATUS_COLORS[statusLabel] ?? STATUS_COLORS.Scheduled;
  const expectedReady = getExpectedReadyAt(firing, kiln);
  const isActive = statusLabel === 'Firing' || statusLabel === 'Cooling' || statusLabel === 'Ready to unload';

  if (variant === 'hero' && isActive) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} className="mb-3">
        <Card className="overflow-hidden" style={{ borderWidth: 1, borderColor: KILN_UI.brownSoftBorder, padding: 0 }}>
          <LinearGradient colors={HERO_GRADIENT} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
            <View className="h-1" style={{ backgroundColor: statusColors.fg }} />
            <View className="px-3.5 pt-3 pb-3 items-center">
              <Image
                source={require('../../../../assets/animations/activeOven.gif')}
                style={{ width: 72, height: 72, marginBottom: 6 }}
                resizeMode="contain"
              />
              <View
                className="px-2.5 py-0.5 rounded-full mb-2 border"
                style={{ backgroundColor: statusColors.bg, borderColor: statusColors.border }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: statusColors.fg }}>{statusLabel}</Text>
              </View>
              <Text className="text-lg font-serif font-bold mb-0.5 text-center" style={{ color: KILN_UI.brown }} numberOfLines={1}>
                {firing.name}
              </Text>
              <Text className="text-xs mb-3 text-center" style={{ color: KILN_UI.brownMuted }} numberOfLines={1}>
                {FIRING_TYPE_LABELS[firing.type]} · Cone {firing.cone} · {kilnName} · {firing.pieceIds.length} piece{firing.pieceIds.length !== 1 ? 's' : ''}
              </Text>
              <Text className="text-xs font-semibold" style={{ color: statusColors.fg }}>
                Ready ~{formatReadyDate(expectedReady)} · Tap for details
              </Text>
            </View>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card className="p-4 mb-2.5" style={{ borderWidth: 1, borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.warmCard }}>
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-3">
            <Text className="font-semibold text-sm" style={{ color: KILN_UI.brown }} numberOfLines={1}>
              {firing.name}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: KILN_UI.brownMuted }} numberOfLines={1}>
              {kilnName} · {FIRING_TYPE_LABELS[firing.type]} · Cone {firing.cone}
            </Text>
          </View>
          <View className="px-2.5 py-1 rounded-full border" style={{ backgroundColor: statusColors.bg, borderColor: statusColors.border }}>
            <Text className="text-[10px] font-semibold" style={{ color: statusColors.fg }}>{statusLabel}</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <MiniStat icon={Package} label="Pieces" value={`${firing.pieceIds.length} assigned`} />
          <MiniStat icon={Clock3} label="Expected" value={formatReadyDate(expectedReady)} />
          <MiniStat
            icon={Receipt}
            label="Est. cost"
            value={firing.estimatedTotalCost != null ? `${currencySymbol}${firing.estimatedTotalCost.toFixed(0)}` : '-'}
          />
        </View>

        <View className="flex-row items-center justify-end gap-1 mt-2">
          <Text className="text-[11px] font-semibold" style={{ color: KILN_UI.brown }}>Open details</Text>
          <ChevronRight size={14} color={KILN_UI.brownMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
