import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { JournalTheme } from '../utils/journalTheme';

export type LedgerRowProps = {
  label: string;
  value: string;
};

export function LedgerSection({
  title,
  subtitle,
  children,
  compact,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: JournalTheme.tileBorder,
        backgroundColor: JournalTheme.cardBackground,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          paddingHorizontal: compact ? 12 : 14,
          paddingVertical: compact ? 8 : 10,
          borderBottomWidth: 1,
          borderBottomColor: JournalTheme.coverRule,
          backgroundColor: 'rgba(215, 180, 141, 0.12)',
        }}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: JournalTheme.coverMastheadInk,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: 10, color: JournalTheme.coverSpecLabel, marginTop: 3 }}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={{ padding: compact ? 10 : 12, gap: compact ? 6 : 8 }}>{children}</View>
    </View>
  );
}

export function LedgerRowLine({ label, value, compact }: LedgerRowProps & { compact?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
      <Text
        style={{
          fontSize: compact ? 10 : 11,
          color: JournalTheme.coverSpecLabel,
          flexShrink: 0,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View
        style={{
          flex: 1,
          borderBottomWidth: 1,
          borderStyle: 'dotted',
          borderBottomColor: JournalTheme.coverRule,
          marginBottom: 3,
          minWidth: 12,
        }}
      />
      <Text
        style={{
          fontSize: compact ? 11 : 12,
          color: JournalTheme.bodyInk,
          fontWeight: '600',
          flexShrink: 1,
          textAlign: 'right',
          maxWidth: '52%',
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
