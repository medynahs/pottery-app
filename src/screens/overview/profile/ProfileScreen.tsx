import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useAppStore } from '@/src/store';
import { PremiumFeature } from '@/src/utils/premiumGate';
import { useRouter } from 'expo-router';
import { BarChart2, CalendarDays, Crown } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ProfileTabBar } from './components/ProfileTabBar';
import { ProfileHeader } from './components/ProfileHeader';
import { JourneyTab } from './tabs/JourneyTab';
import { PostsTab } from './tabs/PostsTab';
import type { Tab } from './types';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('journey');
  const meQuery = useCurrentUser();
  const isPremium = useAppStore((s) => s.isPremium);
  const { requestAccess, PaywallGate } = usePremiumGate();

  const onRefresh = useCallback(async () => {
    await meQuery.refetch();
  }, [meQuery.refetch]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={meQuery.isFetching} onRefresh={onRefresh} />
      }
    >
      <ProfileHeader
        onBack={() => router.back()}
        onOpenAccountSettings={() => router.push('/account-settings')}
      />

      {/* Premium upgrade banner — shown to free users only */}
      {!isPremium && (
        <TouchableOpacity
          onPress={() => router.push('/premium')}
          activeOpacity={0.8}
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FEF9ED',
            borderWidth: 1,
            borderColor: '#E8D9BE',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Crown size={16} color="hsl(39, 57%, 51%)" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'hsl(24, 25%, 15%)' }}>
              Upgrade to Premium
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: 'hsl(24, 20%, 45%)' }}>Unlock all features →</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => {
          if (requestAccess(PremiumFeature.Analytics)) {
            router.push('/analytics' as never);
          }
        }}
        activeOpacity={0.8}
        style={{
          marginHorizontal: 16,
          marginBottom: 10,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: 'hsl(39 55% 96%)',
          borderWidth: 1,
          borderColor: 'hsl(39 35% 84%)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'hsl(39 70% 92%)',
              }}
            >
              <BarChart2 size={18} color="hsl(39 57% 51%)" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: 'hsl(24 25% 15%)' }}>
                Studio Stats
              </Text>
              <Text style={{ fontSize: 12, color: 'hsl(24 20% 45%)', marginTop: 2 }}>
                Costs, materials, firings, and studio trends
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: 'hsl(39 57% 51%)' }}>
            {isPremium ? 'Open →' : 'Premium'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/profile/studio-rhythm')}
        activeOpacity={0.8}
        style={{
          marginHorizontal: 16,
          marginBottom: 10,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: 'hsl(213 55% 96%)',
          borderWidth: 1,
          borderColor: 'hsl(213 35% 84%)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'hsl(213 70% 92%)',
              }}
            >
              <CalendarDays size={18} color="hsl(213 70% 45%)" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: 'hsl(24 25% 15%)' }}>
                Studio Rhythm
              </Text>
              <Text style={{ fontSize: 12, color: 'hsl(24 20% 45%)', marginTop: 2 }}>
                Tune your weekly cadence and daily checklist
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: 'hsl(213 70% 45%)' }}>Open →</Text>
        </View>
      </TouchableOpacity>

      <ProfileTabBar active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'journey' && <JourneyTab />}
      {activeTab === 'posts'   && <PostsTab />}
      {PaywallGate}
      <View className="h-8" />
    </ScrollView>
  );
}
