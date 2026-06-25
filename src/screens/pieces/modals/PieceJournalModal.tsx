import { PickSheet, type PickSheetOption } from '@/src/components/AppSheets';
import { PhotoPickerOverlay } from '@/src/components/PhotoPickerOverlay';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store/appStore';
import { canUploadBytesToCloud, getCloudStorageSnapshot } from '@/src/utils/cloudStorage';
import { canBackupPiecePhotoToCloud, PremiumFeature } from '@/src/utils/premiumGate';
import { LinearGradient } from 'expo-linear-gradient';
import { PackageCheck } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  Modal,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Piece } from '../../../types/pieces';
import { parseNumericInput, type PricingSaleMode } from '../../../types/pricing';
import { JournalBook, type JournalBookHandle } from '../components/JournalBook';
import { JournalBookShell } from '../components/JournalBookShell';
import { JournalHeader } from '../components/JournalHeader';
import { useJournalDrafts } from '../hooks/useJournalDrafts';
import { useJournalSpreads } from '../hooks/useJournalSpreads';
import { formatDuration } from '../utils/journal';
import { JournalTheme } from '../utils/journalTheme';
import { collectPiecePhotos } from '../utils/piecePhotos';
import { JournalStageRail } from '../components/JournalStageRail';
import { PiecePhotoGalleryModal } from '../modals/PiecePhotoGalleryModal';
import { resolveStageIcon } from '../utils/stageIconUtils';

