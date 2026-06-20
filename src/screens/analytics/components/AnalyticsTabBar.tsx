import { Text } from '@/src/components/ui/text';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ANALYTICS_THEME } from '../analyticsTheme';

export type AnalyticsTabId = 'overview' | 'costs' | 'firings' | 'pieces' | 'materials';

export type AnalyticsTab = {
  id: AnalyticsTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

export function AnalyticsTabBar({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: AnalyticsTab[];
  activeTab: AnalyticsTabId;
  onChange: (tab: AnalyticsTabId) => void;
}) {
  return (
    <View
      className="py-3"
      style={{
        backgroundColor: ANALYTICS_THEME.pageBg,
        borderBottomWidth: 1,
        borderBottomColor: ANALYTICS_THEME.cardBorder,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = id === activeTab;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => onChange(id)}
              activeOpacity={0.82}
              className="flex-row items-center gap-2 rounded-2xl px-4 py-2.5 border"
              style={{
                backgroundColor: active ? ANALYTICS_THEME.chipActiveBg : ANALYTICS_THEME.chipIdleBg,
                borderColor: active ? ANALYTICS_THEME.chipActiveBg : ANALYTICS_THEME.cardBorder,
                shadowColor: active ? ANALYTICS_THEME.shadow : 'transparent',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: active ? 0.18 : 0,
                shadowRadius: 6,
                elevation: active ? 3 : 0,
              }}
            >
              <View
                className="w-7 h-7 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: active ? 'rgba(255, 244, 224, 0.16)' : ANALYTICS_THEME.accentSoft,
                }}
              >
                <Icon size={15} color={active ? ANALYTICS_THEME.heroText : ANALYTICS_THEME.inkSoft} />
              </View>
              <Text
                className="text-xs font-bold"
                style={{ color: active ? ANALYTICS_THEME.heroText : ANALYTICS_THEME.inkSoft }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
