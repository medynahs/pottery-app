import { EntryDraft } from '@/src/types/journal';
import { TimelineEntry, type Piece } from '@/src/types/pieces';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { getEntryCaptureTiles } from '../utils/entryCaptureMeta';
import { BOOK_ART } from '../utils/constants';
import { JournalTheme } from '../utils/journalTheme';
import { JournalNotePreview, JournalNotesSheet } from './JournalNotesSheet';
import { JournalSpreadMasthead } from './JournalSpreadMasthead';
import { LedgerRowLine, LedgerSection } from './LedgerBlocks';
import { PolaroidPhotoPicker } from './PolaroidPhotoPicker';

export function EntrySpread({
    entry,
    draft,
    piece,
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
    canAddMorePhotos = true,
}: {
    entry: TimelineEntry;
    draft: EntryDraft;
    piece: Piece;
    index: number;
    stageLabel: string;
    isLast: boolean;
    accent: string;
    durationLabel: string;
    dateLabel: string;
    totalEntries: number;
    onPickPhoto: (photoIndex: number) => void;
    onChangeNotes: (value: string) => void;
    compact: boolean;
    canAddMorePhotos?: boolean;
}) {
    const captureTiles = getEntryCaptureTiles(entry, piece);
    const [notesOpen, setNotesOpen] = React.useState(false);

    return (
        <>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: compact ? 10 : 14, paddingBottom: compact ? 72 : 22 }}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
            >
                <Image
                    source={BOOK_ART.pageWatermark}
                    style={{
                        position: 'absolute',
                        right: compact ? -20 : -10,
                        top: 120,
                        width: compact ? 140 : 180,
                        height: compact ? 140 : 180,
                        opacity: 0.045,
                    }}
                    resizeMode="contain"
                />

                <JournalSpreadMasthead
                    compact={compact}
                    leftLabel={stageLabel}
                    rightLabel={`${piece.name} · ${dateLabel}`}
                />

                <View style={{ flexDirection: compact ? 'column' : 'row', gap: 14, width: '100%', marginTop: 14 }}>
                    <View style={{ flex: compact ? undefined : 1, gap: 12, width: compact ? '100%' : undefined }}>
                        <LedgerSection title="Stage record" subtitle={`Entry ${index + 1} of ${totalEntries}`} compact={compact}>
                            <LedgerRowLine label="Stage date" value={dateLabel} compact={compact} />
                            <LedgerRowLine label="Time in stage" value={durationLabel} compact={compact} />
                            {captureTiles.map((tile) => (
                                <LedgerRowLine key={tile.label} label={tile.label} value={tile.value} compact={compact} />
                            ))}
                        </LedgerSection>

                        <View style={{ alignItems: compact ? 'center' : 'flex-start', marginTop: 4 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: compact ? 'center' : 'flex-start' }}>
                                <PolaroidPhotoPicker
                                    photo={draft.photos?.[0]}
                                    onPress={() => onPickPhoto(0)}
                                    accent={accent}
                                    width={200}
                                    height={compact ? 180 : 240}
                                    borderRadius={12}
                                    rotation="5deg"
                                    placeholder={!canAddMorePhotos && !draft.photos?.[0] ? 'Upgrade to add photos' : undefined}
                                    style={{ alignSelf: 'flex-end', marginRight: compact ? -4 : -32 }}
                                />
                                <PolaroidPhotoPicker
                                    photo={draft.photos?.[1]}
                                    onPress={() => onPickPhoto(1)}
                                    accent={accent}
                                    width={100}
                                    height={100}
                                    borderRadius={12}
                                    rotation="-10deg"
                                    placeholder={!canAddMorePhotos && !draft.photos?.[1] ? 'Premium' : undefined}
                                    style={{ alignSelf: 'flex-end', marginRight: compact ? -4 : -32 }}
                                />
                            </View>
                            <Text
                                style={{
                                    fontSize: 9,
                                    letterSpacing: 1.4,
                                    textTransform: 'uppercase',
                                    color: JournalTheme.coverSpecLabel,
                                    marginTop: 10,
                                    textAlign: compact ? 'center' : 'left',
                                }}
                            >
                                Stage photographs
                            </Text>
                        </View>
                    </View>

                    <View style={{ flex: compact ? undefined : 1, gap: 12, width: '100%' }}>
                        <JournalNotePreview
                            title="Field Notes"
                            value={draft.notes}
                            placeholder="Record trimming decisions, drying surprises, glaze tests, or what you want your future illustrated journal spread to show."
                            onPress={() => setNotesOpen(true)}
                            compact={compact}
                        />
                    </View>
                </View>
            </ScrollView>

            <JournalNotesSheet
                visible={notesOpen}
                title="Field Notes"
                value={draft.notes}
                placeholder="Record trimming decisions, drying surprises, glaze tests, or what you want your future illustrated journal spread to show."
                onChangeText={onChangeNotes}
                onClose={() => setNotesOpen(false)}
            />
        </>
    );
}
