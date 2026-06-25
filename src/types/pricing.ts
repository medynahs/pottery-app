export type PricingFiringMode = 'bisque' | 'bisque-glaze';
export type PricingSaleMode = 'retail' | 'wholesale';

export type PricingUserType = 'hobby' | 'side-business' | 'full-time';

export interface PricingTemplate {
  id: string;
  name: string;
  settings: PricingSettings;
  isDefault?: boolean;
}
export interface PricingTier {
  minVolumeCm3: number;
  maxVolumeCm3: number | null;
  ratePerCm3: number;
  baseFee: number;
  quoteOnly?: boolean;
}

export interface PricingSettings {
  studioLabel: string;
  currencySymbol: string;
  pricingUserType: PricingUserType;
  defaultMode: PricingFiringMode;
  shapeFactor: number;
  bisqueTiers: PricingTier[];
  bisqueGlazeTiers: PricingTier[];
  clayPricePer10kg: number;
  defaultClayCost: number;
  defaultGlazeCost: number;
  defaultEnergyCost: number;
  defaultOtherCost: number;
  defaultWorkHours: number;
  defaultAdminHours: number;
  hourlyLaborRate: number;
  adminHourlyRate: number;
  recurringOverheadCost: number;
  sellingFeePct: number;
  taxPct: number;
  defaultMarkupPct: number;
  wholesaleDiscountPct: number;
}
export const PRICING_USER_TYPE_LABELS: Record<PricingUserType, string> = {
  hobby: 'Hobby / Cost Recovery',
  'side-business': 'Side Business',
  'full-time': 'Full-Time Studio',
};

export const PRICING_USER_TYPE_PRESETS: Record<
  PricingUserType,
  Pick<
    PricingSettings,
    | 'pricingUserType'
    | 'clayPricePer10kg'
    | 'defaultWorkHours'
    | 'defaultAdminHours'
    | 'hourlyLaborRate'
    | 'adminHourlyRate'
    | 'recurringOverheadCost'
    | 'sellingFeePct'
    | 'taxPct'
    | 'defaultMarkupPct'
    | 'wholesaleDiscountPct'
  >
> = {
  hobby: {
    pricingUserType: 'hobby',
    clayPricePer10kg: 16,
    defaultWorkHours: 0.75,
    defaultAdminHours: 0.1,
    hourlyLaborRate: 14,
    adminHourlyRate: 10,
    recurringOverheadCost: 1.5,
    sellingFeePct: 3,
    taxPct: 0,
    defaultMarkupPct: 15,
    wholesaleDiscountPct: 30,
  },
  'side-business': {
    pricingUserType: 'side-business',
    clayPricePer10kg: 18,
    defaultWorkHours: 1,
    defaultAdminHours: 0.17,
    hourlyLaborRate: 24,
    adminHourlyRate: 18,
    recurringOverheadCost: 3,
    sellingFeePct: 8,
    taxPct: 9,
    defaultMarkupPct: 25,
    wholesaleDiscountPct: 40,
  },
  'full-time': {
    pricingUserType: 'full-time',
    clayPricePer10kg: 22,
    defaultWorkHours: 1.25,
    defaultAdminHours: 0.25,
    hourlyLaborRate: 36,
    adminHourlyRate: 24,
    recurringOverheadCost: 5,
    sellingFeePct: 10,
    taxPct: 21,
    defaultMarkupPct: 35,
    wholesaleDiscountPct: 45,
  },
};
const DEFAULT_BISQUE_TIERS: PricingTier[] = [
  { minVolumeCm3: 0, maxVolumeCm3: 6000, ratePerCm3: 0.0055, baseFee: 1 },
  { minVolumeCm3: 6000, maxVolumeCm3: null, ratePerCm3: 0, baseFee: 0, quoteOnly: true },
];

const DEFAULT_BISQUE_GLAZE_TIERS: PricingTier[] = [
  { minVolumeCm3: 0, maxVolumeCm3: 1500, ratePerCm3: 0.0055, baseFee: 2 },
  { minVolumeCm3: 1500, maxVolumeCm3: 4000, ratePerCm3: 0.005, baseFee: 3 },
  { minVolumeCm3: 4000, maxVolumeCm3: 6000, ratePerCm3: 0.0045, baseFee: 3 },
  { minVolumeCm3: 6000, maxVolumeCm3: null, ratePerCm3: 0, baseFee: 0, quoteOnly: true },
];

const BASE_PRICING_SETTINGS: Omit<
  PricingSettings,
  | 'pricingUserType'
  | 'clayPricePer10kg'
  | 'defaultWorkHours'
  | 'defaultAdminHours'
  | 'hourlyLaborRate'
  | 'adminHourlyRate'
  | 'recurringOverheadCost'
  | 'sellingFeePct'
  | 'taxPct'
  | 'defaultMarkupPct'
  | 'wholesaleDiscountPct'
