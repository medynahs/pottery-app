/**
 * PremiumUpgradeScreen — personal-tone upgrade / subscription management screen
 */
import { AnimatedLogoHero } from '@/src/components/AnimatedLogoHero';
import { Banner } from '@/src/components/Banner';
import { Text } from '@/src/components/ui/text';
import {
  PREMIUM_ANNUAL_PRICE_EUR,
  PREMIUM_ANNUAL_SAVINGS_LABEL,
  PREMIUM_MONTHLY_PRICE_EUR,
  premiumDisplayPrice,
} from '@/src/constants/premium';
import { openSubscriptionManagement, useEntitlements } from '@/src/hooks/useEntitlements';
import { openPlatformSubscriptionSettings } from '@/src/utils/subscriptionSettings';
import { useAppStore } from '@/src/store';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Camera,
  Download,
  Gift,
  Palette,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

const FEATURES = [
  { Icon: Camera, label: 'Unlimited photos per piece' },
  { Icon: Palette, label: 'Unlimited glazes & collections' },
  { Icon: Sparkles, label: 'All 4 elemental companions + free swap' },
  { Icon: BarChart3, label: 'Studio & kiln analytics' },
  { Icon: Wallet, label: 'Full pricing presets' },
  { Icon: Download, label: 'Data export & backup' },
  { Icon: Target, label: 'Unlimited weekly missions' },
  { Icon: Gift, label: 'Yearly pottery wrap' },
] as const;

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

export default function PremiumUpgradeScreen() {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const { isPremium, offering, purchase, restore, isLoading, error } = useEntitlements();
  const [selected, setSelected] = useState<PlanKey>('annual');
  const [busy, setBusy] = useState(false);
  const [managing, setManaging] = useState(false);

  const plans: Array<{
    key: PlanKey;
    label: string;
    badge: string | null;
    description: string;
    pkg: PurchasesPackage | undefined;
    price: string;
    perPeriod: string;
  }> = [
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

  async function handlePurchase() {
    if (!selectedPlan?.pkg) return;
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
      // Prefer App Store / Play Store — most reliable right after a native purchase.
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
          <CloseButton onPress={() => router.back()} />
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
          <CloseButton onPress={() => router.back()} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedLogoHero logoSize={112} style={{ marginBottom: 4 }}>
            <Text
              style={{
                fontFamily: 'Fraunces_700Bold',
                fontSize: 24,
                lineHeight: 30,
                color: '#2f1c12',
                textAlign: 'center',
              }}
            >
              Pottery Nook would love{'\n'}your support
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
              Your support goes directly into new features, companions, and tools made for potters.
            </Text>
          </AnimatedLogoHero>

          <View style={{ marginTop: 20 }}>
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
              Everything unlocked
            </Text>
            <View style={{ gap: 8 }}>
              {FEATURES.map((feature) => {
                const FIcon = feature.Icon;
                return (
                  <View
                    key={feature.label}
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
                      {feature.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={{ fontSize: 11, color: 'hsl(24 20% 62%)', textAlign: 'center', marginTop: 20, lineHeight: 16 }}>
            {PREMIUM_MONTHLY_PRICE_EUR}/month · {PREMIUM_ANNUAL_PRICE_EUR}/year. Subscriptions renew automatically — cancel anytime from your subscription settings.
          </Text>

          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6} style={{ alignItems: 'center', paddingVertical: 16 }}>
            <Text style={{ fontSize: 14, color: 'hsl(24 20% 60%)' }}>Maybe later</Text>
          </TouchableOpacity>
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 10,
            borderTopWidth: 1,
            borderTopColor: 'rgba(95, 61, 37, 0.12)',
            backgroundColor: 'rgba(255, 252, 246, 0.94)',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: 'hsl(28 38% 34%)',
              marginBottom: 10,
              paddingHorizontal: 2,
            }}
          >
            Choose a plan
          </Text>

          {plans.map((plan) => {
            const isSelected = selected === plan.key;
            return (
              <TouchableOpacity
                key={plan.key}
                activeOpacity={0.85}
                onPress={() => setSelected(plan.key)}
                style={{
                  borderRadius: 18,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? GOLD : 'rgba(95, 61, 37, 0.14)',
                  backgroundColor: isSelected ? 'rgba(255, 244, 232, 0.72)' : 'rgba(255, 252, 246, 0.94)',
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: isSelected ? 6 : 2,
                    borderColor: isSelected ? GOLD : 'rgba(122, 75, 42, 0.35)',
                    marginRight: 12,
                  }}
                />

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: 'hsl(24 25% 15%)' }}>{plan.label}</Text>
                    {plan.badge ? (
                      <View
                        style={{
                          backgroundColor: isSelected ? GOLD : GOLD_TINT,
                          borderRadius: 99,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: isSelected ? '#fff' : 'hsl(28 38% 34%)',
                          }}
                        >
                          {plan.badge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 12, color: 'hsl(24 20% 52%)' }}>{plan.description}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: isSelected ? GOLD : 'hsl(24 25% 30%)',
                    }}
                  >
                    {plan.price}
                  </Text>
                  {plan.perPeriod ? (
                    <Text style={{ fontSize: 11, color: 'hsl(24 20% 55%)' }}>{plan.perPeriod}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}

          {!!error && <Banner message={error} className="mb-2" />}

          <TouchableOpacity
            activeOpacity={0.88}
            disabled={isLoading || busy || !selectedPlan?.pkg}
            onPress={handlePurchase}
            style={{
              marginTop: 4,
              borderRadius: 18,
              overflow: 'hidden',
              opacity: isLoading || busy || !selectedPlan?.pkg ? 0.72 : 1,
              shadowColor: '#3f2412',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: isLoading || busy ? 0 : 0.2,
              shadowRadius: 14,
              elevation: isLoading || busy ? 0 : 4,
            }}
          >
            <LinearGradient
              colors={['hsl(39 57% 51%)', 'hsl(32 48% 42%)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 16, alignItems: 'center' }}
            >
              {isLoading || busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17, letterSpacing: 0.2 }}>
                  Support Pottery Nook ✦
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void restore()}
            activeOpacity={0.7}
            disabled={isLoading}
            style={{ alignItems: 'center', paddingVertical: 10 }}
          >
            <Text style={{ fontSize: 13, color: 'hsl(24 20% 55%)', textDecorationLine: 'underline' }}>
              Restore previous purchase
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PaywallScreenShell>
  );
}
