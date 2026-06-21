import PublicUserProfileScreen from '@/src/screens/overview/profile/PublicUserProfileScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';

export default function UserProfileRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const userId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;

  if (!userId) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-muted-foreground text-center">Profile not found.</Text>
      </View>
    );
  }

  return <PublicUserProfileScreen userId={userId} />;
}