> = {
  studioLabel: 'Studio Default',
  currencySymbol: '€',
  defaultMode: 'bisque-glaze',
  shapeFactor: 1,
  bisqueTiers: DEFAULT_BISQUE_TIERS,
  bisqueGlazeTiers: DEFAULT_BISQUE_GLAZE_TIERS,
  defaultClayCost: 0,
  defaultGlazeCost: 1.2,
  defaultEnergyCost: 0,
  defaultOtherCost: 0,
};
export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  ...BASE_PRICING_SETTINGS,
  ...PRICING_USER_TYPE_PRESETS['side-business'],
  bisqueTiers: DEFAULT_BISQUE_TIERS.map((tier) => ({ ...tier })),
  bisqueGlazeTiers: DEFAULT_BISQUE_GLAZE_TIERS.map((tier) => ({ ...tier })),
};

export function buildDefaultPricingSettings(userType: PricingUserType = 'side-business'): PricingSettings {
  return {
    ...BASE_PRICING_SETTINGS,
    ...PRICING_USER_TYPE_PRESETS[userType],
    bisqueTiers: DEFAULT_BISQUE_TIERS.map((tier) => ({ ...tier })),
    bisqueGlazeTiers: DEFAULT_BISQUE_GLAZE_TIERS.map((tier) => ({ ...tier })),
  };
}

type LegacyPricingSettings = Partial<PricingSettings> & {
  defaultWorkMinutes?: number;
  defaultAdminMinutes?: number;
};

export function normalizePricingSettings(
  settings?: LegacyPricingSettings | null,
): PricingSettings {
  const fallbackUserType = settings?.pricingUserType ?? DEFAULT_PRICING_SETTINGS.pricingUserType;
  const defaults = buildDefaultPricingSettings(fallbackUserType);
  const defaultWorkHours = settings?.defaultWorkHours
    ?? (settings?.defaultWorkMinutes != null ? settings.defaultWorkMinutes / 60 : defaults.defaultWorkHours);
  const defaultAdminHours = settings?.defaultAdminHours
    ?? (settings?.defaultAdminMinutes != null ? settings.defaultAdminMinutes / 60 : defaults.defaultAdminHours);

  return {
    ...defaults,
    ...settings,
    pricingUserType: settings?.pricingUserType ?? defaults.pricingUserType,
    defaultWorkHours,
    defaultAdminHours,
    bisqueTiers: (settings?.bisqueTiers ?? defaults.bisqueTiers).map((tier) => ({ ...tier })),
    bisqueGlazeTiers: (settings?.bisqueGlazeTiers ?? defaults.bisqueGlazeTiers).map((tier) => ({ ...tier })),
  };
}

export function applyPricingUserTypePreset(
  settings: Partial<PricingSettings> | null | undefined,
  userType: PricingUserType,
): PricingSettings {
  const normalized = normalizePricingSettings(settings);
  return {
    ...normalized,
    ...PRICING_USER_TYPE_PRESETS[userType],
  };
}

export function parseNumericInput(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (!value) return null;

  const normalized = value
    .toString()
    .trim()
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');

  if (!normalized || normalized === '-' || normalized === '.') return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseWeightToGrams(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') {
    return value > 0 && Number.isFinite(value) ? value : null;
  }

  if (!value) return null;

  const normalized = value.toString().trim().toLowerCase();
  if (!normalized) return null;

  const parsed = parseNumericInput(normalized);
  if (parsed == null || parsed <= 0) return null;

  if (normalized.includes('kg') || normalized.includes('kilo')) {
    return roundToTwo(parsed * 1000);
  }

  return roundToTwo(parsed);
}

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function estimateVolumeCm3(
  heightCm: number | null | undefined,
  widthCm: number | null | undefined,
  shapeFactor: number,
): number | null {
  if (!heightCm || !widthCm || heightCm <= 0 || widthCm <= 0) return null;
  const radiusCm = widthCm / 2;
  const cylinderVolume = Math.PI * radiusCm * radiusCm * heightCm;
  const appliedShapeFactor = Number.isFinite(shapeFactor) && shapeFactor > 0 ? shapeFactor : 1;
  return Math.round(cylinderVolume * appliedShapeFactor);
}

