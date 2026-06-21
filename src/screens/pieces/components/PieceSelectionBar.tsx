import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

/** Matches AppSheets / studio cream surfaces. */
const STUDIO_CREAM = '#FFFBF2';
const STUDIO_CREAM_BORDER = '#E8D9BE';
const STUDIO_CREAM_MUTED = '#EDE4D3';

type PieceSelectionBarProps = {
  selectedCount: number;
  advanceLabel: string;
  canAdvance: boolean;
  hint?: string;
  onCancel: () => void;
  onAdvance: () => void;
};

export function PieceSelectionBar({
  selectedCount,
  advanceLabel,
  canAdvance,
  hint,
  onCancel,
  onAdvance,
}: PieceSelectionBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <View style={styles.meta}>
          <Text className="text-xs font-serif font-bold text-foreground" numberOfLines={1}>
            {selectedCount} selected
          </Text>
          {hint ? (
            <Text
              className="text-[10px] text-muted-foreground mt-0.5"
              numberOfLines={2}
              style={styles.hint}
            >
              {hint}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onCancel}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cancel selection"
            style={styles.cancelButton}
          >
            <Text className="text-xs font-body-medium text-foreground">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAdvance}
            disabled={!canAdvance}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={advanceLabel}
            style={[
              styles.advanceButton,
              canAdvance ? styles.advanceButtonActive : styles.advanceButtonDisabled,
            ]}
          >
            <Text
              className="text-xs font-body-medium"
              style={{ color: canAdvance ? '#FFFFFF' : 'hsl(24 20% 40%)' }}
              numberOfLines={1}
            >
              {advanceLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: STUDIO_CREAM,
    borderTopWidth: 1,
    borderTopColor: STUDIO_CREAM_BORDER,
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
    shadowColor: '#3A2810',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  hint: {
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: STUDIO_CREAM_MUTED,
    borderWidth: 1,
    borderColor: STUDIO_CREAM_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 148,
  },
  advanceButtonActive: {
    backgroundColor: BrandColors.primary,
  },
  advanceButtonDisabled: {
    backgroundColor: STUDIO_CREAM_MUTED,
    borderWidth: 1,
    borderColor: STUDIO_CREAM_BORDER,
  },
});
