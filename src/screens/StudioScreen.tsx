// src/screens/StudioScreen.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function StudioScreen() {
  return (
    <View className="flex-1 bg-[#FFF7F0] px-5 pt-5">
      <Text className="text-2xl font-semibold text-[#3E3E3E] mb-4">Studio</Text>
      {/* Cozy studio illustration */}
    
      <TouchableOpacity className="bg-[#B56576] px-5 py-3 rounded-full">
        <Text className="text-white font-semibold">+ Add Member / Piece</Text>
      </TouchableOpacity>
    </View>
  );
}