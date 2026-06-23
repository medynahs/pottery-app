import { Text } from '@/src/components/ui/text';
import {
  getPremiumFeatureDescription,
  getPremiumLimitLine,
  PremiumFeature,
  premiumRouteForFeature,
} from '@/src/utils/premiumGate';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BarChart3, Lock } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { OnboardingUserType } from '@/src/types/user';
import { ANALYTICS_THEME } from '../analyticsTheme';
import { AnalyticsHeroBanner, type DashboardStat } from './AnalyticsDashboardShell';

type AnalyticsLockedPreviewProps = {
  paddingTop: number;
  paddingBottom: number;
  periodLabel: string;
  headline: string;
  headlineSub: string;
  ringValue: number | null;
  ringLabel: string;
  ringSub?: string;
  stats: DashboardStat[];
  userType: OnboardingUserType;
};

export function AnalyticsLockedPreview({
  paddingTop,
  paddingBottom,
  periodLabel,
  headline,
  headlineSub,
  ringValue,
  ringLabel,
  ringSub,
  stats,
  userType,
}: AnalyticsLockedPreviewProps) {
  const router = useRouter();
  const description = getPremiumFeatureDescription(PremiumFeature.Analytics, userType);
  const limitLine = getPremiumLimitLine(PremiumFeature.Analytics);

  return (
    <View className="flex-1" style={{ backgroundColor: ANALYTICS_THEME.pageBg, paddingTop }}>
      <View className="px-4 pb-3">
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
          {periodLabel} · preview
        </Text>
      </View>

      <View style={{ flex: 1, paddingBottom }}>
        <View style={{ opacity: 0.42 }} pointerEvents="none">
          <AnalyticsHeroBanner
            periodLabel={periodLabel}
            headline={headline}
            headlineSub={headlineSub}
            ringValue={ringValue}
            ringLabel={ringLabel}
            ringSub={ringSub}
            stats={stats}
          />
          <View className="px-4 mt-2">
            <View className="h-28 rounded-2xl bg-muted/50 border border-border" />
            <View className="h-40 rounded-2xl bg-muted/40 border border-border mt-3" />
          </View>
        </View>

        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: '28%',
          }}
        >
          <View
            className="rounded-3xl border overflow-hidden"
            style={{
              borderColor: ANALYTICS_THEME.cardBorder,
              backgroundColor: '#FFFBF2',
              shadowColor: '#3f2412',
              shadowOpacity: 0.12,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={['hsl(39 55% 96%)', '#FFFBF2']}
              style={{ padding: 20 }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-9 h-9 rounded-xl bg-primary/15 items-center justify-center">
                  <Lock size={16} color="hsl(39 57% 51%)" />
                </View>
                <Text className="text-base font-bold text-foreground flex-1">Unlock studio analytics</Text>
              </View>
              <Text className="text-sm text-muted-foreground leading-5">{description}</Text>
              {limitLine ? (
                <Text className="text-xs text-primary mt-3 leading-5 font-medium">{limitLine}</Text>
              ) : null}
              <View className="flex-row items-center gap-2 mt-4 mb-1">
                <BarChart3 size={14} color="hsl(39 57% 51%)" />
                <Text className="text-xs text-muted-foreground">
                  You have <Text className="font-semibold text-foreground">{headline}</Text> tracked this period
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push(premiumRouteForFeature(PremiumFeature.Analytics) as never)}
                activeOpacity={0.88}
                className="mt-4 rounded-2xl py-3.5 items-center bg-primary"
              >
                <Text className="text-sm font-bold text-white">See Premium plans</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="mt-2 py-2 items-center"
              >
                <Text className="text-sm text-muted-foreground">Maybe later</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </View>
  );
}