export function calculateFiringFeeByVolume(
  volumeCm3: number | null | undefined,
  mode: PricingFiringMode,
  settings: Partial<PricingSettings> | PricingSettings,
): { amount: number | null; quoteRequired: boolean } {
  if (!volumeCm3 || volumeCm3 <= 0) {
    return { amount: null, quoteRequired: false };
  }

  const normalizedSettings = normalizePricingSettings(settings);
  const tiers = mode === 'bisque' ? normalizedSettings.bisqueTiers : normalizedSettings.bisqueGlazeTiers;

  const match = tiers.find((tier) => {
    const withinMin = volumeCm3 >= tier.minVolumeCm3;
    const withinMax = tier.maxVolumeCm3 === null ? true : volumeCm3 <= tier.maxVolumeCm3;
    return withinMin && withinMax;
  });

  if (!match) {
    return { amount: null, quoteRequired: true };
  }

  if (match.quoteOnly) {
    return { amount: null, quoteRequired: true };
  }

  return {
    amount: roundToTwo((volumeCm3 * match.ratePerCm3) + match.baseFee),
    quoteRequired: false,
  };
}

export function estimateClayCostFromWeight(
  weightGrams: number | null | undefined,
  settings: Partial<PricingSettings> | PricingSettings,
): number {
  const normalizedSettings = normalizePricingSettings(settings);
  if (!weightGrams || weightGrams <= 0) {
    return roundToTwo(Math.max(0, normalizedSettings.defaultClayCost));
  }

  const costPerGram = Math.max(0, normalizedSettings.clayPricePer10kg) / 10_000;
  return roundToTwo(weightGrams * costPerGram);
}

export function estimateGlazeCostFromVolume(
  volumeCm3: number | null | undefined,
  settings: Partial<PricingSettings> | PricingSettings,
): number {
  const normalizedSettings = normalizePricingSettings(settings);
  const baseGlazeCost = Math.max(0, normalizedSettings.defaultGlazeCost);
  if (baseGlazeCost <= 0) return 0;
  if (!volumeCm3 || volumeCm3 <= 0) return roundToTwo(baseGlazeCost);

  const scaledVolume = clamp(volumeCm3, 250, 8_000);
  const multiplier = clamp(Math.pow(scaledVolume / 950, 0.45), 0.7, 2.4);
  return roundToTwo(baseGlazeCost * multiplier);
}

export type PiecePricingSnapshot = {
  volumeCm3: number | null;
  firingFee: number | null;
  quoteRequired: boolean;
  clayCost: number;
  glazeCost: number;
  energyCost: number;
  otherCost: number;
  materialCost: number;
  laborCost: number;
  adminCost: number;
  overheadCost: number;
  profitAmount: number;
  sellingFeeAmount: number;
  taxAmount: number;
  totalCost: number;
  wholesalePrice: number;
  suggestedPrice: number;
};

export function calculatePiecePricingSnapshot(args: {
  heightCm: number | null | undefined;
  widthCm: number | null | undefined;
  weightGrams?: number | null | undefined;
  mode: PricingFiringMode;
  settings: Partial<PricingSettings> | PricingSettings;
  clayCostOverride?: number | null;
  glazeCostOverride?: number | null;
  energyCostOverride?: number | null;
  otherCost?: number | null;
  markupPct?: number;
  workHours?: number | null;
  adminHours?: number | null;
}): PiecePricingSnapshot {
  const normalizedSettings = normalizePricingSettings(args.settings);
  const volumeCm3 = estimateVolumeCm3(args.heightCm, args.widthCm, normalizedSettings.shapeFactor);
  const firing = calculateFiringFeeByVolume(volumeCm3, args.mode, normalizedSettings);
  const normalizedFiringFee = firing.amount ?? 0;
  const clayCost = roundToTwo(
    Math.max(
      0,
      args.clayCostOverride != null
        ? args.clayCostOverride
        : estimateClayCostFromWeight(args.weightGrams, normalizedSettings),
    ),
  );
  const glazeCost = roundToTwo(
    Math.max(
      0,
      args.glazeCostOverride != null
        ? args.glazeCostOverride
        : estimateGlazeCostFromVolume(volumeCm3, normalizedSettings),
    ),
  );
  const energyCost = roundToTwo(Math.max(0, args.energyCostOverride ?? normalizedSettings.defaultEnergyCost));
  const otherCost = roundToTwo(Math.max(0, args.otherCost ?? normalizedSettings.defaultOtherCost));

  const materialCost = roundToTwo(
    clayCost +
    glazeCost +
    energyCost +
    otherCost +
    normalizedFiringFee,
  );

  const workHours = Math.max(0, args.workHours ?? normalizedSettings.defaultWorkHours);
  const adminHours = Math.max(0, args.adminHours ?? normalizedSettings.defaultAdminHours);
  const laborCost = roundToTwo(Math.max(0, normalizedSettings.hourlyLaborRate) * workHours);
  const adminCost = roundToTwo(Math.max(0, normalizedSettings.adminHourlyRate) * adminHours);
  const overheadCost = roundToTwo(Math.max(0, normalizedSettings.recurringOverheadCost));

  const totalCost = roundToTwo(materialCost + laborCost + adminCost + overheadCost);
  const normalizedMarkupPct = Number.isFinite(args.markupPct)
    ? Math.max(0, args.markupPct ?? 0)
    : normalizedSettings.defaultMarkupPct;
  const profitAmount = roundToTwo(totalCost * (normalizedMarkupPct / 100));
  const feeBase = totalCost + profitAmount;
  const sellingFeeAmount = roundToTwo(feeBase * (Math.max(0, normalizedSettings.sellingFeePct) / 100));
  const taxBase = feeBase + sellingFeeAmount;
  const taxAmount = roundToTwo(taxBase * (Math.max(0, normalizedSettings.taxPct) / 100));
  const suggestedPrice = roundToTwo(totalCost + profitAmount + sellingFeeAmount + taxAmount);
  const wholesaleDiscountPct = Math.min(95, Math.max(0, normalizedSettings.wholesaleDiscountPct));
  const wholesaleCandidate = suggestedPrice * (1 - wholesaleDiscountPct / 100);
  const wholesalePrice = roundToTwo(Math.max(totalCost, wholesaleCandidate));

  return {
    volumeCm3,
    firingFee: firing.amount,
    quoteRequired: firing.quoteRequired,
    clayCost,
    glazeCost,
    energyCost,
    otherCost,
    materialCost,
    laborCost,
    adminCost,
    overheadCost,
    profitAmount,
    sellingFeeAmount,
    taxAmount,
    totalCost,
    wholesalePrice,
    suggestedPrice,
  };
}

