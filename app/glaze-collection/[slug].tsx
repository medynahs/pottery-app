import { collectionNameToSlug } from '@/src/screens/library/atlas/collections';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

/** Legacy collection URLs, open My Atlas with the collection filter applied. */
export default function GlazeCollectionRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();

  React.useEffect(() => {
    if (!slug || typeof slug !== 'string') {
      router.replace('/(tabs)/library' as never);
      return;
    }
    router.replace(`/(tabs)/library?collection=${collectionNameToSlug(slugToCollectionKey(slug))}` as never);
  }, [slug, router]);

  return null;
}

function slugToCollectionKey(slug: string): string {
  if (slug === 'all') return 'all';
  if (slug === 'favorites') return 'favorites';
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
