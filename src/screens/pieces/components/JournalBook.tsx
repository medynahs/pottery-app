import React from 'react';
import { ScrollView, View } from 'react-native';
import { CoverSpread } from './CoverSpread';
import { EntrySpread } from './EntrySpread';

interface JournalBookProps {
  spreads: any[];
  pageWidth: number;
  piece: any;
  totalMs: number;
  isCompact: boolean;
  currencySymbol: string;
  handleChangeSaleMode: (mode: any) => void;
  pickPhoto: (index: number) => void;
  handleUpdateNotes: (index: number, notes: string) => void;
  pageScrollRef: React.RefObject<any>;
  handleMomentumEnd: (event: any) => void;
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
  handleUpdateNotes,
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
              onPickPhoto={() => pickPhoto(spread.index)}
              onChangeNotes={(value) => handleUpdateNotes(spread.index, value)}
              compact={isCompact}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}
