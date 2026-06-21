import React from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView as ScrollViewType,
} from 'react-native';
import type { JournalSpread } from '../../../types/journal';
import type { Piece } from '../../../types/pieces';
import type { PricingSaleMode } from '../../../types/pricing';
import { CoverSpread } from './CoverSpread';
import { EntrySpread } from './EntrySpread';
import { JournalEditProvider, JournalEditScope } from './journalEditScope';

export type JournalBookHandle = {
  scrollToPage: (index: number, animated?: boolean) => void;
};

interface JournalBookProps {
  spreads: JournalSpread[];
  piece: Piece;
  totalMs: number;
  isCompact: boolean;
  currencySymbol: string;
  initialPage?: number;
  handleChangeSaleMode: (mode: PricingSaleMode) => void;
  pickPhoto: (entryIndex: number, photoIndex: number) => void;
  pickCoverPhoto: () => void;
  handleUpdateNotes: (index: number, notes: string) => void;
  handleUpdateDescription: (description: string) => void;
  onPageChange: (index: number) => void;
  canAddMorePhotos: boolean;
}

export const JournalBook = React.forwardRef<JournalBookHandle, JournalBookProps>(function JournalBook(
  {
    spreads,
    piece,
    totalMs,
    isCompact,
    currencySymbol,
    initialPage = 0,
    handleChangeSaleMode,
    pickPhoto,
    pickCoverPhoto,
    handleUpdateNotes,
    handleUpdateDescription,
    onPageChange,
    canAddMorePhotos,
  },
  ref,
) {
  const scrollRef = React.useRef<ScrollViewType>(null);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const currentPageRef = React.useRef(initialPage);
  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      scrollToPage: (index: number, animated = true) => {
        if (viewportWidth <= 0) return;
        const clamped = Math.max(0, Math.min(index, spreads.length - 1));
        currentPageRef.current = clamped;
        scrollRef.current?.scrollTo({ x: clamped * viewportWidth, animated });
      },
    }),
    [spreads.length, viewportWidth],
  );

  React.useEffect(() => {
    currentPageRef.current = initialPage;
  }, [initialPage, piece.id]);

  React.useEffect(() => {
    if (viewportWidth <= 0) return;
    const page = Math.max(0, Math.min(currentPageRef.current, spreads.length - 1));
    scrollRef.current?.scrollTo({ x: page * viewportWidth, animated: false });
  }, [viewportWidth, piece.id, spreads.length]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (viewportWidth <= 0) return;
    const nextPage = Math.max(
      0,
      Math.min(Math.round(event.nativeEvent.contentOffset.x / viewportWidth), spreads.length - 1),
    );
    currentPageRef.current = nextPage;
    onPageChange(nextPage);
  };

  return (
    <JournalEditProvider>
      <View
        style={{ flex: 1 }}
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth > 0 && nextWidth !== viewportWidth) {
            setViewportWidth(nextWidth);
          }
        }}
      >
        {viewportWidth > 0 ? (
          <JournalBookPager
            scrollRef={scrollRef}
            viewportWidth={viewportWidth}
            keyboardOpen={keyboardOpen}
            spreads={spreads}
            piece={piece}
            totalMs={totalMs}
            isCompact={isCompact}
            currencySymbol={currencySymbol}
            handleChangeSaleMode={handleChangeSaleMode}
            pickPhoto={pickPhoto}
            pickCoverPhoto={pickCoverPhoto}
            handleUpdateNotes={handleUpdateNotes}
            handleUpdateDescription={handleUpdateDescription}
            onMomentumEnd={handleMomentumEnd}
            canAddMorePhotos={canAddMorePhotos}
          />
        ) : null}
      </View>
    </JournalEditProvider>
  );
});

function JournalBookPager({
  scrollRef,
  viewportWidth,
  keyboardOpen,
  spreads,
  piece,
  totalMs,
  isCompact,
  currencySymbol,
  handleChangeSaleMode,
  pickPhoto,
  pickCoverPhoto,
  handleUpdateNotes,
  handleUpdateDescription,
  onMomentumEnd,
  canAddMorePhotos,
}: {
  scrollRef: React.RefObject<ScrollViewType | null>;
  viewportWidth: number;
  keyboardOpen: boolean;
  spreads: JournalSpread[];
  piece: Piece;
  totalMs: number;
  isCompact: boolean;
  currencySymbol: string;
  handleChangeSaleMode: (mode: PricingSaleMode) => void;
  pickPhoto: (entryIndex: number, photoIndex: number) => void;
  pickCoverPhoto: () => void;
  handleUpdateNotes: (index: number, notes: string) => void;
  handleUpdateDescription: (description: string) => void;
  onMomentumEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  canAddMorePhotos: boolean;
}) {
  const editScope = React.useContext(JournalEditScope);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      scrollEnabled={!keyboardOpen}
      directionalLockEnabled
      showsHorizontalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScrollBeginDrag={() => {
        editScope?.requestDismiss();
        Keyboard.dismiss();
      }}
      onMomentumScrollEnd={onMomentumEnd}
      keyboardDismissMode="on-drag"
      style={{ flex: 1 }}
    >
      {spreads.map((spread) => (
        <View
          key={spread.key}
          style={{ width: viewportWidth, flexGrow: 1, flexShrink: 0, alignSelf: 'stretch' }}
        >
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
              piece={piece}
              index={spread.index}
              stageLabel={spread.stageLabel}
              accent={spread.accent}
              durationLabel={spread.durationLabel}
              dateLabel={spread.dateLabel}
              totalEntries={piece.timeline.length}
              onPickPhoto={(photoIndex) => pickPhoto(spread.index, photoIndex)}
              onChangeNotes={(value) => handleUpdateNotes(spread.index, value)}
              compact={isCompact}
              canAddMorePhotos={canAddMorePhotos}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}
