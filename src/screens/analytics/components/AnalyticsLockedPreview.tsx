import { Text } from '@/src/components/ui/text';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import type { OnboardingUserType } from '@/src/types/user';
import type { StudioStats } from '@/src/utils/computeStudioStats';
import {
  getPremiumFeatureDescription,
  getPremiumLimitLine,
  PremiumFeature,
  premiumRouteForFeature,
} from '@/src/utils/premiumGate';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BarChart3, ChevronDown, Lock } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ANALYTICS_THEME } from '../analyticsTheme';
import type { DashboardStat } from './AnalyticsDashboardShell';
import { AnalyticsLockedPreviewContent } from './AnalyticsLockedPreviewContent';

type MoneyFormatter = (v: number | null | undefined, opts?: { dash?: boolean }) => string;

type DonutSegment = { label: string; color: string; value: number };

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
  studioStats: StudioStats;
  money: MoneyFormatter;
  costDonutSegments: DonutSegment[];
  showCostDonut: boolean;
  showRevenueTiles: boolean;
  revenueLabel: string;
  userType: OnboardingUserType;
};

function PaywallOverlayCard({
  description,
  limitLine,
  headline,
  onUpgrade,
  onDismiss,
}: {
  description: string;
  limitLine: string | null;
  headline: string;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  return (
    <View
      className="rounded-3xl border overflow-hidden"
      style={{
        borderColor: ANALYTICS_THEME.cardBorder,
        backgroundColor: '#FFFBF2',
        shadowColor: '#3f2412',
        shadowOpacity: 0.14,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }}
    >
      <LinearGradient colors={['hsl(39 55% 96%)', '#FFFBF2']} style={{ padding: 20 }}>
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
          onPress={onUpgrade}
          activeOpacity={0.88}
          className="mt-4 rounded-2xl py-3.5 items-center bg-primary"
        >
          <Text className="text-sm font-bold text-white">See Premium plans</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} className="mt-2 py-2 items-center">
          <Text className="text-sm text-muted-foreground">Maybe later</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

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
  studioStats,
  money,
  costDonutSegments,
  showCostDonut,
  showRevenueTiles,
  revenueLabel,
  userType,
}: AnalyticsLockedPreviewProps) {
  const router = useRouter();
  const { trackAnalyticsPreviewViewed } = useAnalytics();
  const description = getPremiumFeatureDescription(PremiumFeature.Analytics, userType);
  const limitLine = getPremiumLimitLine(PremiumFeature.Analytics);

  React.useEffect(() => {
    trackAnalyticsPreviewViewed({ user_type: userType });
  }, [trackAnalyticsPreviewViewed, userType]);

  return (
    <View className="flex-1" style={{ backgroundColor: ANALYTICS_THEME.pageBg }}>
      <View
        className="px-4 pb-3"
        style={{
          paddingTop,
          zIndex: 2,
          backgroundColor: ANALYTICS_THEME.pageBg,
        }}
      >
        <View className="flex-row items-center">
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
              {periodLabel} · preview
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: paddingBottom + 32 }}
        >
          <View style={{ opacity: 0.55 }} pointerEvents="none">
            <AnalyticsLockedPreviewContent
              periodLabel={periodLabel}
              headline={headline}
              headlineSub={headlineSub}
              ringValue={ringValue}
              ringLabel={ringLabel}
              ringSub={ringSub}
              stats={stats}
              studioStats={studioStats}
              money={money}
              costDonutSegments={costDonutSegments}
              showCostDonut={showCostDonut}
              showRevenueTiles={showRevenueTiles}
              revenueLabel={revenueLabel}
            />
          </View>
        </ScrollView>

        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: '25%',
          }}
        >
          <PaywallOverlayCard
            description={description}
            limitLine={limitLine}
            headline={headline}
            onUpgrade={() => router.push(premiumRouteForFeature(PremiumFeature.Analytics) as never)}
            onDismiss={() => router.back()}
          />
        </View>
      </View>
    </View>
  );
}
