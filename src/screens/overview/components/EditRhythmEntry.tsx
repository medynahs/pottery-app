import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import React from 'react';

export function EditRhythmEntry() {
  const router = useRouter();

  return (
    <Card className="rounded-2xl border-border bg-card p-4">
      <Text className="text-base font-serif font-bold text-foreground">Studio Rhythm</Text>
      <Text className="text-sm text-muted-foreground mt-1 mb-3">
        Your weekly rhythm guides suggestions in the studio.
      </Text>
      <Button
        size="sm"
        variant="outline"
        className="self-start rounded-xl px-4"
        onPress={() => router.push('/profile/studio-rhythm')}
      >
        <Text className="text-sm">Edit Rhythm</Text>
      </Button>
    </Card>
  );
}
