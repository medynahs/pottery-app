/**
 * Maps Zustand customization state ↔ GET/PUT /me/preferences blob (version 1).
 * Studio rhythm is synced separately via /me/rhythm.
 */

import type { TextScale } from '@/src/constants/typography';
import { AVAILABLE_KILNKIN_COMPANIONS } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import type { KilnkinCompanion } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import type {
  AppModule,
  ClayBody,
  FormingMethod,
  PieceFormOption,
  PracticeMode,
  StageConfig,
} from '@/src/store/appStore';
import type { KilnChecklist } from '@/src/types/kiln';
import {
  createPricingTemplate,
  normalizePricingSettings,
  type PricingSettings,
  type PricingTemplate,
} from '@/src/types/pricing';

export const PREFERENCES_BLOB_VERSION = 1;

export type PreferencesBlob = {
  version: number;
  clay_bodies?: ApiClayBody[];
  default_clay_body_ref?: string | null;
  forming_methods?: ApiNamedRef[];
  piece_forms?: ApiNamedRef[];
  defaults?: {
    bisque_cone?: string | null;
    glaze_cone?: string | null;
    new_piece_stage?: string | null;
  };
  stage_config?: ApiStageConfig[];
  pricing?: {
    settings?: PricingSettings;
    templates?: ApiPricingTemplate[];
    active_template_ref?: string | null;
    onboarding_completed?: boolean;
  };
  ui?: {
    text_scale?: TextScale;
    enabled_modules?: string[];
    pieces_compact_cards?: boolean;
    analytics_hidden_tabs?: string[];
    practice_mode?: PracticeMode;
  };
  kilnkin?: {
    id?: string;
    element?: string;
    name?: string;
  };
  kiln_checklist?: ApiKilnChecklistItem[];
};

type ApiClayBody = {
  client_ref: string;
  name: string;
  shrinkage_pct?: number | null;
};

type ApiNamedRef = {
  client_ref: string;
  name: string;
};

type ApiStageConfig = {
  id: string;
  label: string;
  default_label?: string;
  enabled: boolean;
  is_custom?: boolean;
  icon_key?: string | null;
};

type ApiPricingTemplate = {
  client_ref: string;
  name: string;
  is_default?: boolean;
  settings: PricingSettings;
};

type ApiKilnChecklistItem = {
  client_ref: string;
  label: string;
  sort: number;
  checked?: boolean;
};

export type PreferencesStoreSlice = {
  stageConfig: StageConfig[];
  clayBodies: ClayBody[];
  defaultClayBodyId: string | null;
  formingMethods: FormingMethod[];
  pieceFormOptions: PieceFormOption[];
  defaultBisqueTemp: string | null;
  defaultGlazeTemp: string | null;
  defaultNewPieceStage: string;
  pricingSettings: PricingSettings;
  pricingTemplates: PricingTemplate[];
  activePricingTemplateId: string | null;
  pricingOnboardingCompleted: boolean;
  enabledModules: AppModule[];
  textScale: TextScale;
  kilnkinCompanion: KilnkinCompanion;
  kilnChecklist: KilnChecklist[];
  piecesCompactCards: boolean;
  analyticsHiddenTabs: string[];
  practiceMode: PracticeMode;
};

