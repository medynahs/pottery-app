import { Text } from '@/src/components/ui/text';
import React from 'react';
import {
    ScrollView,
    View
} from 'react-native';
import type { Piece } from '../../../types/pieces';
import { type PricingSaleMode } from '../../../types/pricing';
import { PaperLabel } from '../components/PaperLabel';
import { formatDuration } from '../utils/journal';
import { NotesCard } from './NotesCard';
import { PolaroidPhotoPicker } from './PolaroidPhotoPicker';
import { PricingBreakdownCard } from './PricingBreakdownCard';


function formatShortDate(value: string) {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
    });
}

export function CoverSpread({
    piece,
    totalMs,
    accent,
    compact,
    currencySymbol,
    onChangeSaleMode,
    onPickPhoto,
}: {
    piece: Piece;
    totalMs: number;
    accent: string;
    compact: boolean;
    currencySymbol: string;
    onChangeSaleMode: (mode: PricingSaleMode) => void;
    onPickPhoto: () => void;
}) {
    const [description, setDescription] = React.useState(piece.description || '');

    const heroImage = piece.photo ?? piece.imgUrl;
    // Add simple icons for each tile
    const summaryTiles = [
        { label: 'Clay Body', value: piece.clay, icon: '🏺' },
        { label: 'Time Spent', value: formatDuration(totalMs), icon: '⏳' },
        { label: 'Form', value: piece.form || 'Unknown', icon: '🌀' },
        { label: 'Method', value: piece.formingMethod || 'Unknown', icon: '🛠️' },
        { label: 'Location', value: piece.location || 'Unknown', icon: '📍' },
        { label: 'Dimensions', value: piece.dimensions || 'Unknown', icon: '📏' },
        { label: 'Weight', value: piece.weight || 'Unknown', icon: '⚖️' },
        { label: 'Firing Fee', value: piece.firingFee || 'Unknown', icon: '💸' },
        { label: 'Glaze Temp', value: piece.glazeTemp || 'Unknown', icon: '🌡️' },
    ].filter(Boolean) as { label: string; value: string; icon: string }[];
    const polaroidStartDate = piece.createdAt ? formatShortDate(piece.createdAt) : '';
    const polaroidCemeteryDate = piece.stage === 'cemetery' && piece.updatedAt ? formatShortDate(piece.updatedAt) : undefined;
    const polaroidEpitaph = piece.stage === 'cemetery' ? (piece.epitaph || 'In memory') : undefined;
    const polaroidLabel = piece.stage === 'cemetery'
        ? `🪦 ${polaroidStartDate}${polaroidCemeteryDate ? ' – ' + polaroidCemeteryDate : ''} • ${polaroidEpitaph}`
        : (polaroidStartDate ? `Born in ${polaroidStartDate}` : undefined);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: compact ? 14 : 18, paddingBottom: compact ? 80 : 28 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: compact ? 10 : 14, alignItems: 'flex-start' }}>
                <PaperLabel label="Workshop Ledger" accent={accent} />
            </View>

            <View style={{ flexDirection: compact ? 'column' : 'row', gap: 14 }}>
                <View style={{ flex: 1, gap: 12, justifyContent: 'center', alignItems: 'flex-start', position: 'relative' }}>
                    <View>
                        {/* Main brown text */}
                        <Text
                            className="font-serif text-foreground"
                            style={{
                                fontSize: compact ? 32 : 44,
                                fontWeight: 'bold',
                                letterSpacing: 1,
                                color: '#9C4929',
                                marginBottom: -8,
                            }}
                            numberOfLines={2}
                            pointerEvents="none"
                        >
                            {piece.name}
                        </Text>
                    </View>
                </View>
                <PolaroidPhotoPicker
                    photo={heroImage}
                    label={polaroidLabel}
                    width={310}
                    height={compact ? 180 : 240}
                    onPress={onPickPhoto}
                    borderRadius={12}
                    rotation="-4deg"
                    style={{ alignSelf: 'flex-end', marginRight: compact ? 15 : -32 }}
                    children={piece.stage === 'cemetery' ? (
                        <View style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.18,
                            zIndex: 10,
                        }}>
                            <Text style={{ fontSize: 80 }}>🪦</Text>
                        </View>
                    ) : null}
                />
                <View style={{ flex: 1, gap: 12, justifyContent: 'center', alignItems: 'flex-start', maxHeight: 130 }}>
                    <NotesCard
                        onChangeText={setDescription}
                        value={description}
                        title='Description'
                        placeholder='Add a description for your piece! What was the inspiration for it? Or your favorite part to make?'
                        accent={accent}
                    />
                </View>

                <View style={{ flex: 1, gap: 12, marginTop: compact ? 6 : 0 }}>
                    <View>
                        {/* Split summaryTiles into rows of 3 */}
                        {Array.from({ length: Math.ceil(summaryTiles.length / 3) }).map((_, rowIdx) => (
                            <View key={rowIdx} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
                                {summaryTiles.slice(rowIdx * 3, rowIdx * 3 + 3).map((tile, i) => (
                                    <View
                                        key={tile.label}
                                        style={{
                                            flex: 1,
                                            maxWidth: 120,
                                            marginRight: i < 2 ? 12 : 0,
                                            backgroundColor: 'rgba(255,251,242,0.93)',
                                            borderRadius: 14,
                                            borderWidth: 1,
                                            borderColor: '#DFC6A0',
                                            padding: 10,
                                            alignItems: 'center',
                                            shadowColor: '#75462f',
                                            shadowOpacity: 0.07,
                                            shadowRadius: 8,
                                            shadowOffset: { width: 0, height: 4 },
                                        }}
                                    >
                                        <Text style={{ fontSize: 22, marginBottom: 2 }}>{tile.icon}</Text>
                                        <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-1" style={{ textAlign: 'center' }}>{tile.label}</Text>
                                        <Text className="text-sm text-foreground leading-5" style={{ textAlign: 'center' }} numberOfLines={3}>{tile.value}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>

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