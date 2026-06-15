import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { GLAZE_FINISH_LABELS } from '@/src/screens/glazes/types';
import { normalizeCone } from '@/src/screens/library/discover/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { glazeCardColor } from './atlas/helpers';
import { GlazePhotoTile } from './GlazePhotoTile';

export function GlazeAtlasGrid({
  glazes,
  userConeNorm,
}: {
  glazes: GlazeLibraryItem[];
  userConeNorm: string | null;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const gap = 10;
  const horizontalPad = 24;
  const tileWidth = (width - horizontalPad * 2 - gap) / 2;

  const leftColumn = glazes.filter((_, i) => i % 2 === 0);
  const rightColumn = glazes.filter((_, i) => i % 2 === 1);

  const openGlaze = (id: string) => {
    router.push(`/glaze/${id}` as never);
  };

  return (
    <View className="px-6 flex-row" style={{ gap }}>
      <View style={{ width: tileWidth }}>
        {leftColumn.map((glaze) => (
          <GlazePhotoTile
            key={glaze.id}
            width={tileWidth}
            name={glaze.name}
            coneLabel={glaze.defaultCone || glaze.coneRange}
            finishLabel={GLAZE_FINISH_LABELS[glaze.finish]}
            previewUri={
              glaze.bucketPhotoUri ??
              glaze.testTilePhotoUris[0] ??
              glaze.finishedPiecePhotoUris[0]
            }
            colorHex={glazeCardColor(glaze.colorFamily)}
            matchesCone={
              userConeNorm !== null &&
              normalizeCone(glaze.defaultCone || glaze.coneRange) === userConeNorm
            }
            favorite={glaze.favorite}
            onPress={() => openGlaze(glaze.id)}
          />
        ))}
      </View>
      <View style={{ width: tileWidth }}>
        {rightColumn.map((glaze) => (
          <GlazePhotoTile
            key={glaze.id}
            width={tileWidth}
            name={glaze.name}
            coneLabel={glaze.defaultCone || glaze.coneRange}
            finishLabel={GLAZE_FINISH_LABELS[glaze.finish]}
            previewUri={
              glaze.bucketPhotoUri ??
              glaze.testTilePhotoUris[0] ??
              glaze.finishedPiecePhotoUris[0]
            }
            colorHex={glazeCardColor(glaze.colorFamily)}
            matchesCone={
              userConeNorm !== null &&
              normalizeCone(glaze.defaultCone || glaze.coneRange) === userConeNorm
            }
            favorite={glaze.favorite}
            onPress={() => openGlaze(glaze.id)}
          />
        ))}
      </View>
    </View>
  );
}
