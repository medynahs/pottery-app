import GlazeCollectionScreen from '@/src/screens/library/GlazeCollectionScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function GlazeCollectionRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();

  React.useEffect(() => {
    if (!slug || typeof slug !== 'string') {
      router.back();
    }
  }, [slug, router]);

  if (!slug || typeof slug !== 'string') {
    return null;
  }

  return <GlazeCollectionScreen collectionSlug={slug} />;
}
