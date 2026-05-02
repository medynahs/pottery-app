/**
 * PremiumUpgradeScreen — personal-tone upgrade / subscription management screen
 */
import { Text } from '@/src/components/ui/text';
import { presentCustomerCenter, useEntitlements } from '@/src/hooks/useEntitlements';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    View,
} from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlanKey = 'lifetime' | 'annual' | 'monthly';

const FEATURES = [
  { icon: '📸', label: 'Unlimited photos per piece' },
  { icon: '🎨', label: 'Unlimited glazes & collections' },
  { icon: '🌿', label: 'All 4 elemental companions + free swap' },
  { icon: '📊', label: 'Studio & kiln analytics' },
  { icon: '💰', label: 'Full pricing presets' },
  { icon: '📤', label: 'Data export & backup' },
  { icon: '🎯', label: 'Unlimited weekly missions' },
  { icon: '🎁', label: 'Yearly pottery wrap' },
] as const;

export default function PremiumUpgradeScreen() {
  const router = useRouter();
  const { isPremium, offering, purchase, restore, isLoading, error } = useEntitlements();
  const [selected, setSelected] = useState<PlanKey>('annual');
  const [busy, setBusy] = useState(false);

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
      key: 'lifetime',
      label: 'Lifetime',
      badge: '✦ Pay once',
      description: 'One payment, yours forever',
      pkg: offering?.lifetime ?? undefined,
      price: offering?.lifetime?.product.priceString ?? '—',
      perPeriod: '',
    },
    {
      key: 'annual',
      label: 'Yearly',
      badge: 'Save 42%',
      description: 'Full access, renewed yearly',
      pkg: offering?.annual ?? undefined,
      price: offering?.annual?.product.priceString ?? '—',
      perPeriod: '/ year',
    },
    {
      key: 'monthly',
      label: 'Monthly',
      badge: null,
      description: 'Flexible, cancel anytime',
      pkg: offering?.monthly ?? undefined,
      price: offering?.monthly?.product.priceString ?? '—',
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

  async function handleManage() {
    setBusy(true);
    try {
      await presentCustomerCenter();
    } finally {
      setBusy(false);
    }
  }

  // ─── Premium (thank-you) state ────────────────────────────────────────────

  if (isPremium) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBF2' }} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFE3CC', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 17, color: 'hsl(24 25% 35%)', lineHeight: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 }}>
          <Text style={{ fontSize: 56, marginBottom: 20 }}>🤎</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: 'hsl(24 25% 15%)', textAlign: 'center', marginBottom: 14, lineHeight: 30, fontFamily: 'Fraunces_700Bold' }}>
            Thank you so much
          </Text>
          <Text style={{ fontSize: 15, color: 'hsl(24 20% 40%)', textAlign: 'center', lineHeight: 24, marginBottom: 40 }}>
            Your support means the world to our small team. It goes directly into building new features, companions, and tools for potters everywhere.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={busy}
            onPress={handleManage}
            style={{ backgroundColor: '#F0E6CF', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 32, alignItems: 'center' }}
          >
            {busy
              ? <ActivityIndicator color="hsl(24 25% 40%)" />
              : <Text style={{ color: 'hsl(24 25% 25%)', fontWeight: '700', fontSize: 15 }}>Manage Subscription</Text>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Free user upgrade flow ───────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBF2' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 28 }}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>🏺</Text>
          <Text style={{
            fontSize: 26, fontWeight: '700',
            color: 'hsl(24 25% 15%)',
            textAlign: 'center',
            marginBottom: 14,
            lineHeight: 34,
            fontFamily: 'Fraunces_700Bold',
          }}>
            Pottery Nook would love{'\n'}your support
          </Text>
          <Text style={{ fontSize: 15, color: 'hsl(24 20% 38%)', textAlign: 'center', lineHeight: 24, maxWidth: 300 }}>
            We're a small independent team building this app with genuine love for the craft. Your support goes directly into new features, companions, and tools made for potters. 🤎
          </Text>
        </View>

        {/* What you unlock */}
        <View style={{
          backgroundColor: '#FFF8F0',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#E8D9BE',
          paddingVertical: 18,
          paddingHorizontal: 20,
          marginBottom: 28,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: 'hsl(24 40% 52%)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 }}>
            Everything unlocked
          </Text>
          {FEATURES.map((f, i) => (
            <View
              key={f.label}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < FEATURES.length - 1 ? 13 : 0 }}
            >
              <Text style={{ fontSize: 18, marginRight: 14, width: 26, textAlign: 'center' }}>{f.icon}</Text>
              <Text style={{ fontSize: 14, color: 'hsl(24 25% 20%)', flex: 1, lineHeight: 20 }}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Plan cards */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: 'hsl(24 40% 52%)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
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
                borderRadius: 16,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? 'hsl(24 75% 45%)' : '#DDD0B8',
                backgroundColor: isSelected ? '#FFF4E8' : '#FDFAF4',
                padding: 16,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {/* Radio dot */}
              <View style={{
                width: 20, height: 20, borderRadius: 10,
                borderWidth: isSelected ? 6 : 2,
                borderColor: isSelected ? 'hsl(24 75% 45%)' : '#C9B48C',
                marginRight: 14,
              }} />

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: 'hsl(24 25% 15%)' }}>{plan.label}</Text>
                  {plan.badge ? (
                    <View style={{
                      backgroundColor: isSelected ? 'hsl(24 75% 45%)' : '#F0E6CF',
                      borderRadius: 99,
                      paddingHorizontal: 8, paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isSelected ? '#fff' : 'hsl(24 40% 40%)' }}>
                        {plan.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ fontSize: 12, color: 'hsl(24 20% 52%)' }}>{plan.description}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: isSelected ? 'hsl(24 75% 45%)' : 'hsl(24 25% 30%)' }}>
                  {plan.price}
                </Text>
                {plan.perPeriod ? (
                  <Text style={{ fontSize: 11, color: 'hsl(24 20% 55%)' }}>{plan.perPeriod}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 6 }} />

        {/* Error */}
        {!!error && (
          <View style={{ backgroundColor: '#FEE2E2', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 }}>
            <Text style={{ color: '#991B1B', fontSize: 13, textAlign: 'center' }}>{error}</Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.88}
          disabled={isLoading || busy || !selectedPlan?.pkg}
          onPress={handlePurchase}
          style={{
            backgroundColor: isLoading || busy ? '#C9B48C' : 'hsl(24 75% 45%)',
            borderRadius: 18,
            paddingVertical: 17,
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          {isLoading || busy
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17, letterSpacing: 0.2 }}>
                Support Pottery Nook ✦
              </Text>
          }
        </TouchableOpacity>

        {/* Restore */}
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

        {/* Legal */}
        <Text style={{ fontSize: 11, color: 'hsl(24 20% 62%)', textAlign: 'center', marginTop: 16, lineHeight: 16 }}>
          Subscriptions renew automatically. Cancel anytime from your subscription settings.
        </Text>

        {/* Maybe later */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.6}
          style={{ alignItems: 'center', paddingVertical: 20 }}
        >
          <Text style={{ fontSize: 14, color: 'hsl(24 20% 60%)' }}>Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
