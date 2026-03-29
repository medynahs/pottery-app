import { EntryDraft } from '@/src/types/journal';
import { TimelineEntry } from '@/src/types/pieces';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Clock3, ScrollText } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { STAGE_ICON_MAP } from '../utils/constants';
import { ArtifactTile } from './ArtifactTile';
import { NotesCard } from './NotesCard';
import { PaperLabel } from './PaperLabel';
import { PhotoSquare } from './PhotoSquare';

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
                <Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted-foreground mt-1">
                    {`Page ${index + 2} / ${totalEntries + 1}`}
                </Text>
            </View>

            <View style={{ flexDirection: compact ? 'column' : 'row', gap: 14 }}>
                <View style={{ flex: 1, gap: 12 }}>
                    <View
                        style={{
                            borderRadius: 26,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: '#D7B48D',
                            backgroundColor: 'rgba(255, 250, 243, 0.96)',
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
                                    <Text className="text-xs text-muted-foreground mt-1">{dateLabel}</Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    alignSelf: compact ? 'flex-start' : 'auto',
                                    paddingHorizontal: 11,
                                    paddingVertical: 6,
                                    borderRadius: 999,
                                    backgroundColor: isLast ? `${accent}20` : 'rgba(124, 96, 69, 0.11)',
                                }}
                            >
                                <Text className="text-[10px] font-bold uppercase tracking-[1.3px]" style={{ color: isLast ? accent : '#7F6450' }}>
                                    {isLast ? `${durationLabel} ongoing` : durationLabel}
                                </Text>
                            </View>
                        </View>

                        <PhotoSquare
                            photo={draft.photo}
                            onPress={onPickPhoto}
                            accent={accent}
                            placeholder="Tap to place a stage photo or future illustrated stamp."
                        />
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        <ArtifactTile label="Stage Number" value={`${index + 1}`} accent={accent} compact={compact} />
                        <ArtifactTile label="Stage Date" value={dateLabel} accent={accent} compact={compact} />
                        <ArtifactTile label="Time Here" value={durationLabel} accent={accent} compact={compact} />
                        <ArtifactTile label="Status" value={isLast ? 'Current stage' : 'Archived stage'} accent={accent} compact={compact} />
                    </View>
                </View>

                <View style={{ flex: 1, gap: 12 }}>
                    <View
                        style={{
                            borderRadius: 28,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#DCC19D',
                            backgroundColor: 'rgba(255, 252, 245, 0.95)',
                            minHeight: 330,
                        }}
                    >
                        <LinearGradient
                            colors={['rgba(215, 180, 141, 0.26)', 'rgba(255,255,255,0.12)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ padding: 16, paddingBottom: 8 }}
                        >
                            <View className="flex-row items-center gap-2 mb-4">
                                <ScrollText size={15} color={accent} />
                                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">Field Notes</Text>
                            </View>
                            <NotesCard
                                value={draft.notes}
                                onChangeText={onChangeNotes}
                                placeholder="Record trimming decisions, drying surprises, glaze tests, or what you want your future illustrated journal spread to show."
                                compact={compact}
                            />
                        </LinearGradient>
                    </View>

                    <View
                        style={{
                            borderRadius: 22,
                            padding: 14,
                            borderWidth: 1,
                            borderColor: '#DCC19D',
                            backgroundColor: 'rgba(255, 249, 239, 0.88)',
                        }}
                    >
                        <View className="flex-row items-center gap-2 mb-2">
                            <Clock3 size={14} color="#8A6A53" />
                            <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                                Asset Ready Space
                            </Text>
                        </View>
                        <Text className="text-sm text-foreground leading-6">
                            Save this right page for stickers, sketches, glaze swatches, or custom illustrated cards later. The layout is already structured for it.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}