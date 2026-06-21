import { PhotoPickerOverlay } from '@/src/components/PhotoPickerOverlay';
import { useCommunityComposer } from '@/src/hooks/useCommunityComposer';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { buildPieceSharePreset } from '../utils/sharePieceToCommunity';
import { useAppStore } from '@/src/store/appStore';
import { canAddPiecePhoto, checkPremium, countPiecePhotos, PremiumFeature } from '@/src/utils/premiumGate';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView as ScrollViewType
} from 'react-native';
import type { Piece } from '../../../types/pieces';
import { parseNumericInput, type PricingSaleMode } from '../../../types/pricing';
import { BinderSpine } from '../components/BinderSpine';
import { BookTabs } from '../components/BookTabs';
import { JournalBook } from '../components/JournalBook';
import { JournalHeader } from '../components/JournalHeader';
import { JournalNavigation } from '../components/JournalNavigation';
import { useJournalDrafts } from '../hooks/useJournalDrafts';
import { useJournalSpreads } from '../hooks/useJournalSpreads';
import { PAGE_ACCENTS } from '../utils/constants';
import { formatDuration } from '../utils/journal';
import { JournalTheme } from '../utils/journalTheme';
import { resolveStageIcon } from '../utils/stageIconUtils';


interface PieceJournalModalProps {
  piece: Piece | null;
  visible: boolean;
  /** Open directly to the spread for this stage (e.g. from activity feed). Defaults to cover. */
  initialStage?: string;
  onClose: () => void;
  onUpdatePiece: (piece: Piece) => void;
  onUpdateEntry: (
    pieceId: number,
    entryIndex: number,
    patch: { notes?: string; photos?: string[] }
  ) => void;
}

function resolveInitialPage(piece: Piece, initialStage?: string): number {
  if (initialStage) {
    for (let i = piece.timeline.length - 1; i >= 0; i -= 1) {
      if (piece.timeline[i].stage === initialStage) return i + 1;
    }
  }
  return 0;
}

