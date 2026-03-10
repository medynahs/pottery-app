// src/screens/kiln/components/LoadingChecklist.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react-native';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import type { KilnChecklist } from '../types';

interface LoadingChecklistProps {
  items: KilnChecklist[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (text: string) => void;
}

function ChecklistRow({
  item,
  onToggle,
  onRemove,
  mutedForeground,
}: {
  item: KilnChecklist;
  onToggle: () => void;
  onRemove: () => void;
  mutedForeground: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2.5 border-b border-border/50">
      <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
            item.checked ? 'bg-primary border-primary' : 'border-muted-foreground'
          }`}
        >
          {item.checked && <CheckCircle2 size={11} color="white" />}
        </View>
      </TouchableOpacity>
      <Text
        className={`text-sm flex-1 ${
          item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
        }`}
      >
        {item.text}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Trash2 size={13} color={mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

export function LoadingChecklist({ items, onToggle, onRemove, onAdd }: LoadingChecklistProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [text, setText] = React.useState('');

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
  };

  return (
    <Card className="p-5">
      {items.map((item) => (
        <ChecklistRow
          key={item.id}
          item={item}
          onToggle={() => onToggle(item.id)}
          onRemove={() => onRemove(item.id)}
          mutedForeground={colors.mutedForeground}
        />
      ))}
      {items.length === 0 && (
        <Text className="text-sm text-muted-foreground py-2">No checklist items yet.</Text>
      )}
      <View className="flex-row gap-2 mt-4">
        <TextInput
          placeholder="Add custom task..."
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            color: colors.foreground,
            fontSize: 14,
          }}
          placeholderTextColor={colors.mutedForeground}
        />
        <TouchableOpacity
          onPress={handleAdd}
          className="w-10 h-10 rounded-xl bg-primary items-center justify-center"
        >
          <Plus size={18} color="white" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}
