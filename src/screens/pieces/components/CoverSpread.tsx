import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import type { Piece } from '../../../types/pieces';
import { type PricingSaleMode } from '../../../types/pricing';
import { BOOK_ART } from '../utils/constants';
import {
    buildEconomicsRows,
    buildJourneyStages,
    buildRegistryRows,
    buildSpecimenRows,
} from '../utils/coverLedgerData';
import { formatDuration } from '../utils/journal';
import { JournalTheme } from '../utils/journalTheme';
import { JournalNotePreview, JournalNotesSheet } from './JournalNotesSheet';
import { JournalSpreadMasthead } from './JournalSpreadMasthead';
import { LedgerRowLine, LedgerSection } from './LedgerBlocks';
import { PolaroidPhotoPicker } from './PolaroidPhotoPicker';
import { PricingBreakdownCard } from './PricingBreakdownCard';
import { PieceGlazeLinkSection } from './PieceGlazeLinkSection';

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function JourneyLog({
  stages,
  compact,
}: {
  stages: ReturnType<typeof buildJourneyStages>;
  compact?: boolean;
}) {
  if (stages.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      {stages.map((entry, index) => (
        <View key={`${entry.stage}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: JournalTheme.tileBorder,
              backgroundColor: JournalTheme.tileBackground,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: '700', color: JournalTheme.coverMastheadInk }}>
              {index + 1}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: compact ? 11 : 12, fontWeight: '600', color: JournalTheme.bodyInk }}>
              {entry.label}
            </Text>
            <Text style={{ fontSize: 10, color: JournalTheme.coverSpecLabel, marginTop: 1 }}>{entry.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function CoverMemorialBlock({
  epitaph,
  causeOfDeath,
  compact,
}: {
  epitaph?: string;
  causeOfDeath?: string;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: JournalTheme.coverMemorialBorder,
        backgroundColor: JournalTheme.coverMemorialBg,
        padding: compact ? 12 : 14,
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', color: JournalTheme.coverMastheadInk }}>
        Memorial record
      </Text>
      {epitaph ? (
        <Text className="font-serif italic text-foreground" style={{ fontSize: compact ? 15 : 17, lineHeight: 24 }}>
          &ldquo;{epitaph}&rdquo;
        </Text>
      ) : null}
      {causeOfDeath ? <Text style={{ fontSize: 11, color: JournalTheme.coverSpecLabel }}>{causeOfDeath}</Text> : null}
    </View>
  );
}

export function CoverSpread({
  piece,
  totalMs,
  accent,
  compact,
  currencySymbol,
  onChangeSaleMode,
  onPickPhoto,
  onUpdateDescription,
}: {
  piece: Piece;
  totalMs: number;
  accent: string;
  compact: boolean;
  currencySymbol: string;
  onChangeSaleMode: (mode: PricingSaleMode) => void;
  onPickPhoto: () => void;
  onUpdateDescription: (description: string) => void;
}) {
  const [description, setDescription] = React.useState(piece.description || '');
  const [notesOpen, setNotesOpen] = React.useState(false);
  const descDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDescriptionChange = React.useCallback((text: string) => {
    setDescription(text);
    if (descDebounceRef.current) clearTimeout(descDebounceRef.current);
    descDebounceRef.current = setTimeout(() => onUpdateDescription(text), 500);
  }, [onUpdateDescription]);

  const registryRows = React.useMemo(() => buildRegistryRows(piece, totalMs, currencySymbol), [piece, totalMs, currencySymbol]);
  const specimenRows = React.useMemo(() => buildSpecimenRows(piece), [piece]);
  const economicsRows = React.useMemo(() => buildEconomicsRows(piece, currencySymbol), [piece, currencySymbol]);
  const journeyStages = React.useMemo(() => buildJourneyStages(piece), [piece]);

  const heroImage = piece.photo ?? piece.imgUrl;
  const polaroidStartDate = piece.createdAt ? formatShortDate(piece.createdAt) : '';
  const polaroidLabel = piece.stage === 'cemetery'
    ? `Archive ${polaroidStartDate}`
    : (polaroidStartDate ? `Fig. 1 · ${polaroidStartDate}` : 'Fig. 1 · Add photograph');

  const polaroidWidth = compact ? 280 : 320;
  const polaroidHeight = compact ? 210 : 236;

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: compact ? 10 : 14, paddingBottom: compact ? 72 : 22 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {/* Page watermark */}
        <Image
          source={BOOK_ART.pageWatermark}
          style={{
            position: 'absolute',
            right: compact ? -20 : -10,
            top: 120,
            width: compact ? 140 : 180,
            height: compact ? 140 : 180,
            opacity: 0.045,
          }}
          resizeMode="contain"
        />

        {/* Masthead */}
        <JournalSpreadMasthead
          compact={compact}
          rightLabel={`Vol. I · Sheet ${String(piece.timeline.length).padStart(2, '0')}`}
        />

        {/* Hero photograph — top, full width */}
        <View style={{ alignItems: 'center', marginTop: 14, marginBottom: 16 }}>
          <PolaroidPhotoPicker
            photo={heroImage}
            label={polaroidLabel}
            width={polaroidWidth}
            height={polaroidHeight}
            onPress={onPickPhoto}
            borderRadius={12}
            rotation={piece.stage === 'cemetery' ? '0deg' : '-1.5deg'}
            accent={accent}
            style={{ alignSelf: 'center' }}
          >
            {piece.stage === 'cemetery' ? (
              <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(40, 28, 22, 0.1)' }}>
                <Text style={{ fontSize: compact ? 56 : 64, opacity: 0.3 }}>🪦</Text>
              </View>
            ) : null}
          </PolaroidPhotoPicker>
          <Text style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: JournalTheme.coverSpecLabel, marginTop: 10, textAlign: 'center' }}>
            Primary specimen photograph
          </Text>
        </View>

        {/* Title plate */}
        <View style={{ gap: 8, marginBottom: 14, alignItems: compact ? 'center' : 'flex-start' }}>
          <Text
            style={{
              fontFamily: 'Fraunces_700Bold',
              fontSize: compact ? 32 : 38,
              lineHeight: compact ? 36 : 44,
              color: JournalTheme.coverTitleColor,
              fontStyle: 'italic',
              textAlign: compact ? 'center' : 'left',
              maxWidth: '100%',
            }}
            numberOfLines={3}
          >
            {piece.name}
          </Text>
          <Text
            style={{
              fontSize: compact ? 11 : 12,
              lineHeight: 18,
              color: JournalTheme.coverSpecLabel,
              textAlign: compact ? 'center' : 'left',
              letterSpacing: 0.3,
            }}
          >
            {piece.clay} · {formatDuration(totalMs)} recorded · {piece.timeline.length} journal entries
          </Text>
        </View>

        <LedgerSection title="Registry" compact={compact}>
          {registryRows.map((row) => (
            <LedgerRowLine key={row.label} {...row} compact={compact} />
          ))}
        </LedgerSection>

        {/* Detailed ledger sections */}
        <View style={{ marginTop: 14, gap: 12 }}>
          <LedgerSection title="Specimen details" subtitle="Physical characteristics & process" compact={compact}>
            {specimenRows.map((row) => (
              <LedgerRowLine key={row.label} {...row} compact={compact} />
            ))}
          </LedgerSection>

          <PieceGlazeLinkSection piece={piece} compact={compact} />

          <LedgerSection title="Studio economics" subtitle="Costs, fees, and pricing targets" compact={compact}>
            {economicsRows.map((row) => (
              <LedgerRowLine key={row.label} {...row} compact={compact} />
            ))}
          </LedgerSection>

          <LedgerSection
            title="Journey log"
            subtitle={`${journeyStages.length} recorded stage${journeyStages.length === 1 ? '' : 's'}`}
            compact={compact}
          >
            <JourneyLog stages={journeyStages} compact={compact} />
          </LedgerSection>

          {piece.stage === 'cemetery' ? (
            <CoverMemorialBlock epitaph={piece.epitaph} causeOfDeath={piece.causeOfDeath} compact={compact} />
          ) : null}

          <JournalNotePreview
            title="Artist's notes"
            value={description}
            placeholder="Origin story, glaze experiments, lessons learned, or what you'd tell your future self about this piece."
            onPress={() => setNotesOpen(true)}
            compact={compact}
          />

          {piece.stage === 'finished' && piece.totalCost != null ? (
            <PricingBreakdownCard
              piece={piece}
              accent={accent}
              compact={compact}
              currencySymbol={currencySymbol}
              onChangeSaleMode={onChangeSaleMode}
            />
          ) : null}
        </View>

        <View style={{ alignItems: 'center', marginTop: 16, opacity: 0.38 }}>
          <Text style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: BrandColors.primaryMuted }}>
            Continue in the stage pages →
          </Text>
        </View>
      </ScrollView>

      <JournalNotesSheet
        visible={notesOpen}
        title="Artist's notes"
        value={description}
        placeholder="Origin story, glaze experiments, lessons learned, or what you'd tell your future self about this piece."
        onChangeText={handleDescriptionChange}
        onClose={() => setNotesOpen(false)}
      />
    </>
  );
}
