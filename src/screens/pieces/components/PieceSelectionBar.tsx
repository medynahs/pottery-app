import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import {
  CEMETERY_ACCENT,
  CEMETERY_BORDER_SUBTLE,
  CEMETERY_PILL_ACTIVE,
  CEMETERY_SURFACE,
  CEMETERY_TEXT,
  CEMETERY_TEXT_MUTED,
  CEMETERY_TEXT_SUBTLE,
} from '@/src/screens/pieces/cemeteryTheme';
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
  variant?: 'default' | 'cemetery';
};

export function PieceSelectionBar({
  selectedCount,
  advanceLabel,
  canAdvance,
  hint,
  onCancel,
  onAdvance,
  variant = 'default',
}: PieceSelectionBarProps) {
  const isCemetery = variant === 'cemetery';

  return (
    <View style={[styles.bar, isCemetery && styles.barCemetery]}>
      <View style={styles.row}>
        <View style={styles.meta}>
          <Text
            className={`text-xs font-serif font-bold ${isCemetery ? '' : 'text-foreground'}`}
            style={isCemetery ? { color: CEMETERY_TEXT } : undefined}
            numberOfLines={1}
          >
            {selectedCount} selected
          </Text>
          {hint ? (
            <Text
              className={`text-[10px] mt-0.5 ${isCemetery ? '' : 'text-muted-foreground'}`}
              style={[styles.hint, isCemetery ? { color: CEMETERY_TEXT_MUTED } : undefined]}
              numberOfLines={2}
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
            style={[styles.cancelButton, isCemetery && styles.cancelButtonCemetery]}
          >
            <Text
              className={`text-xs font-body-medium ${isCemetery ? '' : 'text-foreground'}`}
              style={isCemetery ? { color: CEMETERY_TEXT_SUBTLE } : undefined}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAdvance}
            disabled={!canAdvance}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={advanceLabel}
            style={[
              styles.advanceButton,
              isCemetery
                ? canAdvance
                  ? styles.advanceButtonCemeteryActive
                  : styles.advanceButtonCemeteryDisabled
                : canAdvance
                  ? styles.advanceButtonActive
                  : styles.advanceButtonDisabled,
            ]}
          >
            <Text
              className="text-xs font-body-medium"
              style={{
                color: canAdvance
                  ? isCemetery
                    ? CEMETERY_ACCENT
                    : '#FFFFFF'
                  : isCemetery
                    ? CEMETERY_TEXT_SUBTLE
                    : 'hsl(24 20% 40%)',
              }}
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
  barCemetery: {
    backgroundColor: CEMETERY_SURFACE,
    borderTopColor: CEMETERY_BORDER_SUBTLE,
    shadowColor: '#0A0604',
    shadowOpacity: 0.28,
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
  cancelButtonCemetery: {
    backgroundColor: 'rgba(42, 28, 22, 0.85)',
    borderColor: CEMETERY_BORDER_SUBTLE,
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
  advanceButtonCemeteryActive: {
    backgroundColor: CEMETERY_PILL_ACTIVE,
    borderWidth: 1,
    borderColor: CEMETERY_BORDER_SUBTLE,
  },
  advanceButtonDisabled: {
    backgroundColor: STUDIO_CREAM_MUTED,
    borderWidth: 1,
    borderColor: STUDIO_CREAM_BORDER,
  },
  advanceButtonCemeteryDisabled: {
    backgroundColor: 'rgba(42, 28, 22, 0.85)',
    borderWidth: 1,
    borderColor: CEMETERY_BORDER_SUBTLE,
  },
});
