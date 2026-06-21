import { Banner } from '@/src/components/Banner';
import { SectionLabel } from '@/src/components/SectionLabel';
import { SettingsGroup } from '@/src/components/SettingsGroup';
import { SettingsRow } from '@/src/components/SettingsRow';
import { Text } from '@/src/components/ui/text';
import {
  getSubscriptionDetails,
  openSubscriptionManagement,
  useEntitlements,
  type SubscriptionDetails,
} from '@/src/hooks/useEntitlements';
import {
  formatSubscriptionDate,
} from '@/src/utils/subscriptionSettings';
import { useRouter } from 'expo-router';
import {
  ChevronDown,
  Crown,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

const GOLD = 'hsl(39 57% 51%)';

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const { isPremium, restore, syncCustomerInfo, isLoading, error } = useEntitlements();
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    setLoadingDetails(true);
    try {
      await syncCustomerInfo();
      setDetails(await getSubscriptionDetails());
    } finally {
      setLoadingDetails(false);
    }
  }, [syncCustomerInfo]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    if (!loadingDetails && !isPremium) {
      router.replace('/premium');
    }
  }, [isPremium, loadingDetails, router]);

  async function handleManageSubscription() {
    setActionError(null);
    setBusy(true);
    try {
      const opened = await openSubscriptionManagement();
      if (!opened) {
        setActionError('Could not open subscription settings. Try again from your device settings.');
        return;
      }
      await loadDetails();
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    setActionError(null);
    await restore();
    await loadDetails();
  }

  const renewalLabel = details?.willRenew ? 'Renews' : 'Expires';
  const renewalDate = formatSubscriptionDate(details?.expirationDate);
  const storeLabel =
    details?.store === 'APP_STORE'
      ? 'App Store'
      : details?.store === 'PLAY_STORE'
        ? 'Google Play'
        : Platform.OS === 'ios'
          ? 'App Store'
          : Platform.OS === 'android'
            ? 'Google Play'
            : null;

  if (!isPremium && !loadingDetails) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={GOLD} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted/60 mr-3"
        >
          <ChevronDown size={20} color="hsl(24 30% 40%)" style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Manage Subscription</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">Your Pottery Nook Pro plan</Text>
        </View>
      </View>

      <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
        <View className="mx-6 mb-6 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-5 py-5">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-11 h-11 rounded-2xl bg-amber-100 items-center justify-center">
              <Crown size={22} color={GOLD} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Pottery Nook Pro</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">Active subscription</Text>
            </View>
            <View className="rounded-full bg-amber-100 px-3 py-1">
              <Text className="text-[11px] font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                Premium
              </Text>
            </View>
          </View>

          {loadingDetails ? (
            <ActivityIndicator color={GOLD} style={{ marginTop: 8 }} />
          ) : (
            <View className="gap-1.5 mt-1">
              {details?.planLabel ? (
                <Text className="text-sm text-foreground">
                  <Text className="font-semibold">Plan: </Text>
                  {details.planLabel}
                </Text>
              ) : null}
              {renewalDate ? (
                <Text className="text-sm text-foreground">
                  <Text className="font-semibold">{renewalLabel}: </Text>
                  {renewalDate}
                </Text>
              ) : null}
              {storeLabel ? (
                <Text className="text-sm text-muted-foreground">Billed through {storeLabel}</Text>
              ) : null}
            </View>
          )}

          <View className="flex-row items-center gap-2 mt-4 pt-4 border-t border-amber-200/60">
            <Sparkles size={14} color={GOLD} />
            <Text className="text-xs text-muted-foreground flex-1 leading-5">
              Thank you for supporting Pottery Nook, your subscription helps us build new tools for potters.
            </Text>
          </View>
        </View>

        <SectionLabel title="Subscription" />
        <SettingsGroup>
          <SettingsRow
            icon={ExternalLink}
            iconColor="hsl(213 80% 55%)"
            iconBg="bg-blue-50"
            label={Platform.OS === 'ios' ? 'Manage in App Store' : 'Manage in Google Play'}
            value={busy ? undefined : storeLabel ?? undefined}
            onPress={() => void handleManageSubscription()}
          />
          <SettingsRow
            icon={RefreshCw}
            iconColor="hsl(142 50% 40%)"
            iconBg="bg-green-50"
            label="Restore purchases"
            isLast
            onPress={() => void handleRestore()}
          />
        </SettingsGroup>

        {(!!error || !!actionError) && (
          <View className="mx-6 mt-4">
            <Banner message={actionError ?? error ?? ''} />
          </View>
        )}

        {isLoading && (
          <View className="items-center py-4">
            <ActivityIndicator color={GOLD} />
          </View>
        )}

        <Text className="mx-6 mt-6 mb-10 text-xs text-muted-foreground leading-5">
          To change your plan or cancel, use the subscription settings in {storeLabel ?? 'your app store'}.
          Cancellations take effect at the end of the current billing period, you keep access until then.
        </Text>
      </ScrollView>
    </View>
  );
}
