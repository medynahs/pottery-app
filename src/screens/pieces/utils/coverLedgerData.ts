import type { Piece } from '@/src/types/pieces';
import { parseNumericInput } from '@/src/types/pricing';
import { STAGE_LABEL } from './constants';
import { formatDate, formatDuration } from './journal';

export type LedgerRow = { label: string; value: string };

function money(currencySymbol: string, value?: number | null) {
  if (value == null) return '-';
  return `${currencySymbol}${value.toFixed(2)}`;
}

export function buildRegistryRows(piece: Piece, totalMs: number, currencySymbol: string): LedgerRow[] {
  const stage = STAGE_LABEL[piece.stage] ?? piece.stage;
  return [
    { label: 'Registry no.', value: `#${String(piece.id).padStart(4, '0')}` },
    { label: 'Started', value: piece.createdAt ? formatDate(piece.createdAt) : '-' },
    { label: 'Current stage', value: stage },
    { label: 'Time invested', value: formatDuration(totalMs) },
    { label: 'Timeline entries', value: String(piece.timeline.length) },
    { label: 'Batch', value: piece.batchSize && piece.batchSize > 1 ? `×${piece.batchSize}` : 'Single piece' },
    { label: 'Disposition', value: piece.status || '-' },
    { label: 'Studio location', value: piece.location || '-' },
  ];
}

export function buildSpecimenRows(piece: Piece): LedgerRow[] {
  return [
    { label: 'Clay body', value: piece.clay || '-' },
    { label: 'Form', value: piece.form || '-' },
    { label: 'Forming method', value: piece.formingMethod || '-' },
    { label: 'Dimensions', value: piece.dimensions || '-' },
    { label: 'Weight', value: piece.weight || '-' },
    { label: 'Bisque cone', value: piece.bisqueTemp || '-' },
    { label: 'Glaze cone', value: piece.glazeTemp || '-' },
    { label: 'Firing type', value: piece.firingType || '-' },
    { label: 'Decorations', value: piece.decorations || '-' },
  ];
}

export function buildEconomicsRows(piece: Piece, currencySymbol: string): LedgerRow[] {
  const retail = piece.retailPriceTarget ?? parseNumericInput(piece.price) ?? piece.suggestedPrice;
  return [
    { label: 'Clay cost', value: money(currencySymbol, piece.costClay) },
    { label: 'Glaze cost', value: money(currencySymbol, piece.costGlaze) },
    { label: 'Kiln energy', value: money(currencySymbol, piece.costEnergy) },
    { label: 'Other materials', value: money(currencySymbol, piece.costOther) },
    { label: 'Firing fee', value: money(currencySymbol, piece.firingFee) },
    { label: 'Making labor', value: money(currencySymbol, piece.laborCost) },
    { label: 'Admin labor', value: money(currencySymbol, piece.adminCost) },
    { label: 'Overhead', value: money(currencySymbol, piece.overheadCost) },
    { label: 'Profit buffer', value: money(currencySymbol, piece.profitAmount) },
    { label: 'Selling fees', value: money(currencySymbol, piece.sellingFeeAmount) },
    { label: 'Tax', value: money(currencySymbol, piece.taxAmount) },
    { label: 'Material subtotal', value: money(currencySymbol, piece.materialCost) },
    { label: 'True cost', value: money(currencySymbol, piece.totalCost) },
    { label: 'Suggested retail', value: money(currencySymbol, piece.suggestedPrice) },
    { label: 'Retail target', value: money(currencySymbol, retail) },
    { label: 'Wholesale floor', value: money(currencySymbol, piece.wholesalePrice ?? piece.wholesalePriceTarget) },
  ];
}

export function buildJourneyStages(piece: Piece): { stage: string; label: string; date: string }[] {
  return piece.timeline.map((entry) => ({
    stage: entry.stage,
    label: STAGE_LABEL[entry.stage] ?? entry.stage,
    date: entry.timestamp ? formatDate(entry.timestamp) : '-',
  }));
}
