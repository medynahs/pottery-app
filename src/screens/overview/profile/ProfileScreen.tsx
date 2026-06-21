import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Crown } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { ProfileTabBar } from './components/ProfileTabBar';
import { ProfileHeader } from './components/ProfileHeader';
import { JourneyTab } from './tabs/JourneyTab';
import { PostsTab } from './tabs/PostsTab';
import { WorkTab } from './tabs/WorkTab';
import type { Tab } from './types';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('work');
  const meQuery = useCurrentUser();
  const isPremium = useAppStore((s) => s.isPremium);
  const { PaywallGate } = usePremiumGate();

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

      {/* Premium upgrade banner, shown to free users only */}
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

      <ProfileTabBar active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'work'    && <WorkTab />}
      {activeTab === 'posts'   && <PostsTab />}
      {activeTab === 'journey' && <JourneyTab />}
      {PaywallGate}
      <View className="h-8" />
    </ScrollView>
  );
}
