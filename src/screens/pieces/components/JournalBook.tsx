import React from 'react';
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView as ScrollViewType } from 'react-native';
import type { JournalSpread } from '../../../types/journal';
import type { Piece } from '../../../types/pieces';
import type { PricingSaleMode } from '../../../types/pricing';
import { CoverSpread } from './CoverSpread';
import { EntrySpread } from './EntrySpread';

interface JournalBookProps {
  spreads: JournalSpread[];
  pageWidth: number;
  piece: Piece;
  totalMs: number;
  isCompact: boolean;
  currencySymbol: string;
  handleChangeSaleMode: (mode: PricingSaleMode) => void;
  pickPhoto: (entryIndex: number, photoIndex: number) => void;
  pickCoverPhoto: () => void;
  handleUpdateNotes: (index: number, notes: string) => void;
  handleUpdateDescription: (description: string) => void;
  pageScrollRef: React.RefObject<ScrollViewType | null>;
  handleMomentumEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function JournalBook({
  spreads,
  pageWidth,
  piece,
  totalMs,
  isCompact,
  currencySymbol,
  handleChangeSaleMode,
  pickPhoto,
  pickCoverPhoto,
  handleUpdateNotes,
  handleUpdateDescription,
  pageScrollRef,
  handleMomentumEnd,
}: JournalBookProps) {
  return (
    <ScrollView
      ref={pageScrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      bounces={false}
      scrollEventThrottle={16}
      onMomentumScrollEnd={handleMomentumEnd}
      keyboardDismissMode="interactive"
    >
      {spreads.map((spread) => (
        <View key={spread.key} style={{ width: pageWidth, flex: 1 }}>
          {spread.kind === 'cover' ? (
            <CoverSpread
              piece={piece}
              totalMs={totalMs}
              accent={spread.accent}
              compact={isCompact}
              currencySymbol={currencySymbol}
              onChangeSaleMode={handleChangeSaleMode}
              onPickPhoto={pickCoverPhoto}
              onUpdateDescription={handleUpdateDescription}
            />
          ) : (
            <EntrySpread
              entry={spread.entry}
              draft={spread.draft}
              index={spread.index}
              stageLabel={spread.stageLabel}
              isLast={spread.isLast}
              accent={spread.accent}
              durationLabel={spread.durationLabel}
              dateLabel={spread.dateLabel}
              totalEntries={piece.timeline.length}
              onPickPhoto={(photoIndex) => pickPhoto(spread.index, photoIndex)}
              onChangeNotes={(value) => handleUpdateNotes(spread.index, value)}
              compact={isCompact}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}
