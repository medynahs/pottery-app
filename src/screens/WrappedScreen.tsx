// src/screens/CommunityScreen.tsx
import { clsx } from 'clsx';
import React from 'react';
import { FlatList, Text, View } from 'react-native';

const dummyWrapped = [
  { id: '1', text: 'Cone 6 was the most fired this week' },
  { id: '2', text: 'Susan is proud of her new mug' },
  { id: '3', text: '5 failures honored this month' },
];

export default function CommunityScreen() {
  const renderItem = ({ item }: { item: { id: string; text: string } }) => (
    <View className={clsx('bg-[#FFF2E8] p-4 rounded-2xl mb-3')}>
      <Text className="text-sm text-[#3E3E3E]">{item.text}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#FFF7F0] px-5 pt-5">
      <Text className="text-2xl font-semibold text-[#3E3E3E] mb-4">Wrapped</Text>
      <FlatList
        data={dummyWrapped}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}