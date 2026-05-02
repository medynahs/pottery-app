import { Text } from '@/src/components/ui/text';
import { StudiosTab } from '@/src/screens/community/tabs/StudiosTab';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudiosScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-2 px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center"
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="hsl(0 0% 30%)" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Studios</Text>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 gap-3 py-4">
          <StudiosTab />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
