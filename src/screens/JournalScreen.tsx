// src/screens/JournalScreen.tsx
import { clsx } from 'clsx';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

type JournalEntry = {
  id: string;
  title: string;
  date: string;
  notes: string;
};

export default function JournalScreen() {
  const entries: JournalEntry[] = []; // This would come from state or a data source

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      className={clsx(
        'bg-[#FFF2E8] p-4 rounded-2xl mb-4 shadow-md',
      )}
    >
      <Text className="text-lg font-semibold text-[#3E3E3E] mb-1">{item.title}</Text>
      <Text className="text-xs text-[#A78B7B] mb-2">{item.date}</Text>
      <Text className="text-sm text-[#3E3E3E]">{item.notes}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#FFF7F0] px-5 pt-3">
      {/* Optional cozy illustration */}
 
      <Text className="text-2xl font-semibold text-[#3E3E3E] mb-4">My Journal</Text>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text className="text-sm text-[#A78B7B] text-center mt-10">
            Your pottery notes will appear here. Start reflecting!
          </Text>
        }
      />
    </View>
  );
}