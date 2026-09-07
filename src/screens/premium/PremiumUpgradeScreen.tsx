/**
 * PremiumUpgradeScreen — contextual upgrade / subscription management
 */
import { AnimatedLogoHero } from '@/src/components/AnimatedLogoHero';
import { Banner } from '@/src/components/Banner';
import { Text } from '@/src/components/ui/text';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/src/constants/legal';
import {
    PREMIUM_ANNUAL_PRICE_EUR,
    PREMIUM_ANNUAL_SAVINGS_LABEL,
    PREMIUM_MONTHLY_PRICE_EUR,
    premiumDisplayPrice,
} from '@/src/constants/premium';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { openSubscriptionManagement, useEntitlements } from '@/src/hooks/useEntitlements';
import { useAppStore } from '@/src/store';
import {
    getPremiumContextualTitle,
    getPremiumFeatureDescription,
    getPremiumLimitLine,
    getPremiumUpgradeHeadline,
    getStudioOwnerPaywallFootnote,
    PAYWALL_COMING_SOON_FEATURES,
    PAYWALL_INCLUDED_FEATURES,
    PAYWALL_LOCAL_CLOUD_EXPLAINER,
    paywallItemForFeature,
    PREMIUM_COMPARISON_ROWS,
    type PaywallFeatureItem,
    type PremiumFeature,
} from '@/src/utils/premiumGate';
import { trackPaywallDismissed } from '@/src/utils/productAnalytics';
import { openPlatformSubscriptionSettings } from '@/src/utils/subscriptionSettings';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    BarChart3,
    Camera,
    Clock,
    Cloud,
    Download,
    MessageSquare,
    Palette,
    Sparkles,
    Target,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PlanKey = 'annual' | 'monthly';

const GOLD = 'hsl(39 57% 51%)';
const GOLD_TINT = 'hsl(44 65% 90%)';
const ONBOARDING_GRADIENT = {
  colors: ['#fffaf2', '#f3dfc4', '#fff8ed'] as const,
  locations: [0, 0.55, 1] as const,
};

const FEATURE_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  cloud: Cloud,
  photos: Camera,
  community: MessageSquare,
  glazes: Palette,
  companions: Sparkles,
  analytics: BarChart3,
  export: Download,
  rhythm: Target,
  wrap: Clock,
};

function PaywallScreenShell({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff7ea',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <LinearGradient
        colors={[...ONBOARDING_GRADIENT.colors]}
        locations={[...ONBOARDING_GRADIENT.locations]}
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar barStyle="dark-content" />
      {children}
    </View>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 252, 246, 0.82)',
        borderWidth: 1.5,
        borderColor: 'rgba(94, 60, 36, 0.18)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 17, color: 'hsl(25 30% 32%)', lineHeight: 20 }}>✕</Text>
    </TouchableOpacity>
  );
}

function FeatureRow({ item }: { item: PaywallFeatureItem }) {
  const FIcon = FEATURE_ICONS[item.key] ?? Sparkles;
  const comingSoon = item.status === 'coming-soon';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 252, 246, 0.94)',
        borderWidth: 1,
        borderColor: 'rgba(95, 61, 37, 0.1)',
        paddingVertical: 11,
        paddingHorizontal: 13,
        opacity: comingSoon ? 0.72 : 1,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: GOLD_TINT,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FIcon size={17} color={GOLD} />
      </View>
      <Text style={{ flex: 1, fontSize: 14, color: 'hsl(24 30% 14%)', lineHeight: 19 }}>
        {item.label}
      </Text>
      {comingSoon ? (
        <View style={{ backgroundColor: 'hsl(34 30% 90%)', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: 'hsl(24 20% 45%)' }}>Soon</Text>
        </View>
      ) : null}
    </View>
  );
}

