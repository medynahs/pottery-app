import { ConfirmSheet } from '@/src/components/AppSheets';
import { CustomizationSettingsShell } from '@/src/components/settings/CustomizationSettingsShell';
import { Text } from '@/src/components/ui/text';
import { DEFAULT_PIECE_FORM_OPTIONS, type PieceFormOption, useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Form Option Row ──────────────────────────────────────────────────────────

function FormOptionRow({
  option,
  isLast,
  onRename,
  onRemove,
}: {
  option: PieceFormOption;
  isLast: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(option.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed) {
      onRename(trimmed);
      setDraft(trimmed);
    } else {
      setDraft(option.name);
    }
    setEditing(false);
  }

  return (
    <View className={!isLast ? 'border-b border-border' : ''}>
      <ConfirmSheet
        visible={confirmOpen}
        title="Remove Form?"
        body={`Remove "${option.name}"?`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => { onRemove(); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />
      <View className="flex-row items-center gap-3 px-4 py-3.5">
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-stone-100">
          <Text className="text-base">🫙</Text>
        </View>

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
            <Text className="text-sm font-medium text-foreground">{option.name}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            if (editing) {
              commitRename();
            } else {
              setDraft(option.name);
              setEditing(true);
            }
          }}
          className="w-7 h-7 items-center justify-center rounded-lg active:bg-muted"
        >
          <Pencil size={13} color={editing ? 'hsl(213 80% 55%)' : 'hsl(24 20% 60%)'} />
        </TouchableOpacity>

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

function AddFormOptionRow({ onAdd }: { onAdd: (name: string) => void }) {
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
        <Text className="text-sm font-medium text-muted-foreground">Add Form</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="mt-3 bg-card rounded-2xl border border-border px-4 py-3 flex-row items-center gap-3">
      <View className="w-9 h-9 rounded-xl items-center justify-center bg-stone-100">
        <Text className="text-base">🫙</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={commit}
        onBlur={() => { if (!value.trim()) setOpen(false); }}
        autoFocus
        placeholder="e.g. Teapot, Sculpture"
        returnKeyType="done"
        className="flex-1 text-sm text-foreground"
        style={{ fontFamily: 'DMSans_400Regular' }}
        placeholderTextColor="hsl(24 20% 65%)"
      />
      <TouchableOpacity onPress={commit} className="px-3 py-1.5 rounded-xl bg-foreground">
        <Text className="text-xs font-semibold text-background">Add</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PieceFormsScreen() {
  const router = useRouter();
  const pieceFormOptions = useAppStore((s) => s.pieceFormOptions);
  const addPieceFormOption = useAppStore((s) => s.addPieceFormOption);
  const removePieceFormOption = useAppStore((s) => s.removePieceFormOption);
  const renamePieceFormOption = useAppStore((s) => s.renamePieceFormOption);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  function handleReset() {
    setResetConfirmOpen(true);
  }

  return (
    <CustomizationSettingsShell
      eyebrow="Piece details"
      title="Piece forms"
      subtitle="Manage the form types available when adding a piece. Add your own or remove ones you don't use."
      headerNote={`${pieceFormOptions.length} forms`}
      onBack={() => router.back()}
      onSave={() => router.back()}
    >
      <ConfirmSheet
        visible={resetConfirmOpen}
        title="Restore Defaults?"
        body="This will replace your forms list with the built-in defaults."
        confirmLabel="Restore"
        destructive
        onConfirm={() => { useAppStore.setState({ pieceFormOptions: DEFAULT_PIECE_FORM_OPTIONS }); setResetConfirmOpen(false); }}
        onCancel={() => setResetConfirmOpen(false)}
      />

      <View className="mt-1 bg-card rounded-2xl border border-border overflow-hidden">
          {pieceFormOptions.map((opt, idx) => (
            <FormOptionRow
              key={opt.id}
              option={opt}
              isLast={idx === pieceFormOptions.length - 1}
              onRename={(name) => renamePieceFormOption(opt.id, name)}
              onRemove={() => removePieceFormOption(opt.id)}
            />
          ))}
          {pieceFormOptions.length === 0 && (
            <View className="px-4 py-6 items-center">
              <Text className="text-sm text-muted-foreground text-center">
                No forms yet. Add one below.
              </Text>
            </View>
          )}
        </View>

        <AddFormOptionRow onAdd={addPieceFormOption} />

        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 mt-4 mb-2 py-3.5 rounded-2xl border border-border bg-card"
        >
          <RotateCcw size={15} color="hsl(0 55% 50%)" />
          <Text className="text-sm font-medium text-destructive">Restore Defaults</Text>
        </TouchableOpacity>
    </CustomizationSettingsShell>
  );
}
