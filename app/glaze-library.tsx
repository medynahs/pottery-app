import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

/** Legacy route — redirects to flat glaze detail or atlas tab. */
export default function GlazeLibraryRoute() {
  const { glazeId } = useLocalSearchParams<{ glazeId?: string; collection?: string }>();
  const router = useRouter();

  React.useEffect(() => {
    if (typeof glazeId === 'string' && glazeId.length > 0) {
      router.replace(`/glaze/${encodeURIComponent(glazeId)}` as never);
      return;
    }
    router.replace('/(tabs)/library' as never);
  }, [glazeId, router]);

  return null;
}
