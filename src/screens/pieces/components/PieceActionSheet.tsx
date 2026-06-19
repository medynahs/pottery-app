import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Copy, Edit3, Layers, Trash2, BookOpen } from 'lucide-react-native';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import type { Piece } from '../../../types/pieces';
import { STAGE_LABEL } from '../utils/constants';

interface PieceActionSheetProps {
  piece: Piece | null;
  visible: boolean;
  onClose: () => void;
  onJournal?: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDuplicateBatch?: () => void;
  onDelete: () => void;
}

export function PieceActionSheet({
  piece,
  visible,
  onClose,
  onJournal,
  onEdit,
  onDuplicate,
  onDuplicateBatch,
  onDelete,
}: PieceActionSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  if (!piece) return null;

  // Close sheet first, then fire action after animation settles
  const act = (fn: () => void) => () => {
    onClose();
    setTimeout(fn, 250);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
        {/* Tap outside to dismiss */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <View className="mx-4 mb-8 rounded-3xl overflow-hidden bg-background">
          {/* Header */}
          <View className="px-5 py-4 border-b border-border">
            <Text className="font-serif font-bold text-base text-foreground" numberOfLines={1}>
              {piece.name}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {STAGE_LABEL[piece.stage] ?? piece.stage} · {piece.clay}
            </Text>
          </View>

          {/* Actions */}
          {onJournal ? (
            <Row
              icon={<BookOpen size={17} color={colors.foreground} />}
              label="Open journal"
              onPress={act(onJournal)}
            />
          ) : null}
          <Row
            icon={<Edit3 size={17} color={colors.foreground} />}
            label="Edit details"
            onPress={act(onEdit)}
          />
          <Row
            icon={<Copy size={17} color={colors.foreground} />}
            label="Duplicate piece"
            onPress={act(onDuplicate)}
          />
          {onDuplicateBatch && (
            <Row
              icon={<Layers size={17} color={colors.foreground} />}
              label="Duplicate entire batch"
              onPress={act(onDuplicateBatch)}
            />
          )}

          <View className="h-px bg-border mx-5 my-1" />

          <Row
            icon={<Trash2 size={17} color="hsl(0 55% 45%)" />}
            label="Delete piece"
            onPress={act(onDelete)}
            destructive
          />

          {/* Cancel */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="mx-4 mb-4 mt-2 items-center py-3.5 rounded-2xl bg-muted/60"
          >
            <Text className="text-sm font-body-medium text-muted-foreground">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Row({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.65} className="flex-row items-center gap-3.5 px-5 py-4">
      {icon}
      <Text className={`text-sm font-medium ${destructive ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
