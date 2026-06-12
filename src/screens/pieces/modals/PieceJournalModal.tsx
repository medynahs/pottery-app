import { PhotoPickerOverlay } from '@/src/components/PhotoPickerOverlay';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store/appStore';
import { canAddPiecePhoto, PremiumFeature } from '@/src/utils/premiumGate';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
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
import { resolveStageIcon } from '../utils/stageIconUtils';


interface PieceJournalModalProps {
  piece: Piece | null;
  visible: boolean;
  onClose: () => void;
  onUpdatePiece: (piece: Piece) => void;
  onUpdateEntry: (
    pieceId: number,
    entryIndex: number,
    patch: { notes?: string; photos?: string[] }
  ) => void;
}

export function PieceJournalModal({
  piece,
  visible,
  onClose,
  onUpdatePiece,
  onUpdateEntry,
}: PieceJournalModalProps) {
  const { stages } = useStageConfig();
  const currencySymbol = useAppStore((state) => state.pricingSettings.currencySymbol);
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 700;
  const isCompact = width < 430;
  const shellPadding = isCompact ? 10 : 14;
  const pageInset = isCompact ? 20 : 28;
  const [activePage, setActivePage] = React.useState(0);
  const pageScrollRef = React.useRef<ScrollViewType>(null);

  // Custom hook for drafts
  const { drafts, setDrafts, updateNotes, updatePhotoAt, deletePhotoAt } = useJournalDrafts(piece, visible);
  const { openPickSheet } = usePhotoPicker({ aspect: [4, 3] });
  const { requestAccess, PaywallGate } = usePremiumGate();

  React.useEffect(() => {
    if (visible && piece) {
      setActivePage(0);
      requestAnimationFrame(() => pageScrollRef.current?.scrollTo({ x: 0, animated: false }));
    }
    // Only reset to cover when the modal opens or a *different* piece is shown.
    // Using piece.id instead of piece prevents a reset on every content update
    // (e.g. after picking a photo, setJournalPiece creates a new object reference).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece?.id, visible]);

  const totalMs = useMemo(() => piece ? Date.now() - new Date(piece.createdAt).getTime() : 0, [piece]);
  const bookWidth = useMemo(() => Math.min(width - (isCompact ? 10 : 18), 940), [width, isCompact]);
  const bookHeight = useMemo(() => Math.min(height * (isCompact ? 0.84 : 0.8), 760), [height, isCompact]);
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
  const activeSubtitle = activeSpread?.kind === 'cover'
    ? activeSpread.subtitle
    : piece
      ? `${piece.clay} · ${formatDuration(totalMs)} in the making`
      : '';

  // Update notes using hook and call onUpdateEntry
  const handleUpdateNotes = React.useCallback((index: number, notes: string) => {
    if (!piece) return;
    updateNotes(index, notes);
    onUpdateEntry(piece.id, index, { notes });
  }, [piece, updateNotes, onUpdateEntry]);

  // Update the piece-level cover photo
  const pickCoverPhoto = React.useCallback(() => {
    if (!piece) return;
    const heroImage = piece.photo ?? piece.imgUrl;
    openPickSheet(
      (uri) => onUpdatePiece({ ...piece, photo: uri }),
      heroImage ? () => onUpdatePiece({ ...piece, photo: undefined, imgUrl: undefined }) : undefined,
    );
  }, [piece, onUpdatePiece, openPickSheet]);

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

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose} statusBarTranslucent>
      {PaywallGate}
      <LinearGradient
        colors={['#2D221C', '#4C3226', '#6C4433']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingTop: isCompact ? 48 : 54, paddingHorizontal: isCompact ? 10 : 14, paddingBottom: 18 }}>
          <JournalHeader piece={piece} isCompact={isCompact} onClose={onClose} />
          {/* BookTabs on top as book markers */}
          <BookTabs
            spreads={spreads}
            activePage={activePage}
            onPress={goToPage}
            icons={icons}
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View
              style={{
                width: bookWidth,
                height: bookHeight,
                alignSelf: 'center',
                padding: shellPadding,
              }}
            >
              <View
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  borderRadius: isCompact ? 22 : 26,
                  backgroundColor: '#F3E4CB',
                  borderWidth: 1,
                  borderColor: '#B78262',
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
                />

                <BinderSpine height={bookHeight} compact={isCompact} />

                <View style={isCompact ? { position: 'absolute', left: 12, bottom: 14 } : { position: 'absolute', left: 12, top: '50%', marginTop: -22 }}>
                  <TouchableOpacity
                    onPress={() => goToPage(activePage - 1)}
                    disabled={activePage === 0}
                    activeOpacity={0.8}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: activePage === 0 ? 'rgba(120, 95, 76, 0.2)' : 'rgba(92, 60, 43, 0.82)',
                    }}
                  >
                    <ChevronLeft size={isCompact ? 16 : 18} color={activePage === 0 ? '#B89A82' : '#FFF5E7'} />
                  </TouchableOpacity>
                </View>

                <View style={isCompact ? { position: 'absolute', right: 12, bottom: 14 } : { position: 'absolute', right: 12, top: '50%', marginTop: -22 }}>
                  <TouchableOpacity
                    onPress={() => goToPage(activePage + 1)}
                    disabled={activePage === spreads.length - 1}
                    activeOpacity={0.8}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: activePage === spreads.length - 1 ? 'rgba(120, 95, 76, 0.2)' : 'rgba(92, 60, 43, 0.82)',
                    }}
                  >
                    <ChevronRight size={isCompact ? 16 : 18} color={activePage === spreads.length - 1 ? '#B89A82' : '#FFF5E7'} />
                  </TouchableOpacity>
                </View>

                <JournalNavigation
                  activePage={activePage}
                  totalPages={spreads.length}
                  goToPage={goToPage}
                  isCompact={isCompact}
                  bookHeight={bookHeight}
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
