import { ShrinkageCalculatorSheet } from '@/src/screens/pieces/modals/ShrinkageCalculatorSheet';
import { ConfirmSheet } from '@/src/components/AppSheets';
import { CustomizationSettingsShell } from '@/src/components/settings/CustomizationSettingsShell';
import { Text } from '@/src/components/ui/text';
import { DEFAULT_CLAY_BODIES, useAppStore, type ClayBody } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
  Pencil,
  Plus,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
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
  onSetShrinkage,
}: {
  clay: ClayBody;
  isDefault: boolean;
  isLast: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
  onSetDefault: () => void;
  onSetShrinkage: (shrinkagePct: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(clay.name);
  const [shrinkageDraft, setShrinkageDraft] = useState(
    clay.shrinkagePct != null ? String(clay.shrinkagePct) : '',
  );
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

  function commitShrinkage() {
    const parsed = Number(shrinkageDraft.replace(',', '.'));
    onSetShrinkage(
      shrinkageDraft.trim() === '' || !Number.isFinite(parsed)
        ? null
        : Math.min(30, Math.max(0, parsed)),
    );
  }

  return (
    <View className={!isLast ? 'border-b border-border' : ''} style={isDefault ? { backgroundColor: 'rgba(242, 194, 94, 0.18)', borderRadius: 12, marginHorizontal: 4 } : undefined}>
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
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-[11px] text-muted-foreground">Shrinkage %</Text>
            <TextInput
              value={shrinkageDraft}
              onChangeText={setShrinkageDraft}
              onBlur={commitShrinkage}
              onSubmitEditing={commitShrinkage}
              keyboardType="decimal-pad"
              placeholder="12"
              className="min-w-[44px] text-[11px] text-foreground border-b border-border py-0.5"
              style={{ fontFamily: 'DMSans_500Medium' }}
              placeholderTextColor="hsl(24 20% 65%)"
            />
          </View>
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
        className="flex-row items-center justify-center gap-2 mt-3 py-3.5 rounded-2xl border border-dashed border-border bg-card"
      >
        <Plus size={15} color="hsl(24 30% 50%)" />
        <Text className="text-sm font-medium text-muted-foreground">Add Clay Body</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="mt-3 bg-card rounded-2xl border border-border px-4 py-3 flex-row items-center gap-3">
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
  const markSetupProgress = useAppStore((s) => s.markSetupProgress);
  const router = useRouter();
  const clayBodies = useAppStore((s) => s.clayBodies);
  const defaultClayBodyId = useAppStore((s) => s.defaultClayBodyId);
  const addClayBody = useAppStore((s) => s.addClayBody);
  const removeClayBody = useAppStore((s) => s.removeClayBody);
  const renameClayBody = useAppStore((s) => s.renameClayBody);
  const setDefaultClayBody = useAppStore((s) => s.setDefaultClayBody);
  const setClayBodyShrinkage = useAppStore((s) => s.setClayBodyShrinkage);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [shrinkageOpen, setShrinkageOpen] = useState(false);

  function handleReset() {
    setResetConfirmOpen(true);
  }

  function handleSave() {
    markSetupProgress('clayBodiesReviewed');
    router.back();
  }

  function handleAdd(name: string) {
    addClayBody(name);
  }

  return (
    <>
    <CustomizationSettingsShell
      eyebrow="Studio materials"
      title="Set your clay bodies"
      subtitle="Manage the clay bodies you work with. Set shrinkage % for the size calculator. Star one to make it the default selection."
      headerNote={`${clayBodies.length} saved · tap ★ to set default`}
      onBack={() => router.back()}
      onSave={handleSave}
    >
      <ConfirmSheet
        visible={resetConfirmOpen}
        title="Restore Defaults?"
        body="This will replace your clay bodies list with the built-in defaults."
        confirmLabel="Restore"
        destructive
        onConfirm={() => { useAppStore.setState({ clayBodies: DEFAULT_CLAY_BODIES, defaultClayBodyId: 'stoneware' }); setResetConfirmOpen(false); }}
        onCancel={() => setResetConfirmOpen(false)}
      />

      <TouchableOpacity
        onPress={() => setShrinkageOpen(true)}
        activeOpacity={0.75}
        className="mb-4 self-start"
      >
        <Text className="text-sm font-semibold text-primary">Open shrinkage calculator</Text>
      </TouchableOpacity>

      <View className="mt-1 bg-card rounded-2xl border border-border overflow-hidden">
          {clayBodies.map((clay, idx) => (
            <ClayBodyRow
              key={clay.id}
              clay={clay}
              isDefault={defaultClayBodyId === clay.id}
              isLast={idx === clayBodies.length - 1}
              onRename={(name) => renameClayBody(clay.id, name)}
              onRemove={() => removeClayBody(clay.id)}
              onSetDefault={() => setDefaultClayBody(defaultClayBodyId === clay.id ? null : clay.id)}
              onSetShrinkage={(shrinkagePct) => setClayBodyShrinkage(clay.id, shrinkagePct)}
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
        <AddClayBodyRow onAdd={handleAdd} />

        {/* Restore defaults */}
        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 mt-4 mb-2 py-3.5 rounded-2xl border border-border bg-card"
        >
          <RotateCcw size={15} color="hsl(0 55% 50%)" />
          <Text className="text-sm font-medium text-destructive">Restore Defaults</Text>
        </TouchableOpacity>
    </CustomizationSettingsShell>
    <ShrinkageCalculatorSheet
      visible={shrinkageOpen}
      onClose={() => setShrinkageOpen(false)}
      clayBodyName={clayBodies.find((clay) => clay.id === defaultClayBodyId)?.name}
    />
    </>
  );
}
