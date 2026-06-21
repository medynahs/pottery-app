import { KeyboardFormScrollView } from '@/src/components/ui/keyboard-form-scroll-view';
import { useKeyboardBottomOffset } from '@/src/hooks/useKeyboardBottomOffset';
import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import React from 'react';
import { Image, View } from 'react-native';
import type { Piece } from '../../../types/pieces';
import { type PricingSaleMode } from '../../../types/pricing';
import { BOOK_ART } from '../utils/constants';
import {
    buildEconomicsRows,
    buildRegistryRows,
    buildSpecimenRows,
} from '../utils/coverLedgerData';
import { formatDuration } from '../utils/journal';
import { JournalTheme } from '../utils/journalTheme';
import { JournalInlineNotes } from './JournalInlineNotes';
import { JournalSpreadMasthead } from './JournalSpreadMasthead';
import { CollapsibleLedgerSection, LedgerRowLine } from './LedgerBlocks';
import { PolaroidPhotoPicker } from './PolaroidPhotoPicker';
import { PricingBreakdownCard } from './PricingBreakdownCard';
import { PieceGlazeLinkSection } from './PieceGlazeLinkSection';

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
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
  const descDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setDescription(piece.description || '');
  }, [piece.id, piece.description]);

  const handleDescriptionChange = React.useCallback((text: string) => {
    setDescription(text);
    if (descDebounceRef.current) clearTimeout(descDebounceRef.current);
    descDebounceRef.current = setTimeout(() => onUpdateDescription(text), 500);
  }, [onUpdateDescription]);

  const keyboardBottomOffset = useKeyboardBottomOffset({ extra: 24 });
  const registryRows = React.useMemo(() => buildRegistryRows(piece, totalMs, currencySymbol), [piece, totalMs, currencySymbol]);
  const specimenRows = React.useMemo(() => buildSpecimenRows(piece), [piece]);
  const economicsRows = React.useMemo(() => buildEconomicsRows(piece, currencySymbol), [piece, currencySymbol]);

  const heroImage = piece.photo ?? piece.imgUrl;
  const polaroidStartDate = piece.createdAt ? formatShortDate(piece.createdAt) : '';
  const polaroidLabel = piece.stage === 'cemetery'
    ? `Archive ${polaroidStartDate}`
    : (polaroidStartDate ? `Fig. 1 · ${polaroidStartDate}` : 'Fig. 1 · Add photograph');

  const polaroidWidth = compact ? 280 : 320;
  const polaroidHeight = compact ? 210 : 236;
  const currentStageLabel = piece.stage.replace(/-/g, ' ');

  return (
    <KeyboardFormScrollView
      bottomOffset={keyboardBottomOffset}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: compact ? 10 : 14, paddingBottom: compact ? 48 : 40 }}
      keyboardShouldPersistTaps="handled"
    >
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

      <JournalSpreadMasthead
        compact={compact}
        rightLabel={`Vol. I · Sheet ${String(piece.timeline.length).padStart(2, '0')}`}
      />

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
          {piece.clay} · {formatDuration(totalMs)} recorded · Currently {currentStageLabel}
        </Text>
      </View>

      <JournalInlineNotes
        title="Artist's notes"
        value={description}
        placeholder="Origin story, glaze experiments, lessons learned, or what you'd tell your future self about this piece."
        onChangeText={handleDescriptionChange}
        compact={compact}
        emptyPrompt="Start with why you made this piece, or what you're hoping it becomes."
      />

      <View style={{ marginTop: 14, gap: 12 }}>
        <CollapsibleLedgerSection title="Registry" subtitle="Identification and studio record" compact={compact}>
          {registryRows.map((row) => (
            <LedgerRowLine key={row.label} {...row} compact={compact} />
          ))}
        </CollapsibleLedgerSection>

        <CollapsibleLedgerSection title="Specimen details" subtitle="Physical characteristics and process" compact={compact}>
          {specimenRows.map((row) => (
            <LedgerRowLine key={row.label} {...row} compact={compact} />
          ))}
        </CollapsibleLedgerSection>

        <PieceGlazeLinkSection piece={piece} compact={compact} />

        {(piece.stage === 'finished' || economicsRows.some((row) => row.value !== '—')) ? (
          <CollapsibleLedgerSection title="Studio economics" subtitle="Costs, fees, and pricing targets" compact={compact}>
            {economicsRows.map((row) => (
              <LedgerRowLine key={row.label} {...row} compact={compact} />
            ))}
          </CollapsibleLedgerSection>
        ) : null}

        {piece.stage === 'cemetery' ? (
          <CoverMemorialBlock epitaph={piece.epitaph} causeOfDeath={piece.causeOfDeath} compact={compact} />
        ) : null}

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
          Swipe or use the tabs above →
        </Text>
      </View>
    </KeyboardFormScrollView>
  );
}
