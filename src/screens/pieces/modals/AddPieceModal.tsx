import {
  ModalCard,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Piece } from '@/src/types/pieces';
import React from 'react';
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
  const sheetHeight = useModalSheetHeight();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { form, set, handleClose, handleAdd, handleEdit } = useAddPieceForm(onClose, onAdd, editPiece, onEdit);
  const isEditing = !!editPiece;

  return (
    <ModalShell visible={visible} onClose={handleClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-2xl font-serif font-bold text-foreground">
            {isEditing ? 'Edit Piece' : (form.quantity ?? 1) > 1 ? 'New Set' : 'New Piece'}
          </Text>
        </ModalSheetHeader>

        <AddPieceForm
          form={form}
          set={set}
          colors={colors}
          isEditing={isEditing}
          fillHeight
        />

        <ModalSheetFooter>
          <Button
            onPress={isEditing ? handleEdit : handleAdd}
            disabled={!form.name.trim() || !form.clay.trim()}
            className="w-full"
          >
            <Text className="text-primary-foreground font-semibold">
              {isEditing ? 'Save Changes' : (form.quantity ?? 1) > 1 ? `Add ${form.quantity} Pieces` : 'Add Piece'}
            </Text>
          </Button>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
