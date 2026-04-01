import { EntryDraft } from '@/src/types/journal';
import { TimelineEntry } from '@/src/types/pieces';
import { BookOpen } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { STAGE_ICON_MAP } from '../utils/constants';
import { ArtifactTile } from './ArtifactTile';
import { NotesCard } from './NotesCard';
import { PaperLabel } from './PaperLabel';
import { PolaroidPhotoPicker } from './PolaroidPhotoPicker';

export function EntrySpread({
    entry,
    draft,
    index,
    stageLabel,
    isLast,
    accent,
    durationLabel,
    dateLabel,
    totalEntries,
    onPickPhoto,
    onChangeNotes,
    compact,
}: {
    entry: TimelineEntry;
    draft: EntryDraft;
    index: number;
    stageLabel: string;
    isLast: boolean;
    accent: string;
    durationLabel: string;
    dateLabel: string;
    totalEntries: number;
    onPickPhoto: () => void;
    onChangeNotes: (value: string) => void;
    compact: boolean;
}) {
    const Icon = STAGE_ICON_MAP[entry.stage] ?? BookOpen;

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: compact ? 14 : 18, paddingBottom: compact ? 80 : 28 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: compact ? 10 : 14, alignItems: 'flex-start' }}>
                <PaperLabel label={stageLabel} accent={accent} />
            </View>

            {/* Center the main content horizontally */}
            <View style={{ flexDirection: compact ? 'column' : 'row', gap: 14, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <View style={{ flex: 1, gap: 12 }}>
                    <View
                        style={{
                            // borderRadius: 26,
                            padding: 8,
                            // borderWidth: 1,
                            // borderColor: '#D7B48D',
                            // backgroundColor: 'rgba(255, 250, 243, 0.96)',
                        }}
                    >
                        <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: 16, gap: compact ? 10 : 0 }}>
                            <View className="flex-row items-center gap-3">
                                <View
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 999,
                                        backgroundColor: `${accent}22`,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon size={18} color={accent} />
                                </View>
                                <View>
                                    <Text className="text-lg font-serif text-foreground">{stageLabel}</Text>
                                    {/* <Text className="text-xs text-muted-foreground mt-1">{dateLabel}</Text> */}
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, width: compact ? '100%' : 'auto' }}>
                                <ArtifactTile label="Stage Date" value={dateLabel} accent={accent} compact={compact} />
                                <ArtifactTile label="Time Spent Here" value={durationLabel} accent={accent} compact={compact} />
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                <PolaroidPhotoPicker
                                    photo={draft.photo}
                                    onPress={onPickPhoto}
                                    accent={accent}
                                    width={200}
                                    height={compact ? 180 : 240}
                                    borderRadius={12}
                                    rotation="5deg"
                                    style={{ alignSelf: 'flex-end', marginRight: compact ? -4 : -32 }}

                                />
                                <PolaroidPhotoPicker
                                    photo={draft.photo}
                                    onPress={onPickPhoto}
                                    accent={accent}
                                    width={100}
                                    height={100}
                                    borderRadius={12}
                                    rotation="-10deg"
                                    style={{ alignSelf: 'flex-end', marginRight: compact ? -4 : -32 }}

                                />
                            </View>

                        </View>
                    </View>
                </View>

                <View style={{ flex: 1, gap: 12, width: '100%' }}>
                    <NotesCard
                        value={draft.notes}
                        onChangeText={onChangeNotes}
                        placeholder="Record trimming decisions, drying surprises, glaze tests, or what you want your future illustrated journal spread to show."
                        compact={compact}
                        accent={accent}
                    />
                </View>
            </View>
        </ScrollView>
    );
}