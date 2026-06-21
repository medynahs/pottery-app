import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import { PiecePhotoGalleryModal } from '@/src/screens/pieces/modals/PiecePhotoGalleryModal';
import { collectPiecePhotos } from '@/src/screens/pieces/utils/piecePhotos';
import { useVisiblePieces } from '@/src/store/appStore';
import type { Piece } from '@/src/types/pieces';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Grid3X3, Plus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import {
  getProfileShowcasePieces,
  resolveShowcasePhoto,
} from '../utils/profileShowcase';

const GRID_GAP = 2;
const GRID_COLUMNS = 3;

function ShowcaseTile({
  piece,
  size,
  onPress,
}: {
  piece: Piece;
  size: number;
  onPress: () => void;
}) {
  const photo = resolveShowcasePhoto(piece);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityLabel={`View ${piece.name}`}
      style={{ width: size, height: size }}
    >
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          cachePolicy="memory-disk"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : null}
    </TouchableOpacity>
  );
}

export function WorkTab() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pieces = useVisiblePieces();
  const showcasePieces = useMemo(() => getProfileShowcasePieces(pieces), [pieces]);

  const tileSize = useMemo(() => {
    const horizontalPadding = 24 * 2;
    const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
    return Math.floor((width - horizontalPadding - totalGap) / GRID_COLUMNS);
  }, [width]);

  const [gallery, setGallery] = useState<{
    piece: Piece;
    photos: ReturnType<typeof collectPiecePhotos>;
  } | null>(null);

  const openPiece = (piece: Piece) => {
    const photos = collectPiecePhotos(piece);
    if (photos.length === 0) return;
    setGallery({ piece, photos });
  };

  if (showcasePieces.length === 0) {
    return (
      <EmptyState
        icon={Grid3X3}
        title="Your finished work"
        description="When pieces reach finished, their result photos appear here — a portfolio of your style at a glance."
        ctaLabel="Go to pieces"
        ctaIcon={Plus}
        onCtaPress={() => router.push('/(tabs)/pieces' as never)}
      />
    );
  }

  return (
    <View className="pb-6">
      <View className="px-6 mb-3 flex-row items-end justify-between">
        <View>
          <Text className="font-serif text-lg font-bold text-foreground">
            {showcasePieces.length} finished piece{showcasePieces.length === 1 ? '' : 's'}
          </Text>
          <Text className="text-[11px] mt-0.5 text-muted-foreground">
            Tap a photo to browse the full journal
          </Text>
        </View>
      </View>

      <View className="px-6">
        <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
          {showcasePieces.map((piece) => (
            <ShowcaseTile
              key={piece.id}
              piece={piece}
              size={tileSize}
              onPress={() => openPiece(piece)}
            />
          ))}
        </View>
      </View>

      <PiecePhotoGalleryModal
        visible={gallery != null}
        title={gallery?.piece.name ?? ''}
        photos={gallery?.photos ?? []}
        onClose={() => setGallery(null)}
      />
    </View>
  );
}
