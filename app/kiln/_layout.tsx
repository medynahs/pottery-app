import { Stack } from 'expo-router';

export default function KilnLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[kilnId]" options={{ presentation: 'card' }} />
    </Stack>
  );
}
