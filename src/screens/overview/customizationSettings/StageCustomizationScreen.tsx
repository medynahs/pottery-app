import { ConfirmSheet } from '@/src/components/AppSheets';
import { CustomizationSettingsShell } from '@/src/components/settings/CustomizationSettingsShell';
import { Text } from '@/src/components/ui/text';
import { CEMETERY_ID, type StageConfig, useStageConfig } from '@/src/hooks/useStageConfig';
import { PICKABLE_ICONS, resolveStageIcon } from '@/src/screens/pieces/utils/stageIconUtils';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const STAGE_COLORS: Record<string, { icon: string; bg: string }> = {
  idea:           { icon: 'hsl(213 80% 55%)', bg: 'bg-blue-50' },
  forming:        { icon: 'hsl(24 40% 45%)',  bg: 'bg-stone-100' },
  'leather-hard': { icon: 'hsl(38 70% 45%)',  bg: 'bg-amber-50' },
  trimming:       { icon: 'hsl(213 30% 55%)', bg: 'bg-slate-100' },
  drying:         { icon: 'hsl(195 70% 50%)', bg: 'bg-sky-50' },
  'bone-dry':     { icon: 'hsl(220 10% 60%)', bg: 'bg-gray-100' },
  bisque:         { icon: 'hsl(39 57% 51%)',  bg: 'bg-primary/10' },
  glazing:        { icon: 'hsl(270 60% 55%)', bg: 'bg-purple-50' },
  'glaze-fired':  { icon: 'hsl(0 70% 55%)',   bg: 'bg-red-50' },
  finished:       { icon: 'hsl(142 60% 40%)', bg: 'bg-green-50' },
  cemetery:       { icon: 'hsl(0 0% 50%)',    bg: 'bg-gray-100' },
};

// ─── Stage Row ───────────────────────────────────────────────────────────────