export function preferencesBlobFromStore(state: PreferencesStoreSlice): PreferencesBlob {
  const clayBodies = state.clayBodies ?? [];
  const formingMethods = state.formingMethods ?? [];
  const pieceFormOptions = state.pieceFormOptions ?? [];
  const stageConfig = state.stageConfig ?? [];
  const pricingTemplates = state.pricingTemplates ?? [];
  const kilnChecklist = state.kilnChecklist ?? [];
  const enabledModules = state.enabledModules ?? [];
  const analyticsHiddenTabs = state.analyticsHiddenTabs ?? [];

  return {
    version: PREFERENCES_BLOB_VERSION,
    clay_bodies: clayBodies.map((clay) => ({
      client_ref: clay.id,
      name: clay.name,
      shrinkage_pct: clay.shrinkagePct ?? null,
    })),
    default_clay_body_ref: state.defaultClayBodyId,
    forming_methods: formingMethods.map((m) => ({
      client_ref: m.id,
      name: m.name,
    })),
    piece_forms: pieceFormOptions.map((f) => ({
      client_ref: f.id,
      name: f.name,
    })),
    defaults: {
      bisque_cone: state.defaultBisqueTemp,
      glaze_cone: state.defaultGlazeTemp,
      new_piece_stage: state.defaultNewPieceStage,
    },
    stage_config: stageConfig.map((stage) => ({
      id: stage.id,
      label: stage.label,
      default_label: stage.defaultLabel,
      enabled: stage.enabled,
      is_custom: stage.isCustom ?? false,
      icon_key: stage.iconKey ?? null,
    })),
    pricing: {
      settings: normalizePricingSettings(state.pricingSettings),
      templates: pricingTemplates.map((template) => ({
        client_ref: template.id,
        name: template.name,
        is_default: template.isDefault ?? false,
        settings: normalizePricingSettings(template.settings),
      })),
      active_template_ref: state.activePricingTemplateId,
      onboarding_completed: state.pricingOnboardingCompleted,
    },
    ui: {
      text_scale: state.textScale,
      enabled_modules: [...enabledModules],
      pieces_compact_cards: state.piecesCompactCards,
      analytics_hidden_tabs: [...analyticsHiddenTabs],
      practice_mode: state.practiceMode,
    },
    kilnkin: {
      id: state.kilnkinCompanion.id,
      element: state.kilnkinCompanion.element,
      name: state.kilnkinCompanion.name,
    },
    kiln_checklist: kilnChecklist.map((item, index) => ({
      client_ref: item.id,
      label: item.text,
      sort: index,
      checked: item.checked,
    })),
  };
}

function kilnkinFromApi(
  api: NonNullable<PreferencesBlob['kilnkin']>,
  current: KilnkinCompanion,
): KilnkinCompanion {
  const catalog = api.id
    ? AVAILABLE_KILNKIN_COMPANIONS.find((c) => c.id === api.id)
    : undefined;
  const base = catalog ?? current;
  const element = (api.element ?? base.element) as KilnkinCompanion['element'];
  return {
    ...base,
    id: api.id ?? base.id,
    name: api.name?.trim() || base.name,
    personality: element,
    element,
  };
}

function pricingTemplatesFromApi(
  apiTemplates: ApiPricingTemplate[] | undefined,
  fallbackSettings: PricingSettings,
): { templates: PricingTemplate[]; activeId: string | null } {
  if (!apiTemplates?.length) {
    const template = createPricingTemplate('Studio Default', fallbackSettings, true);
    return { templates: [template], activeId: template.id };
  }

  const templates: PricingTemplate[] = apiTemplates.map((t) => ({
    id: t.client_ref,
    name: t.name,
    isDefault: t.is_default ?? false,
    settings: normalizePricingSettings(t.settings),
  }));

  const activeId =
    apiTemplates.find((t) => t.is_default)?.client_ref
    ?? templates[0]?.id
    ?? null;

  return { templates, activeId };
}

