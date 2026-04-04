import GlazeLibraryScreen from '@/src/screens/glazes/GlazeLibraryScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function GlazeLibraryRoute() {
  const { collection } = useLocalSearchParams<{ collection?: string }>();
  return <GlazeLibraryScreen collectionFilter={collection} />;
}