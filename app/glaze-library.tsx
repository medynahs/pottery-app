import { collectionNameToSlug } from '@/src/screens/library/atlas/collections';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

/** Legacy route, redirects to collection or glaze detail. */
export default function GlazeLibraryRoute() {
  const { glazeId, collection } = useLocalSearchParams<{
    glazeId?: string;
    collection?: string;
  }>();
  const router = useRouter();

  React.useEffect(() => {
    if (typeof glazeId === 'string' && glazeId.length > 0) {
      router.replace(`/glaze/${encodeURIComponent(glazeId)}` as never);
      return;
    }
    if (typeof collection === 'string' && collection.length > 0) {
      router.replace(`/(tabs)/library?collection=${collectionNameToSlug(collection)}` as never);
      return;
    }
    router.replace('/(tabs)/library' as never);
  }, [glazeId, collection, router]);

  return null;
}
