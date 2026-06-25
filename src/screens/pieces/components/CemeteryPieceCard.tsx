import { Check, MoreHorizontal } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { Piece } from '../../../types/pieces';
import { MemorialHeadstone, getMemorialHeadstoneHeight } from './MemorialHeadstone';

interface CemeteryPieceCardProps {
  piece: Piece;
  headstoneWidth: number;
  selectionMode?: boolean;
  selected?: boolean;
  onPress?: () => void;
  onMore?: () => void;
  onLongPress?: () => void;
  onToggleSelect?: () => void;
}

export function CemeteryPieceCard({
  piece,
  headstoneWidth,
  selectionMode = false,
  selected = false,
  onPress,
  onMore,
  onLongPress,
  onToggleSelect,
}: CemeteryPieceCardProps) {
  const headstoneHeight = getMemorialHeadstoneHeight(headstoneWidth, false);
  const pieceImage = piece.photo ?? piece.imgUrl;

  const handlePress = () => {
    if (selectionMode) {
      onToggleSelect?.();
      return;
    }
    onPress?.();
  };

  const handleLongPress = () => {
    if (selectionMode) {
      onToggleSelect?.();
      return;
    }
    onLongPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={[
        styles.plot,
        selected ? styles.plotSelected : null,
        { minHeight: headstoneHeight + 6 },
      ]}
    >
      {selectionMode ? (
        <View style={[styles.selectBadge, selected ? styles.selectBadgeActive : null]}>
          {selected ? <Check size={11} color="hsl(34 35% 92%)" strokeWidth={3} /> : null}
        </View>
      ) : null}

      {!selectionMode && onMore ? (
        <TouchableOpacity
          onPress={onMore}
          hitSlop={8}
          activeOpacity={0.75}
          style={styles.moreButton}
          accessibilityRole="button"
          accessibilityLabel="More actions"
        >
          <MoreHorizontal size={14} color="rgba(255, 244, 228, 0.9)" />
        </TouchableOpacity>
      ) : null}

      <MemorialHeadstone
        width={headstoneWidth}
        showGround={false}
        pieceName={piece.name}
        epitaph={piece.epitaph}
        causeOfDeath={piece.causeOfDeath}
        imageUri={pieceImage}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  plot: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
    paddingBottom: 2,
    borderRadius: 14,
  },
  plotSelected: {
    backgroundColor: 'rgba(201, 151, 95, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(201, 151, 95, 0.45)',
  },
  selectBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    zIndex: 2,
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 251, 242, 0.9)',
    backgroundColor: 'rgba(42, 62, 32, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBadgeActive: {
    borderColor: 'hsl(39 57% 51%)',
    backgroundColor: 'hsl(39 57% 51%)',
  },
  moreButton: {
    position: 'absolute',
    top: 2,
    right: 0,
    zIndex: 2,
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 20, 14, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 174, 0.18)',
  },
});
