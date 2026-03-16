import { Text } from '@/src/components/ui/text';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImagePlus,
  ScrollText,
  X,
} from 'lucide-react-native';
import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { STAGES, STAGE_LABEL, isConditionStatus } from './constants';
import type { Piece, TimelineEntry } from './types';

type EntryDraft = { notes: string; photo?: string };

type JournalSpread =
  | {
      key: string;
      kind: 'cover';
      title: string;
      subtitle: string;
      accent: string;
      tabLabel: string;
    }
  | {
      key: string;
      kind: 'entry';
      index: number;
      stageLabel: string;
      entry: TimelineEntry;
      draft: EntryDraft;
      isLast: boolean;
      durationLabel: string;
      dateLabel: string;
      accent: string;
      tabLabel: string;
    };

const STAGE_ICON_MAP = Object.fromEntries(STAGES.map(s => [s.id, s.Icon]));
const PAGE_ACCENTS = ['#C97752', '#D49F56', '#8FAE70', '#7D99BD', '#C88290', '#9A846B'];

// Swap these optional images with your own parchment, stamps, or illustrations later.
const BOOK_ART = {
  coverIllustration: require('../../../assets/images/pottery-studio.png'),
  pageWatermark: require('../../../assets/images/pottery-wheel.png'),
  memorialStamp: require('../../../assets/images/pottery-memorial.png'),
};

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 24) return hours < 1 ? '< 1h' : `${hours}h`;
  const days = Math.floor(ms / 86_400_000);
  if (days < 14) return `${days} day${days !== 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks !== 1 ? 's' : ''}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function PaperLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: accent,
        transform: [{ rotate: '-2deg' }],
      }}
    >
      <Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-white">{label}</Text>
    </View>
  );
}

function ArtifactTile({
  label,
  value,
  accent,
  compact,
}: {
  label: string;
  value: string;
  accent: string;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        width: compact ? '100%' : '48.5%',
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#DFC6A0',
        backgroundColor: 'rgba(255, 251, 242, 0.9)',
        shadowColor: '#75462f',
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <View style={{ width: 28, height: 3, borderRadius: 999, backgroundColor: accent, marginBottom: 10 }} />
      <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-1">{label}</Text>
      <Text className="text-sm text-foreground leading-5" numberOfLines={3}>{value}</Text>
    </View>
  );
}

function DecorativeAsset({
  source,
  style,
  opacity = 1,
}: {
  source: ImageSourcePropType;
  style: object;
  opacity?: number;
}) {
  return <Image source={source} resizeMode="contain" style={[style, { opacity }]} />;
}

function PhotoSquare({
  photo,
  onPress,
  accent,
  placeholder,
}: {
  photo?: string;
  onPress?: () => void;
  accent: string;
  placeholder: string;
}) {
  const content = photo ? (
    <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
  ) : (
    <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(244, 230, 205, 0.72)' }}>
      <ImagePlus size={24} color={accent} />
      <Text className="text-xs text-center text-muted-foreground mt-3 leading-5">{placeholder}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        aspectRatio: 1,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#DDBD92',
        backgroundColor: '#F5E6CF',
        shadowColor: '#75462f',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      {content}
      <View
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          width: 30,
          height: 30,
          borderRadius: 999,
          backgroundColor: 'rgba(71, 44, 31, 0.72)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Camera size={13} color="white" />
      </View>
    </TouchableOpacity>
  );
}

function NotesCard({
  value,
  onChangeText,
  placeholder,
  compact,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        minHeight: compact ? 180 : 220,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#DFC7A1',
        backgroundColor: 'rgba(255, 250, 242, 0.92)',
        padding: 16,
      }}
    >
      <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-3">
        Studio Notes
      </Text>
      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#97795F"
        style={{
          minHeight: compact ? 126 : 166,
          fontFamily: 'DMSans_400Regular',
          fontSize: 13,
          lineHeight: 22,
          color: '#4B3126',
          textAlignVertical: 'top',
        }}
      />
    </View>
  );
}

function BookTabs({
  spreads,
  activePage,
  onPress,
  compact,
}: {
  spreads: JournalSpread[];
  activePage: number;
  onPress: (index: number) => void;
  compact?: boolean;
}) {
  if (compact) return null;

  return (
    <View style={{ position: 'absolute', right: -10, top: 34, gap: 10 }}>
      {spreads.map((spread, index) => {
        const active = index === activePage;
        return (
          <TouchableOpacity
            key={spread.key}
            onPress={() => onPress(index)}
            activeOpacity={0.8}
            style={{
              width: active ? 58 : 44,
              paddingVertical: 10,
              paddingHorizontal: 8,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              backgroundColor: spread.accent,
              shadowColor: '#55301E',
              shadowOpacity: active ? 0.2 : 0.08,
              shadowRadius: active ? 10 : 4,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text className="text-[10px] font-bold text-white text-center" numberOfLines={1}>
              {spread.tabLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CompactPageIndicator({
  activePage,
  totalPages,
  accent,
}: {
  activePage: number;
  totalPages: number;
  accent: string;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 14,
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: 'rgba(87, 57, 41, 0.82)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: accent }} />
      <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-white">
        {activePage + 1} of {totalPages}
      </Text>
    </View>
  );
}

function BinderSpine({ height, compact }: { height: number; compact?: boolean }) {
  if (compact) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 14,
        bottom: 14,
        left: '50%',
        marginLeft: -17,
        width: 34,
        alignItems: 'center',
        justifyContent: 'space-evenly',
      }}
    >
      <LinearGradient
        colors={['rgba(128, 83, 56, 0.88)', 'rgba(99, 63, 42, 0.94)', 'rgba(128, 83, 56, 0.88)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', top: 0, bottom: 0, width: 20, borderRadius: 999 }}
      />
      {Array.from({ length: Math.max(4, Math.round(height / 120)) }).map((_, index) => (
        <View
          key={index}
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            borderWidth: 3,
            borderColor: '#6D442F',
            backgroundColor: '#F0DBC0',
          }}
        />
      ))}
    </View>
  );
}

function CoverSpread({
  piece,
  totalMs,
  accent,
  compact,
}: {
  piece: Piece;
  totalMs: number;
  accent: string;
  compact: boolean;
}) {
  const heroImage = piece.photo ?? piece.imgUrl;
  const summaryTiles = [
    { label: 'Clay Body', value: piece.clay },
    piece.form ? { label: 'Form', value: piece.form } : null,
    piece.formingMethod ? { label: 'Method', value: piece.formingMethod } : null,
    piece.location ? { label: 'Location', value: piece.location } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: compact ? 14 : 18, paddingBottom: compact ? 80 : 28 }}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: compact ? 10 : 14, alignItems: 'flex-start' }}>
        <PaperLabel label="Workshop Ledger" accent={accent} />
        <Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted-foreground mt-1">
          Page 1
        </Text>
      </View>

      <View style={{ flexDirection: compact ? 'column' : 'row', gap: 14 }}>
        <View style={{ flex: 1, gap: 12 }}>
          <View
            style={{
              borderRadius: 28,
              overflow: 'hidden',
              backgroundColor: '#F2DFC1',
              borderWidth: 1,
              borderColor: '#D6B38A',
              minHeight: compact ? 220 : 280,
            }}
          >
            {heroImage ? (
              <Image source={{ uri: heroImage }} style={{ width: '100%', height: compact ? 220 : 280 }} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['#F5E7D1', '#E7C9A4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: compact ? 220 : 280, alignItems: 'center', justifyContent: 'center' }}
              >
                <DecorativeAsset source={BOOK_ART.coverIllustration} style={{ width: 140, height: 140 }} opacity={0.85} />
                <Text className="text-xs text-muted-foreground mt-3">Drop in a custom cover illustration later</Text>
              </LinearGradient>
            )}
            <View
              style={{
                position: 'absolute',
                left: 16,
                top: 16,
                paddingHorizontal: 12,
                paddingVertical: 7,
                backgroundColor: 'rgba(255, 247, 236, 0.88)',
                borderRadius: 16,
                transform: [{ rotate: '-3deg' }],
              }}
            >
              <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-foreground">
                Feature Snapshot
              </Text>
            </View>
          </View>

          <View
            style={{
              borderRadius: 22,
              backgroundColor: 'rgba(255, 249, 239, 0.88)',
              borderWidth: 1,
              borderColor: '#DCC19D',
              padding: 14,
            }}
          >
            <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2">
              Archive Note
            </Text>
            <Text className="text-sm leading-6 text-foreground">
              {piece.notes || 'Reserve this panel for a hand-drawn sketch, glaze card, or a stamped studio note.'}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, gap: 12 }}>
          <View
            style={{
              borderRadius: 28,
              backgroundColor: 'rgba(255, 250, 242, 0.92)',
              borderWidth: 1,
              borderColor: '#DCC19D',
              overflow: 'hidden',
              padding: 18,
              minHeight: 280,
            }}
          >
            <DecorativeAsset
              source={BOOK_ART.pageWatermark}
              style={{ position: 'absolute', right: -18, bottom: -8, width: 140, height: 140 }}
              opacity={0.08}
            />
            <Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted-foreground mb-2">
              Piece Record
            </Text>
            <Text className="font-serif text-foreground mb-2" style={{ fontSize: compact ? 24 : 30, lineHeight: compact ? 30 : 36 }}>
              {piece.name}
            </Text>
            <Text className="text-sm text-muted-foreground leading-6 mb-4">
              {piece.clay} · {formatDuration(totalMs)} in the making
            </Text>
            {piece.status ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 999,
                  marginBottom: 14,
                  backgroundColor: isConditionStatus(piece.status) ? 'rgba(173, 61, 48, 0.12)' : 'rgba(112, 144, 88, 0.14)',
                }}
              >
                <Text style={{ color: isConditionStatus(piece.status) ? '#A74234' : '#648448', fontSize: 11, fontFamily: 'DMSans_500Medium' }}>
                  {piece.status}
                </Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {summaryTiles.map(tile => (
                <ArtifactTile key={tile.label} label={tile.label} value={tile.value} accent={accent} compact={compact} />
              ))}
            </View>
          </View>

          {piece.stage === 'cemetery' ? (
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#DCC19D',
                backgroundColor: 'rgba(255, 249, 240, 0.95)',
                padding: 16,
              }}
            >
              <DecorativeAsset
                source={BOOK_ART.memorialStamp}
                style={{ position: 'absolute', right: -4, top: -8, width: 90, height: 90 }}
                opacity={0.18}
              />
              <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2">
                Memorial Entry
              </Text>
              <Text className="text-sm font-serif italic text-foreground leading-6 mb-3">
                {piece.epitaph || 'Waiting for the final inscription.'}
              </Text>
              <Text className="text-sm text-muted-foreground leading-6">
                {piece.causeOfDeath || 'Cause of death not yet recorded in the ledger.'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

function EntrySpread({
  entry,
  draft,
  index,
  stageLabel,
  isLast,
  accent,
  durationLabel,
  dateLabel,
  totalEntries,
  onPickPhoto,
  onChangeNotes,
  compact,
}: {
  entry: TimelineEntry;
  draft: EntryDraft;
  index: number;
  stageLabel: string;
  isLast: boolean;
  accent: string;
  durationLabel: string;
  dateLabel: string;
  totalEntries: number;
  onPickPhoto: () => void;
  onChangeNotes: (value: string) => void;
  compact: boolean;
}) {
  const Icon = STAGE_ICON_MAP[entry.stage] ?? BookOpen;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: compact ? 14 : 18, paddingBottom: compact ? 80 : 28 }}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: compact ? 10 : 14, alignItems: 'flex-start' }}>
        <PaperLabel label={stageLabel} accent={accent} />
        <Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted-foreground mt-1">
          {`Page ${index + 2} / ${totalEntries + 1}`}
        </Text>
      </View>

      <View style={{ flexDirection: compact ? 'column' : 'row', gap: 14 }}>
        <View style={{ flex: 1, gap: 12 }}>
          <View
            style={{
              borderRadius: 26,
              padding: 16,
              borderWidth: 1,
              borderColor: '#D7B48D',
              backgroundColor: 'rgba(255, 250, 243, 0.96)',
            }}
          >
            <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: 16, gap: compact ? 10 : 0 }}>
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    backgroundColor: `${accent}22`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} color={accent} />
                </View>
                <View>
                  <Text className="text-lg font-serif text-foreground">{stageLabel}</Text>
                  <Text className="text-xs text-muted-foreground mt-1">{dateLabel}</Text>
                </View>
              </View>
              <View
                style={{
                  alignSelf: compact ? 'flex-start' : 'auto',
                  paddingHorizontal: 11,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: isLast ? `${accent}20` : 'rgba(124, 96, 69, 0.11)',
                }}
              >
                <Text className="text-[10px] font-bold uppercase tracking-[1.3px]" style={{ color: isLast ? accent : '#7F6450' }}>
                  {isLast ? `${durationLabel} ongoing` : durationLabel}
                </Text>
              </View>
            </View>

            <PhotoSquare
              photo={draft.photo}
              onPress={onPickPhoto}
              accent={accent}
              placeholder="Tap to place a stage photo or future illustrated stamp."
            />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <ArtifactTile label="Stage Number" value={`${index + 1}`} accent={accent} compact={compact} />
            <ArtifactTile label="Stage Date" value={dateLabel} accent={accent} compact={compact} />
            <ArtifactTile label="Time Here" value={durationLabel} accent={accent} compact={compact} />
            <ArtifactTile label="Status" value={isLast ? 'Current stage' : 'Archived stage'} accent={accent} compact={compact} />
          </View>
        </View>

        <View style={{ flex: 1, gap: 12 }}>
          <View
            style={{
              borderRadius: 28,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#DCC19D',
              backgroundColor: 'rgba(255, 252, 245, 0.95)',
              minHeight: 330,
            }}
          >
            <LinearGradient
              colors={['rgba(215, 180, 141, 0.26)', 'rgba(255,255,255,0.12)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16, paddingBottom: 8 }}
            >
              <View className="flex-row items-center gap-2 mb-4">
                <ScrollText size={15} color={accent} />
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">Field Notes</Text>
              </View>
              <NotesCard
                value={draft.notes}
                onChangeText={onChangeNotes}
                placeholder="Record trimming decisions, drying surprises, glaze tests, or what you want your future illustrated journal spread to show."
                compact={compact}
              />
            </LinearGradient>
          </View>

          <View
            style={{
              borderRadius: 22,
              padding: 14,
              borderWidth: 1,
              borderColor: '#DCC19D',
              backgroundColor: 'rgba(255, 249, 239, 0.88)',
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Clock3 size={14} color="#8A6A53" />
              <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                Asset Ready Space
              </Text>
            </View>
            <Text className="text-sm text-foreground leading-6">
              Save this right page for stickers, sketches, glaze swatches, or custom illustrated cards later. The layout is already structured for it.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

interface PieceJournalModalProps {
  piece: Piece | null;
  visible: boolean;
  onClose: () => void;
  onUpdateEntry: (
    pieceId: number,
    entryIndex: number,
    patch: { notes?: string; photo?: string }
  ) => void;
}

export function PieceJournalModal({
  piece,
  visible,
  onClose,
  onUpdateEntry,
}: PieceJournalModalProps) {
  const { stages } = useStageConfig();
  const { width, height } = useWindowDimensions();
  const isCompact = width < 430;
  const shellPadding = isCompact ? 10 : 14;
  const pageInset = isCompact ? 20 : 28;
  const [drafts, setDrafts] = React.useState<EntryDraft[]>([]);
  const [activePage, setActivePage] = React.useState(0);
  const pageScrollRef = React.useRef<ScrollViewType>(null);

  React.useEffect(() => {
    if (visible && piece) {
      setDrafts(piece.timeline.map(entry => ({ notes: entry.notes ?? '', photo: entry.photo })));
      setActivePage(0);
      requestAnimationFrame(() => pageScrollRef.current?.scrollTo({ x: 0, animated: false }));
    }
  }, [piece, visible]);

  const totalMs = piece ? Date.now() - new Date(piece.createdAt).getTime() : 0;
  const bookWidth = Math.min(width - (isCompact ? 10 : 18), 940);
  const bookHeight = Math.min(height * (isCompact ? 0.84 : 0.8), 760);
  const pageWidth = bookWidth - pageInset;

  const stageLabelById = React.useMemo(() => {
    const labels: Record<string, string> = {};
    for (const stage of stages) {
      labels[stage.id] = stage.label;
    }
    return labels;
  }, [stages]);

  const spreads = React.useMemo<JournalSpread[]>(() => {
    if (!piece) return [];

    const coverAccent = PAGE_ACCENTS[0];
    const timelineSpreads = piece.timeline.map((entry, index) => {
      const nextTs = piece.timeline[index + 1]?.timestamp;
      const durationMs = nextTs
        ? new Date(nextTs).getTime() - new Date(entry.timestamp).getTime()
        : Date.now() - new Date(entry.timestamp).getTime();
      const stageLabel = stageLabelById[entry.stage] ?? STAGE_LABEL[entry.stage] ?? entry.stage;

      return {
        key: `entry-${index}-${entry.timestamp}`,
        kind: 'entry' as const,
        index,
        stageLabel,
        entry,
        draft: drafts[index] ?? { notes: entry.notes ?? '', photo: entry.photo },
        isLast: index === piece.timeline.length - 1,
        durationLabel: formatDuration(durationMs),
        dateLabel: formatDate(entry.timestamp),
        accent: PAGE_ACCENTS[(index + 1) % PAGE_ACCENTS.length],
        tabLabel: `${index + 1}`,
      };
    });

    return [
      {
        key: `cover-${piece.id}`,
        kind: 'cover',
        title: piece.name,
        subtitle: `${piece.clay} · ${formatDuration(totalMs)} in the making`,
        accent: coverAccent,
        tabLabel: 'Cover',
      },
      ...timelineSpreads,
    ];
  }, [drafts, piece, stageLabelById, totalMs]);

  const activeSpread = spreads[activePage] ?? spreads[0];
  const activeSubtitle = activeSpread?.kind === 'cover'
    ? activeSpread.subtitle
    : piece
    ? `${piece.clay} · ${formatDuration(totalMs)} in the making`
    : '';

  const updateNotes = (index: number, notes: string) => {
    if (!piece) return;
    setDrafts(prev => {
      const next = [...prev];
      next[index] = { ...next[index], notes };
      return next;
    });
    onUpdateEntry(piece.id, index, { notes });
  };

  const pickPhoto = async (index: number) => {
    if (!piece) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setDrafts(prev => {
          const next = [...prev];
          next[index] = { ...next[index], photo: uri };
          return next;
        });
        onUpdateEntry(piece.id, index, { photo: uri });
      }
    } catch {}
  };

  const goToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(index, spreads.length - 1));
    setActivePage(clamped);
    pageScrollRef.current?.scrollTo({ x: clamped * pageWidth, animated: true });
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActivePage(nextPage);
  };

  if (!piece) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose} statusBarTranslucent>
      <LinearGradient
        colors={['#2D221C', '#4C3226', '#6C4433']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingTop: isCompact ? 48 : 54, paddingHorizontal: isCompact ? 10 : 14, paddingBottom: 18 }}>
          <View className="flex-row items-center justify-between mb-4 px-2">
            <View className="flex-row items-center gap-3 flex-1 pr-3">
              <View className="rounded-full items-center justify-center" style={{ width: isCompact ? 36 : 40, height: isCompact ? 36 : 40, backgroundColor: 'rgba(255, 244, 228, 0.12)' }}>
                <BookOpen size={isCompact ? 16 : 18} color="#F4DFC0" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-white/70 mb-1">
                  Artisan Journal
                </Text>
                <Text className="font-serif text-white" style={{ fontSize: isCompact ? 21 : 24 }} numberOfLines={1}>{piece.name}</Text>
                {!isCompact ? <Text className="text-sm text-white/72 mt-1" numberOfLines={1}>{activeSubtitle}</Text> : null}
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityLabel="Close journal"
              style={{
                width: isCompact ? 38 : 42,
                height: isCompact ? 38 : 42,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 244, 228, 0.12)',
              }}
            >
              <X size={20} color="#F4DFC0" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View
              style={{
                width: bookWidth,
                height: bookHeight,
                alignSelf: 'center',
                borderRadius: isCompact ? 28 : 34,
                backgroundColor: '#7B5039',
                padding: shellPadding,
                shadowColor: '#160E0A',
                shadowOpacity: 0.28,
                shadowRadius: 22,
                shadowOffset: { width: 0, height: 16 },
              }}
            >
              <LinearGradient
                colors={['#8F5E44', '#6F4431']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: isCompact ? 28 : 34 }}
              />

              <View
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  borderRadius: isCompact ? 22 : 26,
                  backgroundColor: '#F3E4CB',
                  borderWidth: 1,
                  borderColor: '#B78262',
                }}
              >
                <ScrollView
                  ref={pageScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  bounces={false}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={handleMomentumEnd}
                  keyboardDismissMode="interactive"
                >
                  {spreads.map((spread) => {
                    return (
                      <View key={spread.key} style={{ width: pageWidth, flex: 1 }}>
                        {spread.kind === 'cover' ? (
                          <CoverSpread piece={piece} totalMs={totalMs} accent={spread.accent} compact={isCompact} />
                        ) : (
                          <EntrySpread
                            entry={spread.entry}
                            draft={spread.draft}
                            index={spread.index}
                            stageLabel={spread.stageLabel}
                            isLast={spread.isLast}
                            accent={spread.accent}
                            durationLabel={spread.durationLabel}
                            dateLabel={spread.dateLabel}
                            totalEntries={piece.timeline.length}
                            onPickPhoto={() => pickPhoto(spread.index)}
                            onChangeNotes={(value) => updateNotes(spread.index, value)}
                            compact={isCompact}
                          />
                        )}
                      </View>
                    );
                  })}
                </ScrollView>

                <BinderSpine height={bookHeight} compact={isCompact} />

                <View style={isCompact ? { position: 'absolute', left: 12, bottom: 14 } : { position: 'absolute', left: 12, top: '50%', marginTop: -22 }}>
                  <TouchableOpacity
                    onPress={() => goToPage(activePage - 1)}
                    disabled={activePage === 0}
                    activeOpacity={0.8}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: activePage === 0 ? 'rgba(120, 95, 76, 0.2)' : 'rgba(92, 60, 43, 0.82)',
                    }}
                  >
                    <ChevronLeft size={isCompact ? 16 : 18} color={activePage === 0 ? '#B89A82' : '#FFF5E7'} />
                  </TouchableOpacity>
                </View>

                <View style={isCompact ? { position: 'absolute', right: 12, bottom: 14 } : { position: 'absolute', right: 12, top: '50%', marginTop: -22 }}>
                  <TouchableOpacity
                    onPress={() => goToPage(activePage + 1)}
                    disabled={activePage === spreads.length - 1}
                    activeOpacity={0.8}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: activePage === spreads.length - 1 ? 'rgba(120, 95, 76, 0.2)' : 'rgba(92, 60, 43, 0.82)',
                    }}
                  >
                    <ChevronRight size={isCompact ? 16 : 18} color={activePage === spreads.length - 1 ? '#B89A82' : '#FFF5E7'} />
                  </TouchableOpacity>
                </View>

                <BookTabs spreads={spreads} activePage={activePage} onPress={goToPage} compact={isCompact} />
                {isCompact && spreads.length > 0 ? (
                  <CompactPageIndicator
                    activePage={activePage}
                    totalPages={spreads.length}
                    accent={activeSpread?.accent ?? PAGE_ACCENTS[0]}
                  />
                ) : null}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </Modal>
  );
}
