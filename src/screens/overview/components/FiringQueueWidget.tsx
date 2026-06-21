import { CanvasCropImage } from '@/src/components/SplashPotteryRing';
import { Text } from '@/src/components/ui/text';
import type { QueuePreview } from '@/src/screens/overview/utils/buildQueuePreview';
import type { Href } from 'expo-router';
import { ChevronRight, Flame } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { ActiveFiringSummary, FiringQueueSnapshot } from '@/src/screens/overview/utils/firingQueueUtils';

const KILN_SPLASH_BBOX = { minX: 1580, minY: 177, maxX: 1912, maxY: 596 };

const PAPER = '#FDF6EC';
const PAPER_DEEP = '#F5E8D4';
const INK = 'hsl(24 42% 22%)';
const INK_SOFT = 'hsl(32 28% 38%)';
const EMBER = '#C45C2A';
const EMBER_SOFT = '#E8955C';
const BORDER = '#E2C4A0';

type FiringQueueWidgetProps = {
  hasKilnTab: boolean;
  snapshot: FiringQueueSnapshot;
  activeFiring: ActiveFiringSummary;
  queuePreview: QueuePreview | null;
  onNavigate: (route: Href) => void;
  onOpenQueue: () => void;
};

type PipelineStage = {
  key: string;
  count: number;
  label: string;
  hint: string;
  route: Href;
};

function PipelineNode({
  stage,
  isLast,
  onPress,
}: {
  stage: PipelineStage;
  isLast: boolean;
  onPress: () => void;
}) {
  const lit = stage.count > 0;

  return (
    <View className="flex-1 flex-row items-center">
      <TouchableOpacity onPress={onPress} activeOpacity={0.78} className="flex-1 items-center">
        <View
          style={{
            width: lit ? 34 : 28,
            height: lit ? 34 : 28,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: lit ? EMBER_SOFT : PAPER_DEEP,
            borderWidth: 2,
            borderColor: lit ? EMBER : BORDER,
            shadowColor: lit ? EMBER : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: lit ? 0.45 : 0,
            shadowRadius: lit ? 8 : 0,
            elevation: lit ? 3 : 0,
          }}
        >
          <Text
            className="font-serif"
            style={{
              fontSize: lit ? 16 : 14,
              lineHeight: 20,
              color: lit ? '#FFF8F0' : INK_SOFT,
              fontWeight: '700',
            }}
          >
            {stage.count}
          </Text>
        </View>
        <Text className="text-[11px] font-semibold mt-2 text-center" style={{ color: lit ? INK : INK_SOFT }}>
          {stage.label}
        </Text>
        <Text className="text-[9px] mt-0.5 text-center leading-4" style={{ color: 'hsl(32 22% 48%)' }}>
          {stage.hint}
        </Text>
      </TouchableOpacity>
      {!isLast ? (
        <View
          style={{
            width: 18,
            height: 2,
            borderRadius: 1,
            backgroundColor: lit ? 'rgba(196, 92, 42, 0.35)' : BORDER,
            marginBottom: 28,
          }}
        />
      ) : null}
    </View>
  );
}

