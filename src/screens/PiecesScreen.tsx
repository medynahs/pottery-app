// src/screens/PiecesScreen.tsx
import { clsx } from 'clsx';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

type Piece = {
  id: string;
  name: string;
  stage: string;
};

const dummyPieces: Piece[] = [
  { id: '1', name: 'Small Vase', stage: 'In Progress' },
  { id: '2', name: 'Coffee Mug', stage: 'Glazed' },
];

export default function PiecesScreen() {
  const renderItem = ({ item }: { item: Piece }) => (
    <View className={clsx('bg-[#FFF2E8] p-4 rounded-2xl mb-3')}>
      <Text className="text-lg font-semibold text-[#3E3E3E]">{item.name}</Text>
      <Text className="text-sm text-[#A78B7B]">{item.stage}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#FFF7F0] px-5 pt-5">
      <Text className="text-2xl font-semibold text-[#3E3E3E] mb-4">Pieces</Text>
      <FlatList
        data={dummyPieces}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <TouchableOpacity
        className="absolute bottom-6 right-5 bg-[#B56576] px-5 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">+ Add Piece</Text>
      </TouchableOpacity>
    </View>
  );
}