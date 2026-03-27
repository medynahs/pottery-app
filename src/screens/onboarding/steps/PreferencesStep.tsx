import { Input } from '@/src/components/ui/input.ios';
import { Text } from '@/src/components/ui/text';
import { AppModule, MeasurementUnit } from '@/src/store/appStore';
import { formatLabel } from '@/src/utils/helpers';
import React from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Pill } from '../../../components/Pill';

interface PreferencesStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
    toggleModule: (moduleId: AppModule) => void;
}

const UNIT_OPTIONS: MeasurementUnit[] = ['metric', 'imperial'];
const MODULE_OPTIONS: Array<{ id: AppModule; label: string; description: string }> = [
  { id: 'overview', label: 'Overview', description: 'Daily studio pulse and quick insights.' },
  { id: 'pieces', label: 'Pieces', description: 'Track pieces from forming to finished.' },
  { id: 'kiln', label: 'Kiln', description: 'Firing queues, logs, and kiln context.' },
  { id: 'library', label: 'Library', description: 'Learning, templates, glaze references, and reflections.' },
  { id: 'community', label: 'Community', description: 'Share progress and learn from others.' },
];


export const PreferencesStep: React.FC<PreferencesStepProps> = ({
    draft,
    updateDraft,
    toggleModule,
}) => (
    <View className="mt-3">
        <Text className="text-sm text-muted-foreground leading-6">
            Choose lightweight defaults so the app fits your workflow from day one.
        </Text>

        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Units</Text>
        <View className="flex-row gap-2">
            {UNIT_OPTIONS.map((option) => (
                <Pill key={option} label={formatLabel(option)} active={draft.preferredUnits === option} onPress={() => updateDraft({ preferredUnits: option })} />
            ))}
        </View>

        <View className="mt-4">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Language</Text>
            <Input value={draft.language} onChangeText={(value) => updateDraft({ language: value })} placeholder="English" />
        </View>

        <View className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 flex-row items-center justify-between">
            <View className="flex-1 pr-3">
                <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Gentle notifications</Text>
                <Text className="text-xs text-muted-foreground mt-1">Routine reminders and kiln status nudges.</Text>
            </View>
            <Switch
                value={draft.notificationsEnabled}
                onValueChange={(value) => updateDraft({ notificationsEnabled: value })}
                trackColor={{ false: '#D1D5DB', true: '#7A5A3A' }}
                thumbColor={draft.notificationsEnabled ? '#F5EFE6' : '#F8F4EF'}
            />
        </View>

        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Active modules</Text>
        <View className="gap-2">
            {MODULE_OPTIONS.map((module) => {
                const active = draft.activeModules.includes(module.id);
                const isRequired = module.id === 'overview';
                return (
                    <Pressable
                        key={module.id}
                        onPress={() => {
                            if (isRequired) return;
                            toggleModule(module.id);
                        }}
                        className={`rounded-2xl border px-4 py-3 ${active ? 'border-foreground bg-card' : 'border-border bg-card/70'}`}
                    >
                        <View className="flex-row items-center justify-between gap-3">
                            <View className="flex-1 pr-3">
                                <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{module.label}</Text>
                                <Text className="text-xs text-muted-foreground mt-1">{module.description}</Text>
                            </View>
                            <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                                {isRequired ? 'Required' : active ? 'On' : 'Off'}
                            </Text>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    </View>
);