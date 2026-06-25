import {
  ModalCard,
  ModalFormScrollView,
  ModalSheetFooter,
  MODAL_SHEET_RADIUS,
  SheetButton,
  useModalSheetHeight,
  ModalShell,
} from '@/src/components/AppSheets';
import { MemorialHeadstone } from '../components/MemorialHeadstone';
import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { NotesInput } from '@/src/components/NotesInput';
import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { Piece } from '../../../types/pieces';

const CEMETERY_BACKDROP = 'rgba(14, 9, 6, 0.88)';
const HEADER_GRADIENT = ['#1A1210', '#2A1C16', '#3D2B22', '#6B4A32'] as const;

interface CemeterySacrificeModalProps {
  piece: Piece | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (pieceId: number, memorial: { epitaph?: string; causeOfDeath?: string }) => void;
}

export function CemeterySacrificeModal({
  piece,
  visible,
  onClose,
  onConfirm,
}: CemeterySacrificeModalProps) {
  const sheetHeight = useModalSheetHeight(0.88);
  const [epitaph, setEpitaph] = React.useState('');
  const [causeOfDeath, setCauseOfDeath] = React.useState('');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const memorialRef = React.useRef({ epitaph: '', causeOfDeath: '' });
  const onConfirmRef = React.useRef(onConfirm);

  memorialRef.current = { epitaph, causeOfDeath };
  onConfirmRef.current = onConfirm;

  React.useEffect(() => {
    if (!visible || !piece) return;
    setEpitaph(piece.epitaph ?? '');
    setCauseOfDeath(piece.causeOfDeath ?? '');
    setIsAnimating(false);
  }, [visible, piece?.id]);

  React.useEffect(() => {
    if (visible) return;
    setIsAnimating(false);
  }, [visible]);

  React.useEffect(() => {
    if (!isAnimating || !piece) return;

    const pieceId = piece.id;
    const timer = setTimeout(() => {
      const memorial = memorialRef.current;
      onConfirmRef.current(pieceId, {
        epitaph: memorial.epitaph.trim() || undefined,
        causeOfDeath: memorial.causeOfDeath.trim() || undefined,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAnimating, piece]);

  if (!piece) return null;

  const handleClose = () => {
    if (isAnimating) return;
    onClose();
  };

  const handleConfirm = () => {
    if (isAnimating) return;
    setIsAnimating(true);
  };

  const pieceImage = piece.photo ?? piece.imgUrl;
  const suggestedCause = piece.status
    ? `The kiln whispers: "${piece.status}"`
    : 'Tell the Kiln Gods what befell this piece.';

  return (
    <ModalShell
      visible={visible}
      onClose={handleClose}
      backdropColor={CEMETERY_BACKDROP}
      overlay={
        isAnimating ? (
          <CeremonyOverlay
            visible
            emoji="🪦"
            title="The offering is accepted."
            subtitle={`${piece.name} rests now in the Kiln Gods' Garden.`}
            footnote="Every crack is a lesson. Every loss, a story."
            tint="rgba(140, 100, 68, 1)"
            durationMs={0}
            onDismiss={() => {}}
          />
        ) : null
      }
    >
      <ModalCard
        height={sheetHeight}
        maxHeight={sheetHeight}
        withHandle={false}
        backgroundColor={HEADER_GRADIENT[0]}
      >
        <LinearGradient
          colors={[...HEADER_GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View className="items-center pt-2 pb-3">
            <View className="w-10 h-1 rounded-full bg-white/25" />
          </View>

          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Sparkles size={12} color="rgba(255, 214, 163, 0.7)" />
                <Text className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Rite of Passage
                </Text>
              </View>
              <Text
                className="text-lg leading-6 text-white"
                style={{ fontFamily: 'Fraunces_700Bold' }}
              >
                Shall this piece join the Kiln Gods' Garden?
              </Text>
              {(piece.clay || piece.status) ? (
                <Text className="text-xs text-white/55 mt-1 leading-[18px]" numberOfLines={1}>
                  {piece.clay}{piece.status ? ` · ${piece.status}` : ''}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isAnimating}
              activeOpacity={0.75}
              className="w-8 h-8 rounded-full bg-white/15 items-center justify-center shrink-0"
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View className="flex-1 bg-background" style={{ minHeight: 0 }}>
          <ModalFormScrollView
            className="px-6"
            style={{ flex: 1, minHeight: 0 }}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 16 }}
          >
          <NotesInput
            label="Epitaph"
            placeholder="Gone too soon, but gloriously glazed."
            value={epitaph}
            onChangeText={setEpitaph}
            minHeight={80}
          />

          <NotesInput
            label="Cause of death"
            placeholder="Cracked in the bisque after an overconfident trim session…"
            value={causeOfDeath}
            onChangeText={setCauseOfDeath}
            minHeight={80}
            containerStyle={{ marginTop: 16 }}
          />

          <Text className="text-xs text-muted-foreground mt-2 mb-3 leading-[18px] italic">
            {suggestedCause}
          </Text>

          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Headstone preview
          </Text>

          <MemorialHeadstone
            pieceName={piece.name}
            epitaph={epitaph}
            causeOfDeath={causeOfDeath}
            imageUri={pieceImage}
            preview
          />
          </ModalFormScrollView>

          <ModalSheetFooter>
            <View style={{ gap: 10 }}>
              <SheetButton label="Lay to rest" onPress={handleConfirm} variant="confirm" disabled={isAnimating} />
              <SheetButton label="Grant mercy" onPress={handleClose} variant="cancel" disabled={isAnimating} />
            </View>
          </ModalSheetFooter>
        </View>
      </ModalCard>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderTopLeftRadius: MODAL_SHEET_RADIUS,
    borderTopRightRadius: MODAL_SHEET_RADIUS,
  },
});