function StageRow({
  stage,
  isFirst,
  isLast,
  isCemetery,
  isOnlyEnabled,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRename,
  onRemove,
  onChangeIcon,
}: {
  stage: StageConfig;
  isFirst: boolean;
  isLast: boolean;
  isCemetery: boolean;
  isOnlyEnabled: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRename: (label: string) => void;
  onRemove: () => void;
  onChangeIcon: (iconKey: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stage.label);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const Icon = resolveStageIcon(stage);
  const colors = STAGE_COLORS[stage.id] ?? { icon: 'hsl(39 57% 51%)', bg: 'bg-primary/10' };
  const dim = !stage.enabled;

  function commitRename() {
    const trimmed = draft.trim();
    onRename(trimmed || stage.defaultLabel);
    setDraft(trimmed || stage.defaultLabel);
    setEditing(false);
  }

  return (
    <View className={dim ? 'opacity-40' : ''}>
      <ConfirmSheet
        visible={confirmOpen}
        title="Remove Stage?"
        body={`Remove "${stage.label}"?`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => { onRemove(); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />
      <View className="flex-row items-center gap-3 px-4 py-3">
        {/* Reorder buttons */}
        <View className="gap-0.5">
          <TouchableOpacity
            onPress={onMoveUp}
            disabled={isFirst || isCemetery}
            className={`w-7 h-7 items-center justify-center rounded-lg ${isFirst || isCemetery ? 'opacity-20' : 'active:bg-muted'}`}
          >
            <ChevronUp size={16} color="hsl(24 20% 50%)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMoveDown}
            disabled={isLast || isCemetery}
            className={`w-7 h-7 items-center justify-center rounded-lg ${isLast || isCemetery ? 'opacity-20' : 'active:bg-muted'}`}
          >
            <ChevronDown size={16} color="hsl(24 20% 50%)" />
          </TouchableOpacity>
        </View>

        {/* Stage icon — tappable for custom stages */}
        {stage.isCustom ? (
          <TouchableOpacity
            onPress={() => setPickerOpen(v => !v)}
            activeOpacity={0.75}
            className={`w-9 h-9 rounded-xl items-center justify-center ${colors.bg}`}
            style={pickerOpen
              ? { borderWidth: 2, borderColor: 'hsl(39 57% 51%)' }
              : { borderWidth: 2, borderColor: 'transparent' }}
          >
            <Icon size={17} color={colors.icon} />
          </TouchableOpacity>
        ) : (
          <View className={`w-9 h-9 rounded-xl items-center justify-center ${colors.bg}`}>
            <Icon size={17} color={colors.icon} />
          </View>
        )}

        {/* Label / edit field */}
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
              <Text className="text-sm font-medium text-foreground">{stage.label}</Text>
              {stage.label !== stage.defaultLabel && (
                <Text className="text-xs text-muted-foreground">({stage.defaultLabel})</Text>
              )}
            </View>
          )}
        </View>

        {/* Pencil (rename) + Trash (remove) — hidden for cemetery */}
        {!isCemetery && (
          <>
            <TouchableOpacity
              onPress={() => {
                if (editing) {
                  commitRename();
                } else {
                  setDraft(stage.label);
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
          </>
        )}

        {/* Toggle or lock */}
        {isCemetery ? (
          <View className="w-8 h-8 items-center justify-center">
            <Lock size={14} color="hsl(24 20% 60%)" />
          </View>
        ) : (
          <Switch
            value={stage.enabled}
            onValueChange={() => {
              if (stage.enabled && isOnlyEnabled) return;
              onToggle();
            }}
            trackColor={{ false: 'hsl(34 25% 82%)', true: 'hsl(39 57% 51%)' }}
            thumbColor="white"
          />
        )}
      </View>

      {/* Inline icon picker — only for custom stages */}
      {stage.isCustom && pickerOpen && (
        <View className="px-4 pb-3">
          <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Choose Icon
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PICKABLE_ICONS.map(({ key, Icon: PIcon }) => {
              const selected = stage.iconKey === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => { onChangeIcon(key); setPickerOpen(false); }}
                  activeOpacity={0.7}
                  className={`w-10 h-10 rounded-xl items-center justify-center ${selected ? 'bg-primary/15' : 'bg-muted/60'}`}
                  style={selected ? { borderWidth: 1.5, borderColor: 'hsl(39 57% 51%)' } : undefined}
                >
                  <PIcon size={18} color={selected ? 'hsl(39 57% 51%)' : 'hsl(24 20% 55%)'} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Add Stage Row ────────────────────────────────────────────────────────────

function AddStageRow({ onAdd }: { onAdd: (label: string) => void }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');

  function commit() {
    const trimmed = value.trim();
    if (trimmed) onAdd(trimmed);
    setValue('');
    setActive(false);
  }

  if (!active) {
    return (
      <TouchableOpacity
        onPress={() => setActive(true)}
        activeOpacity={0.7}
        className="flex-row items-center gap-3 mt-3 px-4 py-3.5 bg-card rounded-2xl border border-dashed border-border"
      >
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-primary/10">
          <Plus size={17} color="hsl(39 57% 51%)" />
        </View>
        <Text className="text-sm font-medium text-primary">Add Custom Stage</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-center gap-3 mt-3 px-4 py-3 bg-card rounded-2xl border border-primary">
      <View className="w-9 h-9 rounded-xl items-center justify-center bg-primary/10">
        <Plus size={17} color="hsl(39 57% 51%)" />
      </View>
      <TextInput
        value={value}
        onChangeText={setValue}
        onBlur={() => { if (!value.trim()) setActive(false); }}
        onSubmitEditing={commit}
        autoFocus
        placeholder="Stage name…"
        returnKeyType="done"
        placeholderTextColor="hsl(24 20% 60%)"
        className="flex-1 text-sm font-medium text-foreground py-0.5"
        style={{ fontFamily: 'DMSans_500Medium' }}
      />
      <TouchableOpacity
        onPress={commit}
        disabled={!value.trim()}
        className={`px-3 py-1.5 rounded-lg bg-primary ${!value.trim() ? 'opacity-40' : ''}`}
      >
        <Text className="text-xs font-semibold text-white">Add</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StageCustomizationScreen() {
  const router = useRouter();
  const markSetupProgress = useAppStore((s) => s.markSetupProgress);
  const { stages, enabledStages, toggleStage, renameStage, addStage, removeStage, changeStageIcon, moveUp, moveDown, resetToDefaults } =
    useStageConfig();

  function markStagesReviewed() {
    markSetupProgress('stagesReviewed');
  }

  const movableStages = stages.filter(s => s.id !== CEMETERY_ID);
  const cemetery = stages.find(s => s.id === CEMETERY_ID);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  function handleReset() {
    setResetConfirmOpen(true);
  }

  function handleSave() {
    markStagesReviewed();
    router.back();
  }

  return (
    <CustomizationSettingsShell
      eyebrow="Piece workflow"
      title="Customize your stages"
      subtitle="Choose which stages appear when tracking a piece, reorder them to match your workflow, rename or remove any stage, and add your own custom ones."
      headerNote={`${enabledStages.length} of ${stages.length} stages active`}
      onBack={() => router.back()}
      onSave={handleSave}
    >
      <ConfirmSheet
        visible={resetConfirmOpen}
        title="Restore Defaults?"
        body="This will reset all stage names and re-enable all stages."
        confirmLabel="Restore"
        destructive
        onConfirm={() => { resetToDefaults(); setResetConfirmOpen(false); }}
        onCancel={() => setResetConfirmOpen(false)}
      />

      <View className="mt-1 bg-card rounded-2xl border border-border overflow-hidden">
          {movableStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <StageRow
                stage={stage}
                isFirst={idx === 0}
                isLast={idx === movableStages.length - 1}
                isCemetery={false}
                isOnlyEnabled={enabledStages.filter(s => s.id !== CEMETERY_ID).length === 1}
                onToggle={() => toggleStage(stage.id)}
                onMoveUp={() => moveUp(stage.id)}
                onMoveDown={() => moveDown(stage.id)}
                onRename={(label) => renameStage(stage.id, label)}
                onRemove={() => removeStage(stage.id)}
                onChangeIcon={(iconKey) => changeStageIcon(stage.id, iconKey)}
              />
              {idx < movableStages.length - 1 && (
                <View className="h-px bg-border ml-16" />
              )}
            </React.Fragment>
          ))}

          {/* Cemetery — always last, locked */}
          {cemetery && (
            <>
              <View className="h-px bg-border" />
              <View className="px-4 py-1">
                <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Always Last
                </Text>
              </View>
              <View className="h-px bg-border ml-4 mr-4" />
              <StageRow
                stage={cemetery}
                isFirst={false}
                isLast={true}
                isCemetery={true}
                isOnlyEnabled={false}
                onToggle={() => {}}
                onMoveUp={() => {}}
                onMoveDown={() => {}}
                onRename={() => {}}
                onRemove={() => {}}
                onChangeIcon={() => {}}
              />
            </>
          )}
        </View>

        {/* Add custom stage */}
        <AddStageRow onAdd={(label) => addStage(label)} />

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