export function PieceJournalModal({
  piece,
  visible,
  initialStage,
  onClose,
  onUpdatePiece,
  onUpdateEntry,
}: PieceJournalModalProps) {
  const { stages } = useStageConfig();
  const currencySymbol = useAppStore((state) => state.pricingSettings.currencySymbol);
  const sessionToken = useAppStore((state) => state.sessionToken);
  const shareToCommunity = useCommunityComposer();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 700;
  const isCompact = width < 430;
  const shellPadding = isCompact ? 10 : 14;
  const pageInset = isCompact ? 20 : 28;
  const [activePage, setActivePage] = React.useState(0);
  const [measuredBookHeight, setMeasuredBookHeight] = React.useState(400);
  const pageScrollRef = React.useRef<ScrollViewType>(null);
  const notesDebounceRef = React.useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Custom hook for drafts
  const { drafts, setDrafts, updateNotes, updatePhotoAt, deletePhotoAt } = useJournalDrafts(piece, visible);
  const { openPickSheet } = usePhotoPicker({ aspect: [4, 3] });
  const { requestAccess, PaywallGate } = usePremiumGate();

  React.useEffect(() => {
    if (!visible || !piece) return;
    const startPage = resolveInitialPage(piece, initialStage);
    setActivePage(startPage);
    requestAnimationFrame(() => pageScrollRef.current?.scrollTo({ x: startPage * pageWidth, animated: false }));
    // Only reset page when the modal opens or a *different* piece is shown.
    // Using piece.id instead of piece prevents a reset on every content update
    // (e.g. after picking a photo, setJournalPiece creates a new object reference).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece?.id, visible, initialStage]);

  const totalMs = useMemo(() => piece ? Date.now() - new Date(piece.createdAt).getTime() : 0, [piece]);

  const topInset = isCompact ? 40 : 46;
  const headerBlock = isCompact ? 46 : 50;
  const tabsBlock = 32;
  const bottomInset = 10;
  const verticalChrome = topInset + headerBlock + tabsBlock + bottomInset + shellPadding * 2;

  const bookWidth = useMemo(
    () => Math.min(width - (isCompact ? 16 : isTablet ? 40 : 24), isTablet ? 900 : 940),
    [width, isCompact, isTablet],
  );
  const maxBookHeight = useMemo(
    () => Math.max(300, Math.min(height - verticalChrome, isTablet ? 820 : 680)),
    [height, verticalChrome, isTablet],
  );
  // For tablet, each page is half the book minus insets; for mobile, full width minus insets
  const pageWidth = useMemo(() => isTablet ? (bookWidth - pageInset * 2) / 2 : bookWidth - pageInset, [bookWidth, pageInset, isTablet]);

  const stageLabelById = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const stage of stages) labels[stage.id] = stage.label;
    return labels;
  }, [stages]);

  // Custom hook for spreads
  const spreads = useJournalSpreads(piece, drafts, stageLabelById, totalMs);

  // Generate icons for BookTabs: cover gets a default icon, entries get their stage icon
  const coverIcon = require('lucide-react-native').PackageCheck;
  const icons = spreads.map((spread) => {
    if (spread.kind === 'cover') return coverIcon;
    // Find the stage config for this entry's stage
    const stageConfig = stages.find((s) => s.id === spread.entry.stage);
    return stageConfig ? resolveStageIcon(stageConfig) : coverIcon;
  });

  const activeSpread = spreads[activePage] ?? spreads[0];
  const activeSubtitle = piece
    ? activeSpread?.kind === 'cover'
      ? `${piece.name} · ${piece.clay} · ${formatDuration(totalMs)} in the making`
      : activeSpread?.kind === 'entry'
        ? `${piece.name} · ${activeSpread.stageLabel} · ${activeSpread.dateLabel}`
        : `${piece.name} · ${piece.clay} · ${formatDuration(totalMs)} in the making`
    : '';

  const handleShareJournal = React.useCallback(() => {
    if (!piece || !sessionToken) return;
    shareToCommunity(buildPieceSharePreset(piece));
  }, [piece, sessionToken, shareToCommunity]);

  // Update notes using hook and call onUpdateEntry
  const handleUpdateNotes = React.useCallback((index: number, notes: string) => {
    if (!piece) return;
    updateNotes(index, notes);
    if (notesDebounceRef.current[index]) clearTimeout(notesDebounceRef.current[index]);
    notesDebounceRef.current[index] = setTimeout(() => {
      onUpdateEntry(piece.id, index, { notes });
    }, 500);
  }, [piece, updateNotes, onUpdateEntry]);

  // Update the piece-level cover photo
  const pickCoverPhoto = React.useCallback(() => {
    if (!piece) return;
    const heroImage = piece.photo ?? piece.imgUrl;
    if (!canAddPiecePhoto(piece, !!heroImage)) {
      requestAccess(PremiumFeature.UnlimitedPhotos);
      return;
    }
    openPickSheet(
      (uri) => onUpdatePiece({ ...piece, photo: uri }),
      heroImage ? () => onUpdatePiece({ ...piece, photo: undefined, imgUrl: undefined }) : undefined,
    );
  }, [piece, onUpdatePiece, openPickSheet, requestAccess]);

  // Persist description changes from the cover spread
  const handleUpdateDescription = React.useCallback((description: string) => {
    if (!piece) return;
    onUpdatePiece({ ...piece, description });
  }, [piece, onUpdatePiece]);

  // Update a single photo slot and persist the full photos array
  const pickPhoto = React.useCallback((entryIndex: number, photoIndex: number) => {
    if (!piece) return;
    const existingUri = drafts[entryIndex]?.photos?.[photoIndex];
    if (!canAddPiecePhoto(piece, !!existingUri)) {
      requestAccess(PremiumFeature.UnlimitedPhotos);
      return;
    }
    openPickSheet(
      (uri) => {
        updatePhotoAt(entryIndex, photoIndex, uri);
        const currentPhotos = [...(drafts[entryIndex]?.photos ?? [])];
        currentPhotos[photoIndex] = uri;
        onUpdateEntry(piece.id, entryIndex, { photos: currentPhotos });
      },
      existingUri ? () => {
        deletePhotoAt(entryIndex, photoIndex);
        const currentPhotos = (drafts[entryIndex]?.photos ?? []).filter((_, i) => i !== photoIndex);
        onUpdateEntry(piece.id, entryIndex, { photos: currentPhotos });
      } : undefined,
    );
  }, [piece, updatePhotoAt, deletePhotoAt, drafts, onUpdateEntry, openPickSheet, requestAccess]);

  const goToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(index, spreads.length - 1));
    setActivePage(clamped);
    pageScrollRef.current?.scrollTo({ x: clamped * pageWidth, animated: true });
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActivePage(nextPage);
  };

  const handleChangeSaleMode = React.useCallback((mode: PricingSaleMode) => {
    if (!piece) return;
    const retailTarget = piece.retailPriceTarget ?? parseNumericInput(piece.price) ?? piece.suggestedPrice ?? 0;
    const wholesaleTarget = piece.wholesalePriceTarget ?? piece.wholesalePrice ?? 0;
    const nextPrice = mode === 'wholesale' ? wholesaleTarget : retailTarget;

    onUpdatePiece({
      ...piece,
      salePriceMode: mode,
      retailPriceTarget: retailTarget || undefined,
      wholesalePriceTarget: wholesaleTarget || undefined,
      price: nextPrice > 0 ? String(nextPrice) : undefined,
    });
  }, [onUpdatePiece, piece]);

  if (!piece) return null;

  const canAddMorePhotos = checkPremium(PremiumFeature.UnlimitedPhotos) || countPiecePhotos(piece) < 1;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose} statusBarTranslucent>
      {PaywallGate}
      <LinearGradient
        colors={[...JournalTheme.shellGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingTop: topInset, paddingHorizontal: isCompact ? 12 : 14, paddingBottom: bottomInset }}>
          <JournalHeader
            piece={piece}
            subtitle={activeSubtitle}
            isCompact={isCompact}
            onClose={onClose}
            onShareToCommunity={sessionToken ? handleShareJournal : undefined}
          />
          <View style={{ height: tabsBlock, marginBottom: 2 }}>
            <BookTabs
              spreads={spreads}
              activePage={activePage}
              onPress={goToPage}
              icons={icons}
            />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, minHeight: 0 }}>
            <View
              style={{
                flex: 1,
                width: bookWidth,
                maxHeight: maxBookHeight,
                alignSelf: 'center',
                padding: shellPadding,
                minHeight: 0,
              }}
            >
              <View
                onLayout={(event) => setMeasuredBookHeight(event.nativeEvent.layout.height)}
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  borderRadius: isCompact ? 22 : 26,
                  backgroundColor: JournalTheme.pageBackground,
                  borderWidth: 1,
                  borderColor: JournalTheme.pageBorder,
                  minHeight: 0,
                }}
              >
                <JournalBook
                  spreads={spreads}
                  pageWidth={pageWidth}
                  piece={piece}
                  totalMs={totalMs}
                  isCompact={isCompact}
                  currencySymbol={currencySymbol}
                  handleChangeSaleMode={handleChangeSaleMode}
                  pickPhoto={pickPhoto}
                  pickCoverPhoto={pickCoverPhoto}
                  handleUpdateNotes={handleUpdateNotes}
                  handleUpdateDescription={handleUpdateDescription}
                  pageScrollRef={pageScrollRef}
                  handleMomentumEnd={handleMomentumEnd}
                  canAddMorePhotos={canAddMorePhotos}
                />

                <BinderSpine height={measuredBookHeight} compact={!isTablet && isCompact} />

                <JournalNavigation
                  activePage={activePage}
                  totalPages={spreads.length}
                  goToPage={goToPage}
                  isCompact={isCompact}
                  bookHeight={measuredBookHeight}
                  spreads={spreads}
                  accent={activeSpread?.accent ?? PAGE_ACCENTS[0]}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
      {visible ? <PhotoPickerOverlay /> : null}
    </Modal>
  );
}