export function createPricingTemplate(
  name: string,
  settings: PricingSettings,
  isDefault = false,
): PricingTemplate {
  return {
    id: `pricing-template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || 'My Template',
    settings: normalizePricingSettings(settings),
    isDefault,
  };
}

export function getActivePricingTemplate(templates: PricingTemplate[]): PricingTemplate | null {
  if (templates.length === 0) return null;
  return templates.find((template) => template.isDefault) ?? templates[0];
}

export function getActivePricingSettings(
  templates: PricingTemplate[],
  fallback: PricingSettings,
): PricingSettings {
  const active = getActivePricingTemplate(templates);
  return active ? normalizePricingSettings(active.settings) : normalizePricingSettings(fallback);
}

export type WeightUnit = 'g' | 'kg';

export function parseWeightToForm(
  weight?: string,
  weightGrams?: number | null,
): { weightValue: string; weightUnit: WeightUnit } {
  if (weightGrams != null && weightGrams > 0) {
    if (weightGrams >= 1000) {
      const kg = weightGrams / 1000;
      const rounded = Math.round((kg + Number.EPSILON) * 100) / 100;
      return { weightValue: `${rounded}`.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1'), weightUnit: 'kg' };
    }
    return { weightValue: String(Math.round(weightGrams)), weightUnit: 'g' };
  }

  if (!weight?.trim()) {
    return { weightValue: '', weightUnit: 'g' };
  }

  const normalized = weight.trim().toLowerCase();
  const parsed = parseNumericInput(normalized);
  if (parsed == null || parsed <= 0) {
    return { weightValue: '', weightUnit: 'g' };
  }

  if (normalized.includes('kg') || normalized.includes('kilo')) {
    return { weightValue: String(parsed), weightUnit: 'kg' };
  }

  return { weightValue: String(parsed), weightUnit: 'g' };
}

export function weightFormToGrams(value: string, unit: WeightUnit): number | null {
  const parsed = parseNumericInput(value);
  if (parsed == null || parsed <= 0) return null;
  return unit === 'kg' ? roundToTwo(parsed * 1000) : roundToTwo(parsed);
}

export function weightFormToString(value: string, unit: WeightUnit): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return unit === 'kg' ? `${trimmed} kg` : `${trimmed} g`;
}

export function calcFiredSize(greenSizeCm: number, shrinkagePct: number): number {
  if (!Number.isFinite(greenSizeCm) || greenSizeCm <= 0) return 0;
  const pct = Math.min(30, Math.max(0, shrinkagePct));
  return roundToTwo(greenSizeCm * (1 - pct / 100));
}

export function calcGreenSize(firedSizeCm: number, shrinkagePct: number): number {
  if (!Number.isFinite(firedSizeCm) || firedSizeCm <= 0) return 0;
  const pct = Math.min(30, Math.max(0, shrinkagePct));
  const factor = 1 - pct / 100;
  if (factor <= 0) return 0;
  return roundToTwo(firedSizeCm / factor);
}
