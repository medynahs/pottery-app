import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import GlazeLibraryScreen from '@/src/screens/glazes/GlazeLibraryScreen';

export default function GlazeLibraryRoute() {
  const { collection, glazeId } = useLocalSearchParams<{ collection?: string; glazeId?: string }>();
  return (
    <GlazeLibraryScreen
      collectionFilter={collection}
      initialGlazeId={typeof glazeId === 'string' ? glazeId : undefined}
    />
  );
}
