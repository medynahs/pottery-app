import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import type { Kiln, KilnMaintenanceLog } from '@/src/types/kiln';
import { formatFiringLogDate } from '../utils/kilnHelpers';
import { Plus, Trash2, Wrench } from 'lucide-react-native';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface KilnMaintenanceSectionProps {
  kiln: Kiln;
  onAddLog: (payload: { date: string; note: string }) => void;
  onRemoveLog: (logId: string) => void;
}

function todayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function MaintenanceRow({
  log,
  onRemove,
}: {
  log: KilnMaintenanceLog;
  onRemove: () => void;
}) {
  return (
    <View className="flex-row items-start gap-3 py-3 border-b border-border last:border-b-0">
      <View className="flex-1">
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
          {formatFiringLogDate(log.date)}
        </Text>
        <Text className="text-sm text-foreground leading-5">{log.note}</Text>
      </View>
      <TouchableOpacity onPress={onRemove} hitSlop={8} accessibilityLabel="Delete maintenance entry">
        <Trash2 size={14} color="hsl(24 12% 55%)" />
      </TouchableOpacity>
    </View>
  );
}

export function KilnMaintenanceSection({ kiln, onAddLog, onRemoveLog }: KilnMaintenanceSectionProps) {
  const [noteDraft, setNoteDraft] = React.useState('');
  const logs = kiln.maintenanceLogs ?? [];

  const handleAdd = () => {
    const note = noteDraft.trim();
    if (!note) return;
    onAddLog({ date: todayDateKey(), note });
    setNoteDraft('');
  };

  return (
    <Card className="p-4 mb-5">
      <View className="flex-row items-center gap-2 mb-1">
        <Wrench size={16} color="hsl(24 20% 40%)" />
        <Text className="text-sm font-semibold text-foreground">Maintenance Log</Text>
      </View>
      <Text className="text-[11px] text-muted-foreground leading-4 mb-4">
        Kiln wash, element checks, thermocouple swaps — the work nobody posts about.
      </Text>

      {logs.length > 0 ? (
        <View className="mb-4">
          {logs.map((log) => (
            <MaintenanceRow key={log.id} log={log} onRemove={() => onRemoveLog(log.id)} />
          ))}
        </View>
      ) : (
        <Text className="text-xs text-muted-foreground mb-4 italic">
          No entries yet. Log the unglamorous stuff when you do it.
        </Text>
      )}

      <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        Add entry
      </Text>
      <TextInput
        multiline
        numberOfLines={3}
        placeholder="e.g. Replaced top element, rewashed shelves 2–4"
        value={noteDraft}
        onChangeText={setNoteDraft}
        style={{
          borderWidth: 1,
          borderColor: 'hsl(34 20% 88%)',
          borderRadius: 12,
          padding: 12,
          fontSize: 14,
          textAlignVertical: 'top',
          minHeight: 72,
          marginBottom: 10,
        }}
        placeholderTextColor="hsl(24 12% 55%)"
      />
      <TouchableOpacity
        onPress={handleAdd}
        disabled={!noteDraft.trim()}
        className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted/30"
        style={{ opacity: noteDraft.trim() ? 1 : 0.5 }}
      >
        <Plus size={14} color="hsl(24 90% 45%)" />
        <Text className="text-sm font-semibold text-primary">Log maintenance</Text>
      </TouchableOpacity>
    </Card>
  );
}

export function KilnEmergencyNotesCard({ notes }: { notes: string }) {
  if (!notes.trim()) return null;

  return (
    <Card
      className="p-4 mb-5 border"
      style={{ borderColor: 'hsl(0 55% 88%)', backgroundColor: 'hsl(0 60% 98%)' }}
    >
      <Text className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(0 55% 42%)' }}>
        Emergency & Safety Notes
      </Text>
      <Text className="text-sm leading-5" style={{ color: 'hsl(0 45% 28%)' }}>
        {notes.trim()}
      </Text>
    </Card>
  );
}
