import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import {
  ANALYTICS_PERIOD_OPTIONS,
  type AnalyticsPeriodId,
} from '@/src/utils/analyticsPeriods';
import { ANALYTICS_THEME } from '../analyticsTheme';
import { ProgressRing } from './charts/ProgressRing';

export type DashboardStat = {
  key: string;
  label: string;
  value: string;
  sub?: string;
  emoji?: string;
};

type AnalyticsStickyChromeProps = {
  paddingTop: number;
  periodId: AnalyticsPeriodId;
  periodLabel: string;
  onPeriodChange: (id: AnalyticsPeriodId) => void;
};

/** Fixed top bar — back, title, and period chips only. */
export function AnalyticsStickyChrome({
  paddingTop,
  periodId,
  periodLabel,
  onPeriodChange,
}: AnalyticsStickyChromeProps) {
  const router = useRouter();

  return (
    <View
      style={{
        paddingTop: paddingTop + 8,
        backgroundColor: ANALYTICS_THEME.pageBg,
        borderBottomWidth: 1,
        borderBottomColor: ANALYTICS_THEME.cardBorder,
        zIndex: 10,
      }}
    >
      <View className="px-4 pb-3">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full mr-3 border"
            style={{
              backgroundColor: ANALYTICS_THEME.accentSoft,
              borderColor: ANALYTICS_THEME.cardBorder,
            }}
          >
            <ChevronDown
              size={20}
              color={ANALYTICS_THEME.inkSoft}
              style={{ transform: [{ rotate: '90deg' }] }}
            />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 1.2,
                color: ANALYTICS_THEME.inkMuted,
                textTransform: 'uppercase',
              }}
            >
              Studio ledger
            </Text>
            <Text className="font-serif text-[22px] leading-7" style={{ color: ANALYTICS_THEME.ink }}>
              Analytics
            </Text>
            <Text className="text-[11px] mt-0.5" style={{ color: ANALYTICS_THEME.inkMuted }}>
              {periodLabel} · estimated figures
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {ANALYTICS_PERIOD_OPTIONS.map((opt) => {
            const active = opt.id === periodId;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => onPeriodChange(opt.id)}
                activeOpacity={0.82}
                className="rounded-full px-4 py-2 border"
                style={{
                  backgroundColor: active ? ANALYTICS_THEME.chipActiveBg : ANALYTICS_THEME.chipIdleBg,
                  borderColor: active ? ANALYTICS_THEME.chipActiveBg : ANALYTICS_THEME.cardBorder,
                }}
              >
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: active ? ANALYTICS_THEME.chipActiveText : ANALYTICS_THEME.inkSoft }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

type AnalyticsHeroBannerProps = {
  periodLabel: string;
  headline: string;
  headlineSub: string;
  ringValue: number | null;
  ringLabel: string;
  ringSub?: string;
  stats: DashboardStat[];
};

/** Scrollable gradient hero — headline, ring, and stat chips. */
export function AnalyticsHeroBanner({
  periodLabel,
  headline,
  headlineSub,
  ringValue,
  ringLabel,
  ringSub,
  stats,
}: AnalyticsHeroBannerProps) {
  return (
    <View
      className="overflow-hidden mb-1"
      style={{
        shadowColor: ANALYTICS_THEME.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={[...ANALYTICS_THEME.heroGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="px-4 pt-4 pb-5">
          <View
            className="rounded-[22px] px-4 py-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.14)' }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 0.9,
                color: ANALYTICS_THEME.heroLabel,
                textTransform: 'uppercase',
              }}
            >
              {periodLabel}
            </Text>
            <View className="flex-row items-center mt-3 gap-4">
              <View className="flex-1">
                <Text className="font-serif text-[34px] leading-9" style={{ color: ANALYTICS_THEME.heroText }}>
                  {headline}
                </Text>
                <Text className="text-[13px] mt-1.5 leading-5" style={{ color: ANALYTICS_THEME.heroMuted }}>
                  {headlineSub}
                </Text>
              </View>
              <ProgressRing
                value={ringValue}
                label={ringLabel}
                sublabel={ringSub}
                tone="cream"
                size={92}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingTop: 14 }}
          >
            {stats.map((stat) => (
              <View
                key={stat.key}
                className="rounded-2xl px-3.5 py-3 min-w-[118px]"
                style={{
                  backgroundColor: ANALYTICS_THEME.heroChip,
                  borderWidth: 1,
                  borderColor: ANALYTICS_THEME.heroChipBorder,
                }}
              >
                <View className="flex-row items-center gap-1.5 mb-1">
                  {stat.emoji ? <Text style={{ fontSize: 13 }}>{stat.emoji}</Text> : null}
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      letterSpacing: 0.6,
                      color: ANALYTICS_THEME.heroLabel,
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </Text>
                </View>
                <Text className="font-serif text-[20px] leading-6" style={{ color: ANALYTICS_THEME.heroText }}>
                  {stat.value}
                </Text>
                {stat.sub ? (
                  <Text className="text-[10px] mt-0.5" style={{ color: ANALYTICS_THEME.heroMuted }}>
                    {stat.sub}
                  </Text>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}
