import { Colors } from '@/src/constants/theme';
import { Tabs } from 'expo-router';
import { BookOpen, Flame, Home, Layers, Users } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  return (
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
        }}
      />
      <Tabs.Screen
        name="pieces"
        options={{
          title: 'Pieces',
          tabBarIcon: ({ color }) => <Layers size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="kiln"
        options={{
          title: 'Kiln',
          tabBarIcon: ({ color }) => <Flame size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <BookOpen size={28} color={color} />,
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
        }}
      />
    </Tabs>
  );
}
