import { Text } from '@/src/components/ui/text';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
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

export function CollapsibleLedgerSection({
  title,
  subtitle,
  children,
  compact,
  defaultExpanded = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  compact?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

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
      <TouchableOpacity
        onPress={() => setExpanded((current) => !current)}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: compact ? 12 : 14,
          paddingVertical: compact ? 10 : 12,
          backgroundColor: 'rgba(215, 180, 141, 0.12)',
          borderBottomWidth: expanded ? 1 : 0,
          borderBottomColor: JournalTheme.coverRule,
        }}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
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
        {expanded ? (
          <ChevronUp size={16} color={JournalTheme.coverSpecLabel} />
        ) : (
          <ChevronDown size={16} color={JournalTheme.coverSpecLabel} />
        )}
      </TouchableOpacity>
      {expanded ? (
        <View style={{ padding: compact ? 10 : 12, gap: compact ? 6 : 8 }}>{children}</View>
      ) : null}
    </View>
  );
}

export function LedgerRowLine({
  label,
  value,
  compact,
  emphasize,
}: LedgerRowProps & { compact?: boolean; emphasize?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
      <Text
        style={{
          fontSize: compact ? 10 : 11,
          color: JournalTheme.coverSpecLabel,
          flexShrink: 0,
          fontWeight: emphasize ? '600' : '400',
          letterSpacing: emphasize ? 0.2 : 0,
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
          borderBottomColor: emphasize ? JournalTheme.coverMastheadInk : JournalTheme.coverRule,
          marginBottom: 3,
          minWidth: 12,
          opacity: emphasize ? 0.55 : 1,
        }}
      />
      <Text
        style={{
          fontSize: compact ? 11 : 12,
          color: emphasize ? JournalTheme.titleInk : JournalTheme.bodyInk,
          fontWeight: emphasize ? '700' : '600',
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

/** Stage metadata ledger, dotted rows aligned with cover registry blocks */
export function StageFactsLedger({
  facts,
  compact,
  accent,
  subtitle,
}: {
  facts: { label: string; value: string }[];
  compact?: boolean;
  accent?: string;
  subtitle?: string;
}) {
  if (facts.length === 0) return null;

  return (
    <View
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: JournalTheme.tileBorder,
        backgroundColor: JournalTheme.cardBackground,
        overflow: 'hidden',
        borderLeftWidth: accent ? 3 : 1,
        borderLeftColor: accent ?? JournalTheme.tileBorder,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
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
            flexShrink: 1,
          }}
        >
          Stage record
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontSize: 10,
              color: JournalTheme.coverSpecLabel,
              flexShrink: 1,
              textAlign: 'right',
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={{ padding: compact ? 10 : 12, gap: compact ? 7 : 9 }}>
        {facts.map((fact, index) => (
          <LedgerRowLine
            key={fact.label}
            label={fact.label}
            value={fact.value}
            compact={compact}
            emphasize={index < 2}
          />
        ))}
      </View>
    </View>
  );
}
