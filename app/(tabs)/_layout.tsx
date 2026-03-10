import { Colors } from '@/src/constants/theme';
import { useAppStore } from '@/src/store';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Tabs } from 'expo-router';
import { BookOpen, Flame, Home, Layers, Users } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  const isModuleEnabled = useAppStore((s) => s.isModuleEnabled);

  return (
    <BottomSheetModalProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.mutedForeground,
        tabBarStyle: {
          backgroundColor: Colors.light.card,
          borderTopColor: Colors.light.border,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="overview"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <Home size={28} color={color} />,
          href: isModuleEnabled('overview') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="pieces"
        options={{
          title: 'Pieces',
          tabBarIcon: ({ color }) => <Layers size={28} color={color} />,
          href: isModuleEnabled('pieces') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="kiln"
        options={{
          title: 'Kiln',
          tabBarIcon: ({ color }) => <Flame size={28} color={color} />,
          href: isModuleEnabled('kiln') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <BookOpen size={28} color={color} />,
          href: isModuleEnabled('journal') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Users size={28} color={color} />,
          href: isModuleEnabled('community') ? undefined : null,
        }}
      />
    </Tabs>
    </BottomSheetModalProvider>
  );
}
