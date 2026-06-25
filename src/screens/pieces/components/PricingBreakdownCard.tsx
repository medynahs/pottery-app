import { SelectChip, SelectChipGroup } from '@/src/components/ui/SelectChip';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import {
    TouchableOpacity,
    View
} from 'react-native';
import type { Piece } from '../../../types/pieces';
import { PRICING_USER_TYPE_LABELS, parseNumericInput, type PricingSaleMode } from '../../../types/pricing';
import { PiecePricingAdjustSheet } from '../modals/PiecePricingAdjustSheet';

export function PricingBreakdownCard({
    piece,
    accent,
    compact,
    currencySymbol,
    onChangeSaleMode,
    onUpdatePiece,
}: {
    piece: Piece;
    accent: string;
    compact: boolean;
    currencySymbol: string;
    onChangeSaleMode: (mode: PricingSaleMode) => void;
    onUpdatePiece?: (piece: Piece) => void;
}) {
    const [adjustOpen, setAdjustOpen] = React.useState(false);
    const saleMode = piece.salePriceMode ?? 'retail';
    const retailTarget = piece.retailPriceTarget ?? parseNumericInput(piece.price) ?? piece.suggestedPrice ?? 0;
    const wholesaleTarget = piece.wholesalePriceTarget ?? piece.wholesalePrice ?? 0;
    const activePrice = saleMode === 'wholesale' ? wholesaleTarget : retailTarget;
    const breakdownRows = [
        { label: 'Clay', value: piece.costClay },
        { label: 'Glaze', value: piece.costGlaze },
        { label: 'Extra kiln energy', value: piece.costEnergy },
        { label: 'Other extras', value: piece.costOther },
        { label: 'Firing', value: piece.firingFee },
        { label: 'Making labor', value: piece.laborCost },
        { label: 'Admin labor', value: piece.adminCost },
        { label: 'Overhead', value: piece.overheadCost },
        { label: 'Profit buffer', value: piece.profitAmount },
        { label: 'Selling fees', value: piece.sellingFeeAmount },
        { label: 'Tax', value: piece.taxAmount },
    ].filter((row) => row.value != null);

    const formatMoney = (value?: number | null) => value == null ? '-' : `${currencySymbol}${value.toFixed(2)}`;

    return (
        <View
            style={{
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#DCC19D',
                backgroundColor: 'rgba(255, 250, 242, 0.95)',
                padding: 16,
            }}
        >
            <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2">
                Pricing Ledger
            </Text>
            <Text className="text-sm text-foreground leading-6 mb-3">
                {piece.pricingUserType ? PRICING_USER_TYPE_LABELS[piece.pricingUserType] : 'Custom pricing profile'}
            </Text>

            <SelectChipGroup className="mb-3">
                {([
                    { value: 'retail', label: 'Retail' },
                    { value: 'wholesale', label: 'Wholesale' },
                ] as const).map((option) => (
                    <SelectChip
                        key={option.value}
                        label={option.label}
                        selected={saleMode === option.value}
                        onPress={() => onChangeSaleMode(option.value)}
                        className="flex-1 justify-center"
                    />
                ))}
            </SelectChipGroup>

            <View
                style={{
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: '#DFC6A0',
                    backgroundColor: 'rgba(255, 251, 242, 0.9)',
                    padding: 14,
                    marginBottom: 12,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted-foreground">Active {saleMode} price</Text>
                    <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold', color: accent }}>
                        {formatMoney(activePrice)}
                    </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-xs text-muted-foreground">Retail target</Text>
                    <Text className="text-xs font-medium text-foreground">{formatMoney(retailTarget)}</Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-xs text-muted-foreground">Wholesale target</Text>
                    <Text className="text-xs font-medium text-foreground">{formatMoney(wholesaleTarget)}</Text>
                </View>
            </View>

            {onUpdatePiece ? (
                <TouchableOpacity
                    onPress={() => setAdjustOpen(true)}
                    activeOpacity={0.78}
                    className="mb-3 self-start"
                >
                    <Text className="text-xs font-semibold text-primary">Adjust for this piece</Text>
                </TouchableOpacity>
            ) : null}

            <View style={{ gap: compact ? 7 : 8 }}>
                {breakdownRows.map((row) => (
                    <View key={row.label} className="flex-row items-center justify-between">
                        <Text className="text-xs text-muted-foreground">{row.label}</Text>
                        <Text className="text-xs font-medium text-foreground">{formatMoney(row.value)}</Text>
                    </View>
                ))}
                <View className="h-px bg-border my-1" />
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted-foreground">True cost</Text>
                    <Text className="text-xs font-medium text-foreground">{formatMoney(piece.totalCost)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted-foreground">Suggested retail</Text>
                    <Text className="text-xs font-medium text-foreground">{formatMoney(piece.suggestedPrice)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted-foreground">Wholesale floor</Text>
                    <Text className="text-xs font-medium text-foreground">{formatMoney(piece.wholesalePrice)}</Text>
                </View>
            </View>

            {onUpdatePiece ? (
                <PiecePricingAdjustSheet
                    visible={adjustOpen}
                    piece={piece}
                    onClose={() => setAdjustOpen(false)}
                    onSave={onUpdatePiece}
                />
            ) : null}
        </View>
    );
}