function ComparisonTable() {
  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(95, 61, 37, 0.12)',
        backgroundColor: 'rgba(255, 252, 246, 0.94)',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(95, 61, 37, 0.1)',
          backgroundColor: 'rgba(255, 244, 232, 0.5)',
        }}
      >
        <Text style={{ flex: 1.4, fontSize: 11, fontWeight: '700', color: 'hsl(24 20% 45%)' }} />
        <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: 'hsl(24 20% 45%)', textAlign: 'center' }}>Free</Text>
        <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: GOLD, textAlign: 'center' }}>Premium</Text>
      </View>
      {PREMIUM_COMPARISON_ROWS.map((row, index) => (
        <View
          key={row.label}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderBottomWidth: index < PREMIUM_COMPARISON_ROWS.length - 1 ? 1 : 0,
            borderBottomColor: 'rgba(95, 61, 37, 0.08)',
          }}
        >
          <Text style={{ flex: 1.4, fontSize: 13, color: 'hsl(24 30% 14%)', fontWeight: '500' }}>{row.label}</Text>
          <Text style={{ flex: 1, fontSize: 12, color: 'hsl(24 20% 48%)', textAlign: 'center' }}>{row.free}</Text>
          <Text style={{ flex: 1, fontSize: 12, color: 'hsl(24 25% 22%)', fontWeight: '600', textAlign: 'center' }}>{row.premium}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PremiumUpgradeScreen({
  triggerFeature = null,
}: {
  triggerFeature?: PremiumFeature | null;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const userType = useAppStore((s) => s.onboardingProfile?.userType ?? 'not-sure');

  const closePaywall = useCallback(() => {
    trackPaywallDismissed({ feature: triggerFeature ?? null, user_type: userType });
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/overview' as never);
  }, [router, triggerFeature, userType]);

  const personaHeadline = getPremiumUpgradeHeadline(userType);
  const studioFootnote = getStudioOwnerPaywallFootnote(userType);
  const { isPremium, offering, purchase, restore, isLoading, error } = useEntitlements();
  const { trackPaywallViewed, trackPremiumPurchaseStarted } = useAnalytics();
  const [selected, setSelected] = useState<PlanKey>('annual');
  const [busy, setBusy] = useState(false);
  const [managing, setManaging] = useState(false);

  const contextualTitle = triggerFeature ? getPremiumContextualTitle(triggerFeature) : null;
  const contextualDescription = triggerFeature
    ? getPremiumFeatureDescription(triggerFeature, userType)
    : null;
  const contextualLimit = triggerFeature ? getPremiumLimitLine(triggerFeature) : null;

  const plans: {
    key: PlanKey;
    label: string;
    badge: string | null;
    description: string;
    pkg: PurchasesPackage | undefined;
    price: string;
    perPeriod: string;
  }[] = [
    {
      key: 'annual',
      label: 'Yearly',
      badge: PREMIUM_ANNUAL_SAVINGS_LABEL,
      description: 'Full access, renewed yearly',
      pkg: offering?.annual ?? undefined,
      price: premiumDisplayPrice(offering?.annual ?? undefined, PREMIUM_ANNUAL_PRICE_EUR),
      perPeriod: '/ year',
    },
    {
      key: 'monthly',
      label: 'Monthly',
      badge: null,
      description: 'Flexible, cancel anytime',
      pkg: offering?.monthly ?? undefined,
      price: premiumDisplayPrice(offering?.monthly ?? undefined, PREMIUM_MONTHLY_PRICE_EUR),
      perPeriod: '/ month',
    },
  ];

  const selectedPlan = plans.find((p) => p.key === selected);

  const highlightedFeature = triggerFeature ? paywallItemForFeature(triggerFeature) : null;

  const otherIncluded = PAYWALL_INCLUDED_FEATURES.filter((f) => f.key !== highlightedFeature?.key);
  const otherComingSoon = PAYWALL_COMING_SOON_FEATURES.filter((f) => f.key !== highlightedFeature?.key);

  React.useEffect(() => {
    if (isPremium) return;
    trackPaywallViewed({
      feature: triggerFeature ?? null,
      user_type: userType,
    });
  }, [isPremium, triggerFeature, trackPaywallViewed, userType]);

  async function handlePurchase() {
    if (!selectedPlan?.pkg) return;
    trackPremiumPurchaseStarted({ plan: selected });
    setBusy(true);
    try {
      await purchase(selectedPlan.pkg);
    } finally {
      setBusy(false);
    }
  }

  async function handleManageSubscription() {
    setManaging(true);
    try {
      let opened = await openPlatformSubscriptionSettings();
      if (!opened) {
        opened = await openSubscriptionManagement();
      }
      if (!opened) {
        showToast('Could not open subscription settings', 'error');
      }
    } finally {
      setManaging(false);
    }
  }

  if (isPremium) {
    return (
      <PaywallScreenShell>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, alignItems: 'flex-end' }}>
          <CloseButton onPress={closePaywall} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
          <AnimatedLogoHero logoSize={132} showWordmark={false}>
            <Text
              style={{
                fontFamily: 'Fraunces_700Bold',
                fontSize: 26,
                lineHeight: 32,
                color: '#2f1c12',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Thank you so much
            </Text>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: '#5d3b25',
                textAlign: 'center',
                marginTop: 10,
                paddingHorizontal: 8,
              }}
            >
              Your support means the world to our small team. It goes directly into building new features, companions, and tools for potters everywhere.
            </Text>
          </AnimatedLogoHero>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={managing}
            onPress={() => void handleManageSubscription()}
            style={{
              marginTop: 36,
              backgroundColor: 'rgba(255, 252, 246, 0.94)',
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: 'rgba(94, 60, 36, 0.18)',
              paddingVertical: 15,
              paddingHorizontal: 32,
              alignItems: 'center',
              opacity: managing ? 0.72 : 1,
            }}
          >
            {managing ? (
              <ActivityIndicator color="hsl(24 25% 40%)" />
            ) : (
              <Text style={{ color: 'hsl(24 25% 25%)', fontWeight: '700', fontSize: 15 }}>
                Manage Subscription
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </PaywallScreenShell>
    );
  }

  return (
    <PaywallScreenShell>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, alignItems: 'flex-end' }}>
          <CloseButton onPress={closePaywall} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedLogoHero logoSize={100} style={{ marginBottom: 4 }} showWordmark={false}>
            <Text
              style={{
                fontFamily: 'Fraunces_700Bold',
                fontSize: 24,
                lineHeight: 30,
                color: '#2f1c12',
                textAlign: 'center',
              }}
            >
              {contextualTitle ?? 'Unlock Premium'}
            </Text>
            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: '#5d3b25',
                textAlign: 'center',
                marginTop: 8,
                paddingHorizontal: 4,
              }}
            >
              {contextualDescription ?? personaHeadline}
            </Text>
            {contextualLimit ? (
              <View
                style={{
                  marginTop: 12,
                  alignSelf: 'center',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'hsl(39 57% 51% / 0.28)',
                  backgroundColor: 'hsl(39 55% 96%)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  maxWidth: '100%',
                }}
              >
                <Text style={{ fontSize: 12, color: 'hsl(28 38% 34%)', textAlign: 'center', lineHeight: 17, fontWeight: '600' }}>
                  {contextualLimit}
                </Text>
              </View>
            ) : null}
            <Text
              style={{
                fontSize: 11,
                lineHeight: 16,
                color: 'hsl(24 20% 55%)',
                textAlign: 'center',
                marginTop: 10,
              }}
            >
              {contextualTitle ? personaHeadline : 'Helps us build more tools for potters everywhere.'}
            </Text>
          </AnimatedLogoHero>

          <View style={{ marginTop: 22 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'hsl(28 38% 34%)',
                marginBottom: 12,
                paddingHorizontal: 2,
              }}
            >
              Free vs Premium
            </Text>
            <ComparisonTable />
            <Text
              style={{
                fontSize: 12,
                lineHeight: 18,
                color: 'hsl(24 20% 48%)',
                marginTop: 12,
                paddingHorizontal: 2,
              }}
            >
              {PAYWALL_LOCAL_CLOUD_EXPLAINER}
            </Text>
          </View>

          <View style={{ marginTop: 22 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'hsl(28 38% 34%)',
                marginBottom: 12,
                paddingHorizontal: 2,
              }}
            >
              {triggerFeature ? 'Also included' : 'Everything in Premium'}
            </Text>
            <View style={{ gap: 8 }}>
              {highlightedFeature ? <FeatureRow item={highlightedFeature} /> : null}
              {otherIncluded.map((feature) => (
                <FeatureRow key={feature.key} item={feature} />
              ))}
              {otherComingSoon.map((feature) => (
                <FeatureRow key={feature.key} item={feature} />
              ))}
            </View>
          </View>

          {studioFootnote ? (
            <Text style={{ fontSize: 11, color: 'hsl(24 20% 52%)', lineHeight: 16, marginTop: 18, textAlign: 'center' }}>
              {studioFootnote}
            </Text>
          ) : null}

          <Text style={{ fontSize: 11, color: 'hsl(24 20% 62%)', textAlign: 'center', marginTop: 16, lineHeight: 16 }}>
            {PREMIUM_MONTHLY_PRICE_EUR}/month · {PREMIUM_ANNUAL_PRICE_EUR}/year. Subscriptions renew automatically, cancel anytime from your subscription settings. Billing is through Pottery Nook Pro on the App Store or Google Play.
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10 }}>
            <TouchableOpacity onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)} activeOpacity={0.7}>
              <Text style={{ fontSize: 11, color: 'hsl(24 20% 55%)', textDecorationLine: 'underline' }}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)} activeOpacity={0.7}>
              <Text style={{ fontSize: 11, color: 'hsl(24 20% 55%)', textDecorationLine: 'underline' }}>
                Terms of Service
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={closePaywall} activeOpacity={0.6} style={{ alignItems: 'center', paddingVertical: 16 }}>
            <Text style={{ fontSize: 14, color: 'hsl(24 20% 60%)' }}>Maybe later</Text>
          </TouchableOpacity>
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 8,
            borderTopWidth: 1,
            borderTopColor: 'rgba(95, 61, 37, 0.12)',
            backgroundColor: 'rgba(255, 252, 246, 0.94)',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {plans.map((plan) => {
              const isSelected = selected === plan.key;
              return (
                <TouchableOpacity
                  key={plan.key}
                  activeOpacity={0.85}
                  onPress={() => setSelected(plan.key)}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? GOLD : 'rgba(95, 61, 37, 0.14)',
                    backgroundColor: isSelected ? 'rgba(255, 244, 232, 0.72)' : 'rgba(255, 252, 246, 0.94)',
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: 'hsl(24 25% 15%)' }}>{plan.label}</Text>
                    {plan.badge ? (
                      <View
                        style={{
                          backgroundColor: isSelected ? GOLD : GOLD_TINT,
                          borderRadius: 99,
                          paddingHorizontal: 6,
                          paddingVertical: 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: '700',
                            color: isSelected ? '#fff' : 'hsl(28 38% 34%)',
                          }}
                        >
                          {plan.badge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: isSelected ? GOLD : 'hsl(24 25% 30%)',
                    }}
                  >
                    {plan.price}
                  </Text>
                  {plan.perPeriod ? (
                    <Text style={{ fontSize: 10, color: 'hsl(24 20% 55%)', marginTop: 1 }}>{plan.perPeriod}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {!!error && <Banner message={error} className="mb-2" />}

          <TouchableOpacity
            activeOpacity={0.88}
            disabled={isLoading || busy || !selectedPlan?.pkg}
            onPress={handlePurchase}
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              opacity: isLoading || busy || !selectedPlan?.pkg ? 0.72 : 1,
              shadowColor: '#3f2412',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isLoading || busy ? 0 : 0.16,
              shadowRadius: 10,
              elevation: isLoading || busy ? 0 : 3,
            }}
          >
            <LinearGradient
              colors={['hsl(39 57% 51%)', 'hsl(32 48% 42%)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 13, alignItems: 'center' }}
            >
              {isLoading || busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 }}>
                  Unlock Premium ✦
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void restore()}
            activeOpacity={0.7}
            disabled={isLoading}
            style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 2 }}
          >
            <Text style={{ fontSize: 12, color: 'hsl(24 20% 55%)', textDecorationLine: 'underline' }}>
              Restore purchase
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PaywallScreenShell>
  );
}
