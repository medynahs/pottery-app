import { ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Button } from '@/src/components/ui/button';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Piece } from '@/src/types/pieces';
import { X } from 'lucide-react-native';
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { AddPieceForm } from '../components/AddPieceForm';
import { useAddPieceForm } from '../hooks/useAddPieceForm';

interface AddPieceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (pieces: Piece[]) => void;
  editPiece?: Piece;
  onEdit?: (piece: Piece) => void;
}

export function AddPieceModal({ visible, onClose, onAdd, editPiece, onEdit }: AddPieceModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { form, set, handleClose, pickImage, handleAdd, handleEdit, PhotoPickerSheets } = useAddPieceForm(onClose, onAdd, editPiece, onEdit);
  const isEditing = !!editPiece;

  return (
    <>
      {PhotoPickerSheets}
      <ModalShell visible={visible} onClose={handleClose} backdropColor="rgba(0,0,0,0.5)">
      <ModalCard maxHeight={screenHeight * 0.92}>

            {/* Title row */}
            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-border">
              <Text className="text-2xl font-serif font-bold text-foreground">
                {isEditing ? 'Edit Piece' : (form.quantity ?? 1) > 1 ? 'New Set' : 'New Piece'}
              </Text>
              <Pressable
                onPress={handleClose}
                className="p-1"
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <X size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <AddPieceForm form={form} set={set} onPickImage={pickImage} colors={colors} isEditing={isEditing} />

            {/* Footer */}
            <View className="px-6 pt-4 pb-10 border-t border-border">
              <Button
                onPress={isEditing ? handleEdit : handleAdd}
                disabled={!form.name.trim() || !form.clay.trim()}
                className="w-full"
              >
                <Text className="text-primary-foreground font-semibold">
                  {isEditing ? 'Save Changes' : (form.quantity ?? 1) > 1 ? `Add ${form.quantity} Pieces` : 'Add Piece'}
                </Text>
              </Button>
            </View>
      </ModalCard>
    </ModalShell>
    </>
  );
}
