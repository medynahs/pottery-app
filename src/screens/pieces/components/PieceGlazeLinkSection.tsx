import { Text } from '@/src/components/ui/text';
import type { Piece } from '@/src/types/pieces';
import { useVisibleGlazes } from '@/src/store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { resolvePieceGlazeJournalLink } from '../utils/pieceGlazeJournalLink';
import { JournalTheme } from '../utils/journalTheme';
import { LedgerSection } from './LedgerBlocks';

export function PieceGlazeLinkSection({
  piece,
  compact,
}: {
  piece: Piece;
  compact?: boolean;
}) {
  const router = useRouter();
  const glazes = useVisibleGlazes();
  const link = React.useMemo(
    () => resolvePieceGlazeJournalLink(piece, glazes),
    [piece, glazes],
  );

  if (!link) return null;

  return (
    <LedgerSection
      title="Studio glaze"
      subtitle="Linked batch from Glaze Atlas"
      compact={compact}
    >
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => router.push(`/glaze/${link.glazeId}` as never)}
        accessibilityRole="button"
        accessibilityLabel={`Open glaze batch ${link.name}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: compact ? 10 : 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: JournalTheme.tileBorder,
          backgroundColor: JournalTheme.tileBackground,
        }}
      >
        {link.photoUri ? (
          <Image
            source={{ uri: link.photoUri }}
            style={{ width: 52, height: 52, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              backgroundColor: '#F5E6CC',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🫙</Text>
          </View>
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: compact ? 13 : 14,
              fontWeight: '600',
              color: JournalTheme.bodyInk,
              fontFamily: 'Fraunces_600SemiBold',
            }}
          >
            {link.name}
          </Text>
          {link.batchId ? (
            <Text
              numberOfLines={1}
              style={{ fontSize: 11, color: JournalTheme.coverSpecLabel, marginTop: 2 }}
            >
              {link.batchId}
            </Text>
          ) : null}
          {link.outcomeLabel ? (
            <Text
              numberOfLines={1}
              style={{ fontSize: 11, color: JournalTheme.coverMastheadInk, marginTop: 4, fontWeight: '600' }}
            >
              Outcome · {link.outcomeLabel}
            </Text>
          ) : (
            <Text style={{ fontSize: 11, color: JournalTheme.coverSpecLabel, marginTop: 4 }}>
              Tap to open batch details
            </Text>
          )}
        </View>

        <ChevronRight size={16} color={JournalTheme.coverSpecLabel} />
      </TouchableOpacity>
    </LedgerSection>
  );
}