export function preferencesPatchFromBlob(
  blob: PreferencesBlob,
  current: PreferencesStoreSlice,
): Partial<PreferencesStoreSlice> {
  const patch: Partial<PreferencesStoreSlice> = {};

  if (blob.clay_bodies?.length) {
    patch.clayBodies = blob.clay_bodies.map((clay) => ({
      id: clay.client_ref,
      name: clay.name,
      shrinkagePct: clay.shrinkage_pct == null ? undefined : clay.shrinkage_pct,
    }));
  }

  if (blob.default_clay_body_ref !== undefined) {
    patch.defaultClayBodyId = blob.default_clay_body_ref;
  }

  if (blob.forming_methods?.length) {
    patch.formingMethods = blob.forming_methods.map((m) => ({
      id: m.client_ref,
      name: m.name,
    }));
  }

  if (blob.piece_forms?.length) {
    patch.pieceFormOptions = blob.piece_forms.map((f) => ({
      id: f.client_ref,
      name: f.name,
    }));
  }

  if (blob.defaults) {
    if (blob.defaults.bisque_cone !== undefined) {
      patch.defaultBisqueTemp = blob.defaults.bisque_cone;
    }
    if (blob.defaults.glaze_cone !== undefined) {
      patch.defaultGlazeTemp = blob.defaults.glaze_cone;
    }
    if (blob.defaults.new_piece_stage !== undefined && blob.defaults.new_piece_stage) {
      patch.defaultNewPieceStage = blob.defaults.new_piece_stage;
    }
  }

  if (blob.stage_config?.length) {
    patch.stageConfig = blob.stage_config.map((stage) => ({
      id: stage.id,
      label: stage.label,
      defaultLabel: stage.default_label ?? stage.label,
      enabled: stage.enabled,
      isCustom: stage.is_custom ?? false,
      iconKey: stage.icon_key ?? undefined,
    }));
  }

  if (blob.pricing) {
    const fallbackSettings = blob.pricing.settings
      ? normalizePricingSettings(blob.pricing.settings)
      : current.pricingSettings;
    const { templates, activeId } = pricingTemplatesFromApi(blob.pricing.templates, fallbackSettings);
    patch.pricingSettings = fallbackSettings;
    patch.pricingTemplates = templates;
    patch.activePricingTemplateId = blob.pricing.active_template_ref ?? activeId;
    if (blob.pricing.onboarding_completed !== undefined) {
      patch.pricingOnboardingCompleted = blob.pricing.onboarding_completed;
    }
  }

  if (blob.ui) {
    if (blob.ui.text_scale) patch.textScale = blob.ui.text_scale;
    if (blob.ui.enabled_modules?.length) {
      patch.enabledModules = blob.ui.enabled_modules as AppModule[];
    }
    if (blob.ui.pieces_compact_cards !== undefined) {
      patch.piecesCompactCards = blob.ui.pieces_compact_cards;
    }
    if (blob.ui.analytics_hidden_tabs) {
      patch.analyticsHiddenTabs = blob.ui.analytics_hidden_tabs;
    }
    if (blob.ui.practice_mode !== undefined) patch.practiceMode = blob.ui.practice_mode;
  }

  if (blob.kilnkin) {
    patch.kilnkinCompanion = kilnkinFromApi(blob.kilnkin, current.kilnkinCompanion);
  }

  if (blob.kiln_checklist) {
    const sorted = [...blob.kiln_checklist].sort((a, b) => a.sort - b.sort);
    patch.kilnChecklist = sorted.map((item) => ({
      id: item.client_ref,
      text: item.label,
      checked: item.checked ?? false,
    }));
  }

  return patch;
}

export function isEmptyServerPreferences(blob: PreferencesBlob | null | undefined): boolean {
  if (!blob) return true;
  const keys = Object.keys(blob).filter((key) => key !== 'version');
  return keys.length === 0;
}

export function selectPreferencesSlice(state: PreferencesStoreSlice): PreferencesStoreSlice {
  return {
    stageConfig: state.stageConfig ?? [],
    clayBodies: state.clayBodies ?? [],
    defaultClayBodyId: state.defaultClayBodyId ?? null,
    formingMethods: state.formingMethods ?? [],
    pieceFormOptions: state.pieceFormOptions ?? [],
    defaultBisqueTemp: state.defaultBisqueTemp,
    defaultGlazeTemp: state.defaultGlazeTemp,
    defaultNewPieceStage: state.defaultNewPieceStage,
    pricingSettings: state.pricingSettings,
    pricingTemplates: state.pricingTemplates ?? [],
    activePricingTemplateId: state.activePricingTemplateId,
    pricingOnboardingCompleted: state.pricingOnboardingCompleted,
    enabledModules: state.enabledModules ?? [],
    textScale: state.textScale,
    kilnkinCompanion: state.kilnkinCompanion,
    kilnChecklist: state.kilnChecklist ?? [],
    piecesCompactCards: state.piecesCompactCards ?? false,
    analyticsHiddenTabs: state.analyticsHiddenTabs ?? [],
    practiceMode: state.practiceMode,
  };
}
