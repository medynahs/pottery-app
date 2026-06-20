import { Text } from '@/src/components/ui/text';
import type { PipelineStage } from '@/src/utils/computeStudioStats';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ANALYTICS_THEME, CHART_COLORS } from '../../analyticsTheme';

const STAGE_COLORS: Record<string, string> = {
  idea: 'hsl(280 35% 60%)',
  forming: CHART_COLORS.clay,
  'leather-hard': 'hsl(200 45% 55%)',
  trimming: 'hsl(39 57% 51%)',
  drying: 'hsl(44 70% 55%)',
  'bone-dry': 'hsl(35 45% 55%)',
  bisque: CHART_COLORS.bisque,
  glazing: CHART_COLORS.glazeMaterial,
  'glaze-fired': CHART_COLORS.glaze,
  finished: CHART_COLORS.success,
};

type PipelineChartProps = {
  stages: PipelineStage[];
  onStagePress?: (stage: string) => void;
};

export function PipelineChart({ stages, onStagePress }: PipelineChartProps) {
  const activeStages = stages.filter((s) => s.count > 0);
  const maxCount = Math.max(1, ...stages.map((s) => s.count));
  const totalWip = stages.reduce((sum, s) => sum + s.count, 0);

  if (totalWip === 0) {
    return (
      <Text className="text-xs text-center py-4 leading-5" style={{ color: ANALYTICS_THEME.inkMuted }}>
        No active pieces in your pipeline right now.
      </Text>
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[11px] font-semibold" style={{ color: ANALYTICS_THEME.inkSoft }}>
          {totalWip} active piece{totalWip !== 1 ? 's' : ''} in flow
        </Text>
        <Text className="text-[10px]" style={{ color: ANALYTICS_THEME.inkMuted }}>
          Tap a stage to view pieces
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
      >
        {activeStages.map((stage, index) => {
          const color = STAGE_COLORS[stage.stage] ?? CHART_COLORS.pieces;
          const heightPct = (stage.count / maxCount) * 100;
          const body = (
            <View
              className="rounded-2xl border px-3 py-3 min-w-[88px] items-center"
              style={{
                backgroundColor: `${color}12`,
                borderColor: `${color}40`,
              }}
            >
              <Text
                className="text-[9px] font-bold uppercase tracking-wider text-center"
                style={{ color: ANALYTICS_THEME.inkMuted }}
                numberOfLines={2}
              >
                {stage.label}
              </Text>
              <Text className="font-serif text-[26px] leading-8 mt-1" style={{ color: ANALYTICS_THEME.ink }}>
                {stage.count}
              </Text>
              <View
                className="w-full h-1.5 rounded-full mt-2 overflow-hidden"
                style={{ backgroundColor: CHART_COLORS.track }}
              >
                <View
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(12, heightPct)}%`, backgroundColor: color }}
                />
              </View>
              <Text className="text-[10px] mt-1.5 font-semibold" style={{ color }}>
                {Math.round(stage.pct)}%
              </Text>
            </View>
          );

          if (onStagePress) {
            return (
              <TouchableOpacity key={stage.stage} activeOpacity={0.82} onPress={() => onStagePress(stage.stage)}>
                {body}
              </TouchableOpacity>
            );
          }

          return <View key={stage.stage}>{body}</View>;
        })}
      </ScrollView>

      {activeStages.length > 1 ? (
        <View className="flex-row items-center mt-3 px-1">
          {activeStages.map((stage, index) => (
            <React.Fragment key={stage.stage}>
              {index > 0 ? (
                <View className="h-px flex-1 mx-1" style={{ backgroundColor: ANALYTICS_THEME.cardBorder }} />
              ) : null}
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STAGE_COLORS[stage.stage] ?? CHART_COLORS.pieces }}
              />
            </React.Fragment>
          ))}
        </View>
      ) : null}
    </View>
  );
}