export function FiringQueueWidget({
  hasKilnTab,
  snapshot,
  activeFiring,
  queuePreview,
  onNavigate,
  onOpenQueue,
}: FiringQueueWidgetProps) {
  const waitingTotal = snapshot.boneDryCount + snapshot.glazingCount;
  const pipelineTotal = waitingTotal + snapshot.bisqueReadyCount;

  const stages: PipelineStage[] = [
    {
      key: 'bone-dry',
      count: snapshot.boneDryCount,
      label: 'Bone dry',
      hint: 'Bisque next',
      route: '/(tabs)/pieces?stage=bone-dry',
    },
    {
      key: 'bisque',
      count: snapshot.bisqueReadyCount,
      label: 'Bisque',
      hint: 'Glaze next',
      route: '/(tabs)/pieces?stage=bisque',
    },
    {
      key: 'glazing',
      count: snapshot.glazingCount,
      label: 'Glazing',
      hint: 'Glaze fire',
      route: '/(tabs)/pieces?stage=glazing',
    },
  ];

  return (
    <View
      className="rounded-[22px] overflow-hidden mb-4"
      style={{
        backgroundColor: PAPER,
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: '#5c3a1e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View style={{ position: 'absolute', top: -18, right: -8, opacity: 0.14 }} pointerEvents="none">
        <CanvasCropImage
          source={require('../../../../assets/images/kilnsplash.png')}
          size={88}
          bbox={KILN_SPLASH_BBOX}
        />
      </View>

      <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-center gap-2.5">
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: PAPER_DEEP, borderWidth: 1, borderColor: BORDER }}
            >
              <Flame size={16} color={EMBER} />
            </View>
            <View className="flex-1">
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  letterSpacing: 0.9,
                  color: EMBER,
                  textTransform: 'uppercase',
                }}
              >
                Kiln queue
              </Text>
              <Text className="font-serif text-[17px] leading-6 mt-0.5" style={{ color: INK }}>
                {activeFiring ? 'Something is in the fire' : pipelineTotal > 0 ? 'Warm pieces waiting' : 'Quiet kiln room'}
              </Text>
            </View>
          </View>

          <Text className="text-[11px] mt-2 leading-5" style={{ color: INK_SOFT }}>
            {hasKilnTab
              ? 'Follow the path from dry clay to finished glaze fire.'
              : 'Track what is ready before you take work to the studio kiln.'}
          </Text>

          {activeFiring ? (
            <TouchableOpacity
              onPress={onOpenQueue}
              activeOpacity={0.82}
              className="mt-3 rounded-2xl px-3 py-2.5 flex-row items-center gap-2.5"
              style={{
                backgroundColor: '#FFF0E3',
                borderWidth: 1,
                borderColor: '#F0C9A8',
                borderLeftWidth: 3,
                borderLeftColor: EMBER,
              }}
            >
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: EMBER_SOFT }} />
              <View className="flex-1">
                <Text className="text-xs font-semibold" style={{ color: INK }}>{activeFiring.label}</Text>
                <Text className="text-[11px] mt-0.5" style={{ color: INK_SOFT }}>{activeFiring.subtitle}</Text>
              </View>
              <ChevronRight size={15} color={EMBER} />
            </TouchableOpacity>
          ) : null}

          <View
            className="mt-4 rounded-2xl px-3 py-4"
            style={{ backgroundColor: PAPER_DEEP, borderWidth: 1, borderColor: BORDER }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: '700',
                letterSpacing: 0.8,
                color: 'hsl(32 22% 48%)',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              Dry → bisque → glaze fire
            </Text>
            <View className="flex-row items-start px-1">
              {stages.map((stage, index) => (
                <PipelineNode
                  key={stage.key}
                  stage={stage}
                  isLast={index === stages.length - 1}
                  onPress={() => onNavigate(stage.route)}
                />
              ))}
            </View>
          </View>

          {queuePreview ? (
            <TouchableOpacity
              onPress={() => onNavigate(queuePreview.route)}
              activeOpacity={0.82}
              className="mt-3 rounded-xl px-3 py-2.5 flex-row items-center justify-between"
              style={{ backgroundColor: PAPER_DEEP, borderWidth: 1, borderColor: BORDER }}
            >
              <Text className="text-[11px] flex-1 pr-2 leading-4" style={{ color: INK }}>
                {queuePreview.label}
              </Text>
              <Text className="text-[10px] font-semibold" style={{ color: EMBER }}>
                Schedule
              </Text>
            </TouchableOpacity>
          ) : null}

          {waitingTotal > 0 || snapshot.bisqueReadyCount > 0 ? (
            <TouchableOpacity
              onPress={onOpenQueue}
              activeOpacity={0.82}
              className="mt-3 rounded-xl py-2.5 flex-row items-center justify-center gap-1.5"
              style={{ backgroundColor: EMBER }}
            >
              <Flame size={13} color="#FFF8F0" />
              <Text className="text-xs font-semibold" style={{ color: '#FFF8F0' }}>
                {hasKilnTab ? 'Open Kiln tab' : 'View firing queue'}
              </Text>
            </TouchableOpacity>
          ) : null}
      </View>
    </View>
  );
}