const CONTENTS_THRESHOLD = 6;

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
  const studioLabel = useAppStore((state) => state.user.studioName?.trim() || state.user.name?.trim());
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 430;
  const horizontalGutter = isCompact ? 4 : 8;
  const [activePage, setActivePage] = React.useState(0);
  const [journalInitialPage, setJournalInitialPage] = React.useState(0);
  const [contentsOpen, setContentsOpen] = React.useState(false);
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const bookRef = React.useRef<JournalBookHandle>(null);
  const notesDebounceRef = React.useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const { drafts, updateNotes, updatePhotoAt, deletePhotoAt } = useJournalDrafts(piece, visible);
  const { openPickSheet } = usePhotoPicker({ aspect: [4, 3] });
  const { requestAccess, PaywallGate } = usePremiumGate();
  const showToast = useAppStore((state) => state.showToast);
  const hasCreatedPost = useAppStore((state) => state.hasCreatedPost);
  const pieceShareHintShown = useAppStore((state) => state.communityPieceShareHintShown);
  const markPieceShareHintShown = useAppStore((state) => state.markCommunityPieceShareHintShown);

  const maybePromptPieceShare = React.useCallback((isReplacing: boolean) => {
    if (isReplacing || hasCreatedPost || pieceShareHintShown) return;
    markPieceShareHintShown();
    showToast('Like this shot? Share it to the community from your piece menu', 'success');
  }, [hasCreatedPost, pieceShareHintShown, markPieceShareHintShown, showToast]);

  const notifyLocalOnlyPhoto = React.useCallback((updatedPiece: Piece, isReplacing: boolean) => {
    if (canBackupPiecePhotoToCloud(updatedPiece, isReplacing)) return;
    if (getCloudStorageSnapshot().atLimit) {
      showToast('Saved on this device · Cloud storage is full', 'error');
      return;
    }
    showToast('Saved on this device · Premium backs up photos to the cloud', 'success');
  }, [showToast]);

  React.useEffect(() => {
    if (!visible || !piece) return;
    const startPage = resolveInitialPage(piece, initialStage);
    setActivePage(startPage);
    setJournalInitialPage(startPage);
  }, [piece?.id, visible, initialStage]);

  React.useEffect(() => {
    if (!visible) {
      setContentsOpen(false);
      setGalleryOpen(false);
    }
  }, [visible]);

  const totalMs = useMemo(() => piece ? Date.now() - new Date(piece.createdAt).getTime() : 0, [piece]);

  const stageLabelById = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const stage of stages) labels[stage.id] = stage.label;
    return labels;
  }, [stages]);

  const spreads = useJournalSpreads(piece, drafts, stageLabelById, totalMs);
  const galleryPhotos = React.useMemo(
    () => (piece ? collectPiecePhotos(piece, stageLabelById) : []),
    [piece, stageLabelById],
  );

  const icons = spreads.map((spread) => {
    if (spread.kind === 'cover') return PackageCheck;
    const stageConfig = stages.find((s) => s.id === spread.entry.stage);
    return stageConfig ? resolveStageIcon(stageConfig) : PackageCheck;
  });

  const activeSpread = spreads[activePage] ?? spreads[0];

  const headerSubtitle = activeSpread?.kind === 'entry'
    ? `${piece?.name ?? ''} · ${activeSpread.stageLabel} · ${activeSpread.dateLabel}`
    : piece
      ? `${piece.name}${studioLabel ? ` · ${studioLabel}` : ''} · ${formatDuration(totalMs)} in the making`
      : '';

  const handleUpdateNotes = React.useCallback((index: number, notes: string) => {
    if (!piece) return;
    updateNotes(index, notes);
    if (notesDebounceRef.current[index]) clearTimeout(notesDebounceRef.current[index]);
    notesDebounceRef.current[index] = setTimeout(() => {
      onUpdateEntry(piece.id, index, { notes });
    }, 500);
  }, [piece, updateNotes, onUpdateEntry]);

  const pickCoverPhoto = React.useCallback(() => {
    if (!piece) return;
    const heroImage = piece.photo ?? piece.imgUrl;
    const isReplacing = !!heroImage;
    if (!isReplacing && !canUploadBytesToCloud() && getCloudStorageSnapshot().atLimit) {
      requestAccess(PremiumFeature.CloudStorage);
      return;
    }
    openPickSheet(
      (uri) => {
        const updated = { ...piece, photo: uri };
        onUpdatePiece(updated);
        notifyLocalOnlyPhoto(updated, isReplacing);
        maybePromptPieceShare(isReplacing);
      },
      heroImage ? () => onUpdatePiece({ ...piece, photo: undefined, imgUrl: undefined }) : undefined,
    );
  }, [piece, onUpdatePiece, openPickSheet, requestAccess, notifyLocalOnlyPhoto, maybePromptPieceShare]);

  const handleUpdateDescription = React.useCallback((description: string) => {
    if (!piece) return;
    onUpdatePiece({ ...piece, description });
  }, [piece, onUpdatePiece]);

  const pickPhoto = React.useCallback((entryIndex: number, photoIndex: number) => {
    if (!piece) return;
    const existingUri = drafts[entryIndex]?.photos?.[photoIndex];
    const isReplacing = !!existingUri;
    if (!isReplacing && !canUploadBytesToCloud() && getCloudStorageSnapshot().atLimit) {
      requestAccess(PremiumFeature.CloudStorage);
      return;
    }
    openPickSheet(
      (uri) => {
        updatePhotoAt(entryIndex, photoIndex, uri);
        const currentPhotos = [...(drafts[entryIndex]?.photos ?? [])];
        currentPhotos[photoIndex] = uri;
        onUpdateEntry(piece.id, entryIndex, { photos: currentPhotos });
        notifyLocalOnlyPhoto(piece, isReplacing);
        maybePromptPieceShare(isReplacing);
      },
      existingUri ? () => {
        deletePhotoAt(entryIndex, photoIndex);
        const currentPhotos = (drafts[entryIndex]?.photos ?? []).filter((_, i) => i !== photoIndex);
        onUpdateEntry(piece.id, entryIndex, { photos: currentPhotos });
      } : undefined,
    );
  }, [piece, updatePhotoAt, deletePhotoAt, drafts, onUpdateEntry, openPickSheet, requestAccess, notifyLocalOnlyPhoto, maybePromptPieceShare]);

  const goToPage = React.useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, spreads.length - 1));
    setActivePage(clamped);
    bookRef.current?.scrollToPage(clamped);
  }, [spreads.length]);

  const handlePageChange = React.useCallback((index: number) => {
    setActivePage(index);
  }, []);

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

  const contentsOptions = React.useMemo((): PickSheetOption[] => {
    return spreads.map((spread, index) => ({
      label: spread.kind === 'cover' ? 'Cover' : spread.stageLabel,
      onPress: () => goToPage(index),
    }));
  }, [spreads, goToPage]);

  if (!piece) return null;

  const canAddMorePhotos = true;
  const showContents = spreads.length >= CONTENTS_THRESHOLD;
  const showGallery = galleryPhotos.length > 0;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose} statusBarTranslucent>
      {PaywallGate}
      <PiecePhotoGalleryModal
        visible={galleryOpen}
        title={piece.name}
        photos={galleryPhotos}
        onClose={() => setGalleryOpen(false)}
      />
      <PickSheet
        visible={contentsOpen}
        title="Journal contents"
        body="Jump to any page in this piece's journal."
        layout="list"
        options={contentsOptions}
        onCancel={() => setContentsOpen(false)}
      />
      <LinearGradient
        colors={[...JournalTheme.shellGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 2,
            paddingBottom: insets.bottom + 2,
            paddingHorizontal: horizontalGutter,
          }}
        >
          <JournalHeader
            piece={piece}
            subtitle={headerSubtitle}
            isCompact={isCompact}
            onClose={onClose}
            onOpenContents={() => setContentsOpen(true)}
            onOpenGallery={() => setGalleryOpen(true)}
            showContents={showContents}
            showGallery={showGallery}
          />

          <JournalBookShell
            isCompact={isCompact}
            style={{ flex: 1, minHeight: 0 }}
            header={
              <JournalStageRail
                spreads={spreads}
                activePage={activePage}
                onPress={goToPage}
                icons={icons}
                embedded
                placement="top"
              />
            }
          >
            <JournalBook
              ref={bookRef}
              spreads={spreads}
              piece={piece}
              totalMs={totalMs}
              isCompact={isCompact}
              currencySymbol={currencySymbol}
              initialPage={journalInitialPage}
              handleChangeSaleMode={handleChangeSaleMode}
              pickPhoto={pickPhoto}
              pickCoverPhoto={pickCoverPhoto}
              handleUpdateNotes={handleUpdateNotes}
              handleUpdateDescription={handleUpdateDescription}
              onUpdatePiece={onUpdatePiece}
              onPageChange={handlePageChange}
              canAddMorePhotos={canAddMorePhotos}
            />
          </JournalBookShell>
        </View>
      </LinearGradient>
      {visible ? <PhotoPickerOverlay /> : null}
    </Modal>
  );
}
