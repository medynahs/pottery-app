import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { ANALYTICS_THEME, SECTION_ACCENTS } from '../analyticsTheme';

type SectionAccent = keyof typeof SECTION_ACCENTS;

export function AnalyticsSectionCard({
  title,
  hint,
  children,
  footer,
  accent = 'overview',
  icon,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  accent?: SectionAccent;
  icon?: React.ReactNode;
}) {
  const palette = SECTION_ACCENTS[accent];

  return (
    <View
      className="rounded-[24px] mb-4 overflow-hidden"
      style={{
        backgroundColor: ANALYTICS_THEME.cardBg,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: ANALYTICS_THEME.shadow,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View
        className="px-4 py-3.5 flex-row items-start gap-3"
        style={{ backgroundColor: palette.bg, borderBottomWidth: 1, borderBottomColor: palette.border }}
      >
        {icon ? (
          <View
            className="w-10 h-10 rounded-2xl items-center justify-center"
            style={{ backgroundColor: ANALYTICS_THEME.cardBg, borderWidth: 1, borderColor: palette.border }}
          >
            {icon}
          </View>
        ) : null}
        <View className="flex-1">
          <Text className="text-[15px] font-serif font-bold" style={{ color: palette.color }}>
            {title}
          </Text>
          {hint ? (
            <Text className="text-[11px] mt-1 leading-4" style={{ color: ANALYTICS_THEME.inkMuted }}>
              {hint}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="p-4">{children}</View>
      {footer ? (
        <View className="px-4 pb-4 -mt-1">{footer}</View>
      ) : null}
    </View>
  );
}

const METRIC_TONES: Record<string, { bg: string; border: string; accent: string }> = {
  production: { bg: 'hsl(24 45% 94%)', border: 'hsl(24 35% 82%)', accent: '#B86A3C' },
  firing: { bg: 'hsl(12 55% 94%)', border: 'hsl(12 40% 82%)', accent: '#D4644A' },
  revenue: { bg: 'hsl(142 35% 93%)', border: 'hsl(142 28% 80%)', accent: '#6B9E78' },
  neutral: { bg: 'hsl(38 45% 95%)', border: 'hsl(34 30% 84%)', accent: '#C98352' },
};

export function MetricTile({
  label,
  value,
  sub,
  tone = 'neutral',
  emoji,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: keyof typeof METRIC_TONES;
  emoji?: string;
}) {
  const palette = METRIC_TONES[tone] ?? METRIC_TONES.neutral;

  return (
    <View
      className="rounded-[20px] border p-4"
      style={{
        width: '48%',
        backgroundColor: palette.bg,
        borderColor: palette.border,
      }}
    >
      <View className="flex-row items-center gap-1.5 mb-2">
        {emoji ? <Text style={{ fontSize: 14 }}>{emoji}</Text> : null}
        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.accent }} />
        <Text className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: ANALYTICS_THEME.inkMuted }}>
          {label}
        </Text>
      </View>
      <Text className="text-[22px] font-serif font-bold leading-7" style={{ color: ANALYTICS_THEME.ink }}>
        {value}
      </Text>
      {sub ? (
        <Text className="text-[10px] mt-1 leading-4" style={{ color: ANALYTICS_THEME.inkMuted }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap justify-between gap-y-3 mb-4">{children}</View>;
}

export function EmptyHint({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <View
      className="rounded-[24px] border p-10 items-center mb-4"
      style={{
        backgroundColor: ANALYTICS_THEME.cardBg,
        borderColor: ANALYTICS_THEME.cardBorder,
        borderStyle: 'dashed',
      }}
    >
      {icon}
      <Text className="text-sm text-center mt-3 leading-6 font-medium" style={{ color: ANALYTICS_THEME.inkMuted }}>
        {text}
      </Text>
    </View>
  );
}

export function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-2 pt-3 border-t" style={{ borderTopColor: ANALYTICS_THEME.cardBorder }}>
      {items.map((item) => (
        <View key={item.label} className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <Text className="text-[10px] font-medium" style={{ color: ANALYTICS_THEME.inkMuted }}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
