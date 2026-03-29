import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Image,
    ScrollView,
    View
} from 'react-native';
import type { Piece } from '../../../types/pieces';
import { type PricingSaleMode } from '../../../types/pricing';
import { ArtifactTile } from '../components/ArtifactTile';
import { DecorativeAsset } from '../components/DecorativeAsset';
import { PaperLabel } from '../components/PaperLabel';
import { BOOK_ART, isConditionStatus } from '../utils/constants';
import { formatDuration } from '../utils/journal';
import { PricingBreakdownCard } from './PricingBreakdownCard';

export function CoverSpread({
    piece,
    totalMs,
    accent,
    compact,
    currencySymbol,
    onChangeSaleMode,
}: {
    piece: Piece;
    totalMs: number;
    accent: string;
    compact: boolean;
    currencySymbol: string;
    onChangeSaleMode: (mode: PricingSaleMode) => void;
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
            </View>
        </ScrollView>
    );
}