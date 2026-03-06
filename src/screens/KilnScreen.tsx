// src/screens/KilnScreen.tsx
import { clsx } from 'clsx';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

type KilnItem = {
  id: string;
  name: string;
  status: string;
};

const dummyKilnItems: KilnItem[] = [
  { id: '1', name: 'Cylinder Set', status: 'Ready' },
  { id: '2', name: 'Mug Batch', status: 'Bisque' },
];

export default function KilnScreen() {
  const renderItem = ({ item }: { item: KilnItem }) => (
    <View className={clsx('bg-[#FFF2E8] p-4 rounded-2xl mb-3')}>
      <Text className="text-lg font-semibold text-[#3E3E3E]">{item.name}</Text>
      <Text className="text-sm text-[#A78B7B]">{item.status}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#FFF7F0] px-5 pt-5">
      <Text className="text-2xl font-semibold text-[#3E3E3E] mb-4">Kiln</Text>
      <FlatList
        data={dummyKilnItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <TouchableOpacity
        className="absolute bottom-6 right-5 bg-[#B56576] px-5 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">+ Add Firing</Text>
      </TouchableOpacity>
    </View>
  );
}