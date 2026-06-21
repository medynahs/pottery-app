import { Checkbox } from '@/src/components/ui/checkbox';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import type { KilnChecklist } from '@/src/types/kiln';
import { ClipboardCheck, Plus, X } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

const DEFAULT_ITEM_IDS = new Set(['c1', 'c2', 'c3', 'c4', 'c5']);

interface PreFiringChecklistProps {
  items: KilnChecklist[];
  onToggle: (id: string) => void;
  onAdd?: (text: string) => void;
  onRemove?: (id: string) => void;
  compact?: boolean;
}

export function PreFiringChecklist({
  items,
  onToggle,
  onAdd,
  onRemove,
  compact = false,
}: PreFiringChecklistProps) {
  const [draft, setDraft] = React.useState('');
  const checkedCount = items.filter((item) => item.checked).length;
  const allChecked = items.length > 0 && checkedCount === items.length;

  const handleAdd = () => {
    const text = draft.trim();
    if (!text || !onAdd) return;
    onAdd(text);
    setDraft('');
  };

  return (
    <View
      className={`rounded-2xl border border-border bg-card ${compact ? 'p-3' : 'p-4'}`}
    >
      <View className="flex-row items-start justify-between gap-3 mb-3">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-8 h-8 rounded-xl bg-amber-50 items-center justify-center">
            <ClipboardCheck size={16} color="hsl(32 70% 40%)" />
          </View>
          <View className="flex-1">
            <Text className={`font-semibold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
              Pre-Firing Checklist
            </Text>
            <Text className="text-[11px] text-muted-foreground leading-4 mt-0.5">
              Boring steps that keep loads safe. Check before you load.
            </Text>
          </View>
        </View>
        {items.length > 0 ? (
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: allChecked ? 'hsl(142 40% 90%)' : 'hsl(34 30% 92%)' }}
          >
            <Text
              className="text-[10px] font-bold"
              style={{ color: allChecked ? 'hsl(142 50% 32%)' : 'hsl(32 40% 38%)' }}
            >
              {checkedCount}/{items.length}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="gap-2">
        {items.map((item) => {
          const isCustom = !DEFAULT_ITEM_IDS.has(item.id);
          return (
            <View key={item.id} className="flex-row items-center gap-3">
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => onToggle(item.id)}
              />
              <Text
                className={`flex-1 text-sm leading-5 ${
                  item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}
              >
                {item.text}
              </Text>
              {isCustom && onRemove ? (
                <TouchableOpacity
                  onPress={() => onRemove(item.id)}
                  hitSlop={8}
                  accessibilityLabel={`Remove checklist item: ${item.text}`}
                >
                  <X size={14} color="hsl(24 12% 55%)" />
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </View>

      {onAdd ? (
        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-border">
          <Input
            placeholder="Add your own step…"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            className="flex-1"
          />
          <TouchableOpacity
            onPress={handleAdd}
            disabled={!draft.trim()}
            className="w-10 h-10 rounded-xl items-center justify-center bg-primary/10"
            style={{ opacity: draft.trim() ? 1 : 0.45 }}
          >
            <Plus size={18} color="hsl(24 90% 45%)" />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export function isKilnChecklistComplete(items: KilnChecklist[]) {
  return items.length > 0 && items.every((item) => item.checked);
}
