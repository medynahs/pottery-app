import { KeyboardFormScrollView } from '@/src/components/ui/keyboard-form-scroll-view';
import { useKeyboardBottomOffset } from '@/src/hooks/useKeyboardBottomOffset';
import { EntryDraft } from '@/src/types/journal';
import { TimelineEntry, type Piece } from '@/src/types/pieces';
import React from 'react';
import { Image, View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { getEntryCaptureTiles } from '../utils/entryCaptureMeta';
import { BOOK_ART } from '../utils/constants';
import { JournalTheme } from '../utils/journalTheme';
import { JournalInlineNotes } from './JournalInlineNotes';
import { JournalSpreadMasthead } from './JournalSpreadMasthead';
import { StageFactsLedger } from './LedgerBlocks';
import { PolaroidPhotoPicker } from './PolaroidPhotoPicker';

export function EntrySpread({
    entry,
    draft,
    piece,
    index,
    stageLabel,
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
    accent: string;
    durationLabel: string;
    dateLabel: string;
    totalEntries: number;
    onPickPhoto: (photoIndex: number) => void;
    onChangeNotes: (value: string) => void;
    compact: boolean;
    canAddMorePhotos?: boolean;
}) {
    const keyboardBottomOffset = useKeyboardBottomOffset({ extra: 24 });
    const captureTiles = getEntryCaptureTiles(entry, piece);
    const hasPhotos = Boolean(draft.photos?.[0] || draft.photos?.[1]);
    const hasNotes = draft.notes.trim().length > 0;

    const stageFacts = [
        { label: 'Recorded', value: dateLabel },
        { label: 'In stage', value: durationLabel },
        ...captureTiles.map((tile) => ({ label: tile.label, value: tile.value })),
    ];

    const emptyPrompt = !hasPhotos && !hasNotes
        ? `What happened at ${stageLabel.toLowerCase()}?`
        : undefined;

    return (
        <KeyboardFormScrollView
            bottomOffset={keyboardBottomOffset}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: compact ? 10 : 14, paddingBottom: compact ? 48 : 40 }}
            keyboardShouldPersistTaps="handled"
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
                rightLabel={`Entry ${index + 1} of ${totalEntries} · ${dateLabel}`}
            />

            {!canAddMorePhotos ? (
                <View
                    style={{
                        marginTop: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: JournalTheme.tileBorder,
                        backgroundColor: 'rgba(215, 180, 141, 0.14)',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 10,
                            lineHeight: 14,
                            color: JournalTheme.coverSpecLabel,
                            textAlign: 'center',
                        }}
                    >
                        Upgrade to Premium to add stage photographs beyond your cover image.
                    </Text>
                </View>
            ) : null}

            <View style={{ alignItems: compact ? 'center' : 'flex-start', marginTop: 14, marginBottom: 16 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 10,
                        justifyContent: compact ? 'center' : 'flex-start',
                    }}
                >
                    <PolaroidPhotoPicker
                        photo={draft.photos?.[0]}
                        onPress={canAddMorePhotos || draft.photos?.[0] ? () => onPickPhoto(0) : undefined}
                        accent={accent}
                        width={200}
                        height={compact ? 180 : 240}
                        borderRadius={12}
                        rotation="5deg"
                        style={{ alignSelf: 'flex-end', marginRight: compact ? -4 : -32 }}
                    />
                    <PolaroidPhotoPicker
                        photo={draft.photos?.[1]}
                        onPress={canAddMorePhotos || draft.photos?.[1] ? () => onPickPhoto(1) : undefined}
                        accent={accent}
                        width={100}
                        height={100}
                        borderRadius={12}
                        rotation="-10deg"
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

            <JournalInlineNotes
                title="Field notes"
                value={draft.notes}
                placeholder="Record trimming decisions, drying surprises, glaze tests, or what you want your future self to remember."
                onChangeText={onChangeNotes}
                compact={compact}
                emptyPrompt={emptyPrompt}
            />

            <View style={{ marginTop: 16 }}>
                <StageFactsLedger
                    facts={stageFacts}
                    compact={compact}
                    accent={accent}
                    subtitle={`Entry ${index + 1} of ${totalEntries}`}
                />
            </View>
        </KeyboardFormScrollView>
    );
}
