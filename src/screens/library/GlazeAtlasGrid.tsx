import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { GLAZE_FINISH_LABELS } from '@/src/screens/glazes/types';
import { normalizeCone } from '@/src/screens/library/discover/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import {
  buildGlazeCardMetaLine,
  buildGlazeCardSubtitle,
  formatGlazeDisplayName,
  resolveGlazeStatus,
} from './atlas/glazeListUtils';
import { glazeCardColor } from './atlas/helpers';
import { GlazePhotoTile } from './GlazePhotoTile';
import { GlazeSwipeTile } from './GlazeSwipeTile';

export function GlazeAtlasGrid({
  glazes,
  userConeNorm,
  onDeleteGlaze,
}: {
  glazes: GlazeLibraryItem[];
  userConeNorm: string | null;
  onDeleteGlaze?: (glaze: GlazeLibraryItem) => void;
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

  const renderTile = (glaze: GlazeLibraryItem) => {
    const tile = (
      <GlazePhotoTile
        width={tileWidth}
        name={formatGlazeDisplayName(glaze)}
        coneLabel={glaze.defaultCone || glaze.coneRange}
        subtitle={buildGlazeCardSubtitle(glaze)}
        finishLabel={GLAZE_FINISH_LABELS[glaze.finish]}
        metaLine={buildGlazeCardMetaLine(glaze)}
        status={resolveGlazeStatus(glaze)}
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
    );

    if (!onDeleteGlaze) return tile;

    return (
      <GlazeSwipeTile
        key={glaze.id}
        width={tileWidth}
        onDelete={() => onDeleteGlaze(glaze)}
      >
        {tile}
      </GlazeSwipeTile>
    );
  };

  return (
    <View className="px-6 flex-row" style={{ gap }}>
      <View style={{ width: tileWidth }}>
        {leftColumn.map((glaze) => (
          <React.Fragment key={glaze.id}>{renderTile(glaze)}</React.Fragment>
        ))}
      </View>
      <View style={{ width: tileWidth }}>
        {rightColumn.map((glaze) => (
          <React.Fragment key={glaze.id}>{renderTile(glaze)}</React.Fragment>
        ))}
      </View>
    </View>
  );
}
