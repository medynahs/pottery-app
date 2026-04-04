import { ConfirmSheet } from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { DEFAULT_FORMING_METHODS, type FormingMethod, useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
    ChevronDown,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Forming Method Row ───────────────────────────────────────────────────────

function FormingMethodRow({
  method,
  isLast,
  onRename,
  onRemove,
}: {
  method: FormingMethod;
  isLast: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(method.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed) {
      onRename(trimmed);
      setDraft(trimmed);
    } else {
      setDraft(method.name);
    }
    setEditing(false);
  }

  return (
    <View className={!isLast ? 'border-b border-border' : ''}>
      <ConfirmSheet
        visible={confirmOpen}
        title="Remove Forming Method?"
        body={`Remove "${method.name}"?`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => { onRemove(); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />
      <View className="flex-row items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-stone-100">
          <Text className="text-base">🤲</Text>
        </View>

        {/* Name / edit field */}
        <View className="flex-1">
          {editing ? (
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onBlur={commitRename}
              onSubmitEditing={commitRename}
              autoFocus
              returnKeyType="done"
              className="text-sm font-medium text-foreground py-0.5 border-b border-primary"
              style={{ fontFamily: 'DMSans_500Medium' }}
            />
          ) : (
            <Text className="text-sm font-medium text-foreground">{method.name}</Text>
          )}
        </View>

        {/* Pencil (rename) */}
        <TouchableOpacity
          onPress={() => {
            if (editing) {
              commitRename();
            } else {
              setDraft(method.name);
              setEditing(true);
            }
          }}
          className="w-7 h-7 items-center justify-center rounded-lg active:bg-muted"
        >
          <Pencil size={13} color={editing ? 'hsl(213 80% 55%)' : 'hsl(24 20% 60%)'} />
        </TouchableOpacity>

        {/* Trash (remove) */}
        <TouchableOpacity
          onPress={() => setConfirmOpen(true)}
          className="w-7 h-7 items-center justify-center rounded-lg active:bg-muted"
        >
          <Trash2 size={13} color="hsl(0 55% 50%)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Add Row ──────────────────────────────────────────────────────────────────

function AddFormingMethodRow({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  function commit() {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        className="flex-row items-center justify-center gap-2 mx-5 mt-3 py-3.5 rounded-2xl border border-dashed border-border bg-card"
      >
        <Plus size={15} color="hsl(24 30% 50%)" />
        <Text className="text-sm font-medium text-muted-foreground">Add Forming Method</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="mx-5 mt-3 bg-card rounded-2xl border border-border px-4 py-3 flex-row items-center gap-3">
      <View className="w-9 h-9 rounded-xl items-center justify-center bg-stone-100">
        <Text className="text-base">🤲</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={commit}
        onBlur={() => {
          if (!value.trim()) setOpen(false);
        }}
        autoFocus
        placeholder="e.g. Hand-built"
        returnKeyType="done"
        className="flex-1 text-sm text-foreground"
        style={{ fontFamily: 'DMSans_400Regular' }}
        placeholderTextColor="hsl(24 20% 65%)"
      />
      <TouchableOpacity
        onPress={commit}
        className="px-3 py-1.5 rounded-xl bg-foreground"
      >
        <Text className="text-xs font-semibold text-background">Add</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FormingMethodsScreen() {
  const router = useRouter();
  const formingMethods = useAppStore((s) => s.formingMethods);
  const addFormingMethod = useAppStore((s) => s.addFormingMethod);
  const removeFormingMethod = useAppStore((s) => s.removeFormingMethod);
  const renameFormingMethod = useAppStore((s) => s.renameFormingMethod);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  function handleReset() {
    setResetConfirmOpen(true);
  }

  return (
    <View className="flex-1 bg-background">
      <ConfirmSheet
        visible={resetConfirmOpen}
        title="Restore Defaults?"
        body="This will replace your forming methods list with the built-in defaults."
        confirmLabel="Restore"
        destructive
        onConfirm={() => { useAppStore.setState({ formingMethods: DEFAULT_FORMING_METHODS }); setResetConfirmOpen(false); }}
        onCancel={() => setResetConfirmOpen(false)}
      />
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted/60 mr-3"
        >
          <ChevronDown size={20} color="hsl(24 30% 40%)" style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Forming Methods</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {formingMethods.length} methods
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Text className="text-sm text-muted-foreground px-5 pt-4 pb-2 leading-5">
          Manage the forming methods available when adding a piece. Add your own or remove ones
          you don't use.
        </Text>

        {/* List */}
        <View className="mx-5 mt-3 bg-card rounded-2xl border border-border overflow-hidden">
          {formingMethods.map((method, idx) => (
            <FormingMethodRow
              key={method.id}
              method={method}
              isLast={idx === formingMethods.length - 1}
              onRename={(name) => renameFormingMethod(method.id, name)}
              onRemove={() => removeFormingMethod(method.id)}
            />
          ))}
          {formingMethods.length === 0 && (
            <View className="px-4 py-6 items-center">
              <Text className="text-sm text-muted-foreground text-center">
                No forming methods yet. Add one below.
              </Text>
            </View>
          )}
        </View>

        {/* Add new */}
        <AddFormingMethodRow onAdd={addFormingMethod} />

        {/* Restore defaults */}
        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 mx-5 mt-4 mb-10 py-3.5 rounded-2xl border border-border bg-card"
        >
          <RotateCcw size={15} color="hsl(0 55% 50%)" />
          <Text className="text-sm font-medium text-destructive">Restore Defaults</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
