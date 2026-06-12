import DiscoverRecipeScreen from '@/src/screens/library/discover/DiscoverRecipeScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function DiscoverRecipeRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  React.useEffect(() => {
    if (!id || typeof id !== 'string') {
      router.back();
    }
  }, [id, router]);

  if (!id || typeof id !== 'string') {
    return null;
  }

  return <DiscoverRecipeScreen recipeId={id} />;
}
