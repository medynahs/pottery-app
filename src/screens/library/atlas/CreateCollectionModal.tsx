import { DialogCard, DialogShell } from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { sanitizeCustomCollections } from './collections';

export function CreateCollectionModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (visible) setName('');
  }, [visible]);

  const canSave = sanitizeCustomCollections([name]).length > 0;

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <DialogCard>
        <View className="px-6 pb-4 pt-6 border-b border-border">
          <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            New collection
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Group glazes by cone, color story, or production line.
          </Text>
        </View>
        <View className="px-6 py-5">
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Cone 6 blues, Dinnerware…"
            autoFocus
            maxLength={32}
          />
        </View>
        <View className="px-6 pb-6 flex-row gap-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 rounded-2xl border border-border py-3.5 items-center"
          >
            <Text className="text-sm font-semibold text-muted-foreground">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const clean = sanitizeCustomCollections([name])[0];
              if (!clean) return;
              onCreate(clean);
              onClose();
            }}
            disabled={!canSave}
            className={`flex-1 rounded-2xl bg-primary py-3.5 items-center ${canSave ? '' : 'opacity-45'}`}
          >
            <Text className="text-sm font-semibold text-white">Create</Text>
          </TouchableOpacity>
        </View>
      </DialogCard>
    </DialogShell>
  );
}
