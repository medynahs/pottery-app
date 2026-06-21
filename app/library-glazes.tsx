import { useRouter } from 'expo-router';
import React from 'react';

/** Legacy route, redirects to the Glaze Atlas tab. */
export default function LibraryGlazesRoute() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/(tabs)/library' as never);
  }, [router]);

  return null;
}
