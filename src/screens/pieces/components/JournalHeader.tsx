import { Text } from '@/src/components/ui/text';
import { BookOpen, X } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { Piece } from '../../../types/pieces';
import { JournalTheme } from '../utils/journalTheme';

export function JournalHeader({
  subtitle,
  isCompact,
  onClose,
}: {
  piece: Piece;
  subtitle?: string;
  isCompact: boolean;
  onClose: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingBottom: 6,
        minHeight: isCompact ? 40 : 44,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 8 }}>
        <View
          style={{
            width: isCompact ? 30 : 34,
            height: isCompact ? 30 : 34,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: JournalTheme.headerIconBg,
          }}
        >
          <BookOpen size={isCompact ? 13 : 15} color={JournalTheme.headerText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: JournalTheme.headerSubtext,
            }}
          >
            Artisan Journal
          </Text>
          {subtitle ? (
            <Text
              style={{ fontSize: isCompact ? 11 : 12, marginTop: 1, color: JournalTheme.headerText }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        onPress={onClose}
        activeOpacity={0.8}
        accessibilityLabel="Close journal"
        style={{
          width: isCompact ? 32 : 36,
          height: isCompact ? 32 : 36,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: JournalTheme.headerIconBg,
        }}
      >
        <X size={18} color={JournalTheme.headerText} />
      </TouchableOpacity>
    </View>
  );
}
