import { ConfirmSheet } from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { DEFAULT_CLAY_BODIES, useAppStore, type ClayBody } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
  ChevronDown,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Clay Body Row ────────────────────────────────────────────────────────────

function ClayBodyRow({
  clay,
  isDefault,
  isLast,
  onRename,
  onRemove,
  onSetDefault,
}: {
  clay: ClayBody;
  isDefault: boolean;
  isLast: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
  onSetDefault: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(clay.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed) {
      onRename(trimmed);
      setDraft(trimmed);
    } else {
      setDraft(clay.name);
    }
    setEditing(false);
  }

  return (
    <View className={!isLast ? 'border-b border-border' : ''}>
      <ConfirmSheet
        visible={confirmOpen}
        title="Remove Clay Body?"
        body={`Remove "${clay.name}"?`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => { onRemove(); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />
      <View className="flex-row items-center gap-3 px-4 py-3.5">
        {/* Clay icon placeholder */}
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-stone-100">
          <Text className="text-base">🏺</Text>
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
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-medium text-foreground">{clay.name}</Text>
              {isDefault && (
                <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-semibold text-amber-700">Default</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Set default star */}
        <TouchableOpacity
          onPress={onSetDefault}
          className="w-7 h-7 items-center justify-center rounded-lg active:bg-muted"
          accessibilityLabel={isDefault ? 'Remove default' : 'Set as default'}
        >
          <Star
            size={14}
            color={isDefault ? 'hsl(38 80% 50%)' : 'hsl(24 20% 65%)'}
            fill={isDefault ? 'hsl(38 80% 50%)' : 'transparent'}
          />
        </TouchableOpacity>

        {/* Pencil (rename) */}
        <TouchableOpacity
          onPress={() => {
            if (editing) {
              commitRename();
            } else {
              setDraft(clay.name);
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

function AddClayBodyRow({ onAdd }: { onAdd: (name: string) => void }) {
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
        <Text className="text-sm font-medium text-muted-foreground">Add Clay Body</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="mx-5 mt-3 bg-card rounded-2xl border border-border px-4 py-3 flex-row items-center gap-3">
      <View className="w-9 h-9 rounded-xl items-center justify-center bg-stone-100">
        <Text className="text-base">🏺</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={commit}
        onBlur={() => {
          if (!value.trim()) setOpen(false);
        }}
        autoFocus
        placeholder="e.g. Red Stoneware"
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

export default function ClayBodiesScreen() {
  const router = useRouter();
  const clayBodies = useAppStore((s) => s.clayBodies);
  const defaultClayBodyId = useAppStore((s) => s.defaultClayBodyId);
  const addClayBody = useAppStore((s) => s.addClayBody);
  const removeClayBody = useAppStore((s) => s.removeClayBody);
  const renameClayBody = useAppStore((s) => s.renameClayBody);
  const setDefaultClayBody = useAppStore((s) => s.setDefaultClayBody);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  function handleReset() {
    setResetConfirmOpen(true);
  }

  return (
    <View className="flex-1 bg-background">
      <ConfirmSheet
        visible={resetConfirmOpen}
        title="Restore Defaults?"
        body="This will replace your clay bodies list with the built-in defaults."
        confirmLabel="Restore"
        destructive
        onConfirm={() => { useAppStore.setState({ clayBodies: DEFAULT_CLAY_BODIES, defaultClayBodyId: 'stoneware' }); setResetConfirmOpen(false); }}
        onCancel={() => setResetConfirmOpen(false)}
      />
      <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted/60 mr-3"
        >
          <ChevronDown size={20} color="hsl(24 30% 40%)" style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Clay Bodies</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {clayBodies.length} saved · tap ★ to set default
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Text className="text-sm text-muted-foreground px-5 pt-4 pb-2 leading-5">
          Manage the clay bodies you work with. Your list will appear as quick-pick options
          when adding a new piece. Star one to make it the default selection.
        </Text>

        {/* Clay bodies list */}
        <View className="mx-5 mt-3 bg-card rounded-2xl border border-border overflow-hidden">
          {clayBodies.map((clay, idx) => (
            <ClayBodyRow
              key={clay.id}
              clay={clay}
              isDefault={defaultClayBodyId === clay.id}
              isLast={idx === clayBodies.length - 1}
              onRename={(name) => renameClayBody(clay.id, name)}
              onRemove={() => removeClayBody(clay.id)}
              onSetDefault={() =>
                setDefaultClayBody(defaultClayBodyId === clay.id ? null : clay.id)
              }
            />
          ))}
          {clayBodies.length === 0 && (
            <View className="px-4 py-6 items-center">
              <Text className="text-sm text-muted-foreground text-center">
                No clay bodies yet. Add one below.
              </Text>
            </View>
          )}
        </View>

        {/* Add new */}
        <AddClayBodyRow onAdd={addClayBody} />

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
