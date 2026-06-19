import DiscoverInspirationScreen from '@/src/screens/library/discover/DiscoverInspirationScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function DiscoverInspirationRoute() {
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

  return <DiscoverInspirationScreen inspirationId={id} />;
}
