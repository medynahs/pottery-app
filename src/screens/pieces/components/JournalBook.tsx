import React from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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
  onUpdatePiece?: (piece: Piece) => void;
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
    onUpdatePiece,
    onPageChange,
    canAddMorePhotos,
  },
  ref,
) {
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);

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
            ref={ref}
            viewportWidth={viewportWidth}
            keyboardOpen={keyboardOpen}
            initialPage={initialPage}
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
            onUpdatePiece={onUpdatePiece}
            onPageChange={onPageChange}
            canAddMorePhotos={canAddMorePhotos}
          />
        ) : null}
      </View>
    </JournalEditProvider>
  );
});

const JournalBookPager = React.forwardRef<
  JournalBookHandle,
  {
    viewportWidth: number;
    keyboardOpen: boolean;
    initialPage: number;
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
    onUpdatePiece?: (piece: Piece) => void;
    onPageChange: (index: number) => void;
    canAddMorePhotos: boolean;
  }
>(function JournalBookPager(
  {
    viewportWidth,
    keyboardOpen,
    initialPage,
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
    onUpdatePiece,
    onPageChange,
    canAddMorePhotos,
  },
  ref,
) {
  const editScope = React.useContext(JournalEditScope);
  const currentPageRef = React.useRef(initialPage);
  const translateX = useSharedValue(0);
  const panStartX = useSharedValue(0);

  const clampPage = React.useCallback(
    (page: number) => Math.max(0, Math.min(page, spreads.length - 1)),
    [spreads.length],
  );

  const snapToPage = React.useCallback(
    (page: number, animated = true) => {
      const clamped = clampPage(page);
      currentPageRef.current = clamped;
      translateX.value = animated
        ? withTiming(-clamped * viewportWidth, { duration: 260 })
        : -clamped * viewportWidth;
    },
    [clampPage, translateX, viewportWidth],
  );

  const commitPage = React.useCallback(
    (page: number) => {
      const clamped = clampPage(page);
      currentPageRef.current = clamped;
      onPageChange(clamped);
    },
    [clampPage, onPageChange],
  );

  const dismissEditing = React.useCallback(() => {
    editScope?.requestDismiss();
    Keyboard.dismiss();
  }, [editScope]);

  React.useImperativeHandle(
    ref,
    () => ({
      scrollToPage: (index: number, animated = true) => {
        if (viewportWidth <= 0) return;
        snapToPage(index, animated);
      },
    }),
    [snapToPage, viewportWidth],
  );

  React.useEffect(() => {
    currentPageRef.current = initialPage;
  }, [initialPage, piece.id]);

  React.useEffect(() => {
    if (viewportWidth <= 0) return;
    snapToPage(currentPageRef.current, false);
  }, [viewportWidth, piece.id, spreads.length, snapToPage]);

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(!keyboardOpen)
        .activeOffsetX([-18, 18])
        .failOffsetY([-12, 12])
        .onBegin(() => {
          panStartX.value = translateX.value;
          runOnJS(dismissEditing)();
        })
        .onUpdate((event) => {
          const minX = -(spreads.length - 1) * viewportWidth;
          const nextX = panStartX.value + event.translationX;
          translateX.value = Math.max(minX, Math.min(0, nextX));
        })
        .onEnd((event) => {
          const projected = translateX.value + event.velocityX * 0.25;
          const nextPage = Math.round(-projected / viewportWidth);
          const clamped = Math.max(0, Math.min(nextPage, spreads.length - 1));
          translateX.value = withTiming(-clamped * viewportWidth, { duration: 240 });
          runOnJS(commitPage)(clamped);
        }),
    [
      commitPage,
      dismissEditing,
      keyboardOpen,
      panStartX,
      spreads.length,
      translateX,
      viewportWidth,
    ],
  );

  const pagerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              width: viewportWidth * spreads.length,
              flex: 1,
            },
            pagerStyle,
          ]}
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
                  onUpdatePiece={onUpdatePiece}
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
        </Animated.View>
      </View>
    </GestureDetector>
  );
});
