import {
  ModalCard,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Button } from '@/src/components/ui/button';
import { SelectChip, SelectChipGroup } from '@/src/components/ui/SelectChip';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Piece } from '@/src/types/pieces';
import { PIECE_DETAIL_LEVEL_OPTIONS, type PieceDetailLevel } from '@/src/utils/roleBasedUx';
import React from 'react';
import { View } from 'react-native';
import { AddPieceForm } from '../components/AddPieceForm';
import { useAddPieceForm } from '../hooks/useAddPieceForm';

interface AddPieceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (pieces: Piece[]) => void;
  editPiece?: Piece;
  onEdit?: (piece: Piece) => void;
}

function getDetailHint(level: PieceDetailLevel): string {
  return PIECE_DETAIL_LEVEL_OPTIONS.find((option) => option.value === level)?.hint ?? '';
}

export function AddPieceModal({ visible, onClose, onAdd, editPiece, onEdit }: AddPieceModalProps) {
  const sheetHeight = useModalSheetHeight();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const {
    form,
    set,
    detailLevel,
    setDetailLevel,
    pricingSettings,
    handleClose,
    handleAdd,
    handleEdit,
  } = useAddPieceForm(onClose, onAdd, editPiece, onEdit);
  const isEditing = !!editPiece;
  const showDetailPicker = form.stage !== 'cemetery';

  return (
    <ModalShell visible={visible} onClose={handleClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-2xl font-serif font-bold text-foreground">
            {isEditing ? 'Edit Piece' : (form.quantity ?? 1) > 1 ? 'New Set' : 'New Piece'}
          </Text>
          {showDetailPicker ? (
            <View className="mt-3">
              <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Detail level
              </Text>
              <SelectChipGroup>
                {PIECE_DETAIL_LEVEL_OPTIONS.map((option) => (
                  <SelectChip
                    key={option.value}
                    label={option.label}
                    selected={detailLevel === option.value}
                    onPress={() => setDetailLevel(option.value)}
                    className="flex-1 justify-center"
                  />
                ))}
              </SelectChipGroup>
              <Text className="text-xs text-muted-foreground mt-2 leading-5">
                {getDetailHint(detailLevel)}
                {detailLevel !== 'full' ? ' Tap Full details for pricing, glaze, workshop, and listing.' : ''}
              </Text>
            </View>
          ) : null}
        </ModalSheetHeader>

        <AddPieceForm
          form={form}
          set={set}
          colors={colors}
          detailLevel={detailLevel}
          pricingSettings={pricingSettings}
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
