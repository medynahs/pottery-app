import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { useAppStore } from '@/src/store/appStore';
import React from 'react';
import type { Piece, PieceForm } from '../../../types/pieces';
import {
    calculatePiecePricingSnapshot,
    normalizePricingSettings,
    parseNumericInput,
    parseWeightToGrams,
    type PricingFiringMode,
} from '../../../types/pricing';
import { EMPTY_FORM } from '../utils/constants';
import { isGlazeOutcome } from '@/src/screens/glazes/glazePieceLink';

function formatInputNumber(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return '';
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return `${rounded}`.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

function pieceToForm(piece: Piece): PieceForm {
  const salePriceMode = piece.salePriceMode ?? 'retail';
  const legacyRetailPrice = piece.retailPriceTarget ?? parseNumericInput(piece.price) ?? piece.suggestedPrice ?? undefined;
  const legacyWholesalePrice = piece.wholesalePriceTarget ?? piece.wholesalePrice ?? undefined;

  return {
    name: piece.name,
    clay: piece.clay,
    stage: piece.stage,
    status: piece.status ?? '',
    photo: piece.photo,
    location: piece.location ?? '',
    formingMethod: piece.formingMethod ?? '',
    form: piece.form ?? '',
    weight: piece.weight ?? (piece.weightGrams != null ? `${formatInputNumber(piece.weightGrams)} g` : ''),
    dimensions: piece.dimensions ?? '',
    heightCm: piece.heightCm != null ? String(piece.heightCm) : '',
    widthCm: piece.widthCm != null ? String(piece.widthCm) : '',
    firingFeeMode: piece.firingFeeMode ?? 'bisque-glaze',
    salePriceMode,
    workHours: formatInputNumber(piece.workHours ?? (piece.workMinutes != null ? piece.workMinutes / 60 : undefined)),
    adminHours: formatInputNumber(piece.adminHours ?? (piece.adminMinutes != null ? piece.adminMinutes / 60 : undefined)),
    costClayOverride: formatInputNumber(piece.costClayOverride),
    costGlazeOverride: formatInputNumber(piece.costGlazeOverride),
    costEnergyOverride: formatInputNumber(piece.costEnergyOverride),
    costOther: formatInputNumber(piece.costOther),
    markupPct: piece.markupPct != null ? String(piece.markupPct) : '',
    bisqueTemp: piece.bisqueTemp ?? '',
    glazeTemp: piece.glazeTemp ?? '',
    firingType: piece.firingType ?? '',
    decorations: piece.decorations ?? '',
    notes: piece.notes ?? '',
    epitaph: piece.epitaph ?? '',
    causeOfDeath: piece.causeOfDeath ?? '',
    retailPriceTarget: formatInputNumber(legacyRetailPrice),
    wholesalePriceTarget: formatInputNumber(legacyWholesalePrice),
    quantity: 1,
    glazeId: piece.glazeId ?? '',
    glazeOutcome: piece.glazeOutcome ?? '',
  };
}

export function useAddPieceForm(
  onClose: () => void,
  onAdd: (pieces: Piece[]) => void,
  initialPiece?: Piece,
  onEdit?: (piece: Piece) => void,
) {
  const { openPickSheet } = usePhotoPicker({ aspect: [1, 1] });

  const clayBodies = useAppStore((s) => s.clayBodies);
  const defaultClayBodyId = useAppStore((s) => s.defaultClayBodyId);
  const defaultNewPieceStage = useAppStore((s) => s.defaultNewPieceStage);
  const pricingSettingsState = useAppStore((s) => s.pricingSettings);
  const pricingSettings = React.useMemo(() => normalizePricingSettings(pricingSettingsState), [pricingSettingsState]);

  const buildEmptyForm = React.useCallback((): PieceForm => {
    const defaultClay = defaultClayBodyId
      ? (clayBodies.find((c) => c.id === defaultClayBodyId)?.name ?? '')
      : '';

    return {
      ...EMPTY_FORM,
      stage: defaultNewPieceStage || 'idea',
      clay: defaultClay,
      firingFeeMode: pricingSettings.defaultMode,
      salePriceMode: 'retail',
      workHours: formatInputNumber(pricingSettings.defaultWorkHours),
      adminHours: formatInputNumber(pricingSettings.defaultAdminHours),
      costOther: pricingSettings.defaultOtherCost > 0 ? pricingSettings.defaultOtherCost.toFixed(2) : '',
      markupPct: String(pricingSettings.defaultMarkupPct),
    };
  }, [clayBodies, defaultClayBodyId, defaultNewPieceStage, pricingSettings]);

  const [form, setForm] = React.useState<PieceForm>(initialPiece ? pieceToForm(initialPiece) : buildEmptyForm());

  React.useEffect(() => {
    setForm(initialPiece ? pieceToForm(initialPiece) : buildEmptyForm());
  }, [buildEmptyForm, initialPiece]);

  const set = <K extends keyof PieceForm>(key: K, value: PieceForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleClose = React.useCallback(() => {
    setForm(buildEmptyForm());
    onClose();
  }, [buildEmptyForm, onClose]);

  const pickImage = React.useCallback(() => {
    openPickSheet((uri) => setForm((previous) => ({ ...previous, photo: uri })));
  }, [openPickSheet]);

  const buildPricingSnapshot = React.useCallback(() => {
    const heightCm = parseNumericInput(form.heightCm);
    const widthCm = parseNumericInput(form.widthCm);
    const weightGrams = parseWeightToGrams(form.weight);
    const firingFeeMode: PricingFiringMode = form.firingFeeMode === 'bisque' ? 'bisque' : 'bisque-glaze';
    const clayCostOverride = parseNumericInput(form.costClayOverride);
    const glazeCostOverride = parseNumericInput(form.costGlazeOverride);
    const energyCostOverride = parseNumericInput(form.costEnergyOverride);
    const otherCost = parseNumericInput(form.costOther);
    const workHours = parseNumericInput(form.workHours) ?? pricingSettings.defaultWorkHours;
    const adminHours = parseNumericInput(form.adminHours) ?? pricingSettings.defaultAdminHours;
    const markupPct = parseNumericInput(form.markupPct) ?? pricingSettings.defaultMarkupPct;

    const pricingSnapshot = calculatePiecePricingSnapshot({
      heightCm,
      widthCm,
      weightGrams,
      mode: firingFeeMode,
      settings: pricingSettings,
      clayCostOverride,
      glazeCostOverride,
      energyCostOverride,
      otherCost,
      markupPct,
      workHours,
      adminHours,
    });

    return {
      heightCm,
      widthCm,
      weightGrams,
      firingFeeMode,
      clayCostOverride,
      glazeCostOverride,
      energyCostOverride,
      otherCost,
      workHours,
      adminHours,
      markupPct,
      pricingSnapshot,
    };
  }, [form, pricingSettings]);

  const buildSavedPiece = React.useCallback((basePiece: Piece): Piece => {
    const {
      heightCm,
      widthCm,
      weightGrams,
      firingFeeMode,
      clayCostOverride,
      glazeCostOverride,
      energyCostOverride,
      otherCost,
      workHours,
      adminHours,
      markupPct,
      pricingSnapshot,
    } = buildPricingSnapshot();

    const autoDimensions =
      form.dimensions.trim() ||
      (heightCm && widthCm ? `${heightCm} × ${widthCm} cm` : '');

    const retailPriceTarget = parseNumericInput(form.retailPriceTarget) ?? pricingSnapshot.suggestedPrice;
    const wholesalePriceTarget = parseNumericInput(form.wholesalePriceTarget) ?? pricingSnapshot.wholesalePrice;
    const activePrice = form.salePriceMode === 'wholesale' ? wholesalePriceTarget : retailPriceTarget;

    return {
      ...basePiece,
      name: basePiece.name?.trim() || form.name.trim(),
      clay: form.clay.trim(),
      stage: form.stage,
      photo: form.photo || undefined,
      location: form.location.trim() || undefined,
      formingMethod: form.formingMethod || undefined,
      form: form.form || undefined,
      weight: form.weight.trim() || undefined,
      weightGrams: weightGrams ?? undefined,
      dimensions: autoDimensions || undefined,
      heightCm: heightCm ?? undefined,
      widthCm: widthCm ?? undefined,
      volumeCm3: pricingSnapshot.volumeCm3 ?? undefined,
      pricingUserType: pricingSettings.pricingUserType,
      firingFeeMode,
      salePriceMode: form.salePriceMode,
      firingFee: pricingSnapshot.firingFee ?? undefined,
      firingFeeQuoteRequired: pricingSnapshot.quoteRequired || undefined,
      workHours,
      adminHours,
      workMinutes: Math.round(workHours * 60),
      adminMinutes: Math.round(adminHours * 60),
      costClay: pricingSnapshot.clayCost,
      costGlaze: pricingSnapshot.glazeCost,
      costEnergy: pricingSnapshot.energyCost,
      costOther: pricingSnapshot.otherCost,
      costClayOverride: clayCostOverride ?? undefined,
      costGlazeOverride: glazeCostOverride ?? undefined,
      costEnergyOverride: energyCostOverride ?? undefined,
      materialCost: pricingSnapshot.materialCost,
      laborCost: pricingSnapshot.laborCost,
      adminCost: pricingSnapshot.adminCost,
      overheadCost: pricingSnapshot.overheadCost,
      sellingFeePct: pricingSettings.sellingFeePct,
      taxPct: pricingSettings.taxPct,
      sellingFeeAmount: pricingSnapshot.sellingFeeAmount,
      taxAmount: pricingSnapshot.taxAmount,
      profitAmount: pricingSnapshot.profitAmount,
      totalCost: pricingSnapshot.totalCost,
      markupPct,
      suggestedPrice: pricingSnapshot.suggestedPrice,
      wholesalePrice: pricingSnapshot.wholesalePrice,
      retailPriceTarget,
      wholesalePriceTarget,
      bisqueTemp: form.bisqueTemp || undefined,
      glazeTemp: form.glazeTemp || undefined,
      firingType: form.firingType || undefined,
      decorations: form.decorations.trim() || undefined,
      notes: form.notes.trim() || undefined,
      status: form.status || undefined,
      epitaph: form.epitaph.trim() || undefined,
      causeOfDeath: form.causeOfDeath.trim() || undefined,
      price: activePrice > 0 ? String(activePrice) : undefined,
      glazeId: form.glazeId.trim() || undefined,
      glazeOutcome: isGlazeOutcome(form.glazeOutcome) ? form.glazeOutcome : undefined,
    };
  }, [buildPricingSnapshot, form, pricingSettings]);

  const handleAdd = React.useCallback(() => {
    if (!form.name.trim() || !form.clay.trim()) return;
    const now = new Date().toISOString();
    const quantity = Math.max(1, Math.floor(form.quantity ?? 1));
    const batchId = quantity > 1 ? `batch-${Date.now()}` : undefined;

    const pieces = Array.from({ length: quantity }, (_, index) => buildSavedPiece({
      id: Date.now() + index,
      name: quantity > 1 ? `${form.name.trim()} ${index + 1}` : form.name.trim(),
      clay: form.clay.trim(),
      stage: form.stage,
      createdAt: now,
      timeline: [{ stage: form.stage, timestamp: now }],
      batchId,
      batchSize: quantity > 1 ? quantity : undefined,
    } as Piece));

    onAdd(pieces);
    setForm(buildEmptyForm());
  }, [buildEmptyForm, buildSavedPiece, form, onAdd]);

  const handleEdit = React.useCallback(() => {
    if (!form.name.trim() || !form.clay.trim() || !initialPiece || !onEdit) return;

    onEdit(buildSavedPiece(initialPiece));
    setForm(buildEmptyForm());
  }, [buildEmptyForm, buildSavedPiece, form, initialPiece, onEdit]);

  return { form, set, handleClose, pickImage, handleAdd, handleEdit };
}