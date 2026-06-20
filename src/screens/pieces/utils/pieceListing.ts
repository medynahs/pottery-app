import type { Piece } from '@/src/types/pieces';
import { parseNumericInput } from '@/src/types/pricing';

const NOT_FOR_SALE = new Set(['sold', 'gifted', 'not for sale']);

export function isPieceForSale(piece: Piece): boolean {
  const status = piece.status?.trim().toLowerCase();
  if (status === 'available') return true;
  if (status && NOT_FOR_SALE.has(status)) return false;
  const price =
    parseNumericInput(piece.price)
    ?? piece.retailPriceTarget
    ?? piece.suggestedPrice
    ?? piece.wholesalePriceTarget;
  return (price ?? 0) > 0;
}
