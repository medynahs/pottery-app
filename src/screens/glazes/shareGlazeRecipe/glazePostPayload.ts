import type {
  GlazeFinish,
  GlazeIngredient,
  GlazeLibraryItem,
  GlazeStatus,
} from '@/src/screens/glazes/types';
import { stripGlazeVersionSuffix } from '@/src/screens/glazes/glazeVersionUtils';
import type { ShareGlazeDraft } from './shareGlazeDraft';

/** Plain-text delimiters, avoid HTML comments (often stripped server-side). */
export const GLAZE_POST_PAYLOAD_START = '---pottery-life-glaze:v1---';
export const GLAZE_POST_PAYLOAD_END = '---end-pottery-life-glaze---';

/** Embedded in community post content until BE supports structured post metadata. */
export type CommunityGlazeRecipePayload = {
  v: 1;
  kind: 'glaze-recipe';
  name: string;
  finish: GlazeFinish;
  colorFamily: string;
  defaultCone: string;
  coneRange: string;
  status?: GlazeStatus;
  batchSize?: string;
  ingredients: Array<Pick<GlazeIngredient, 'material' | 'percentage' | 'isAddition'>>;
  ingredientsText?: string;
  notes?: string;
  teaserShared?: boolean;
};

export function buildGlazePostPayload(
  glaze: GlazeLibraryItem,
  draft: ShareGlazeDraft,
): CommunityGlazeRecipePayload | null {
  const includeRecipe = !draft.teaserMode && draft.includeRecipe;
  const hasStructured = (glaze.recipeIngredients?.length ?? 0) > 0;
  const hasText = Boolean(glaze.ingredientsText?.trim());

  if (!includeRecipe || (!hasStructured && !hasText)) {
    return null;
  }

  return {
    v: 1,
    kind: 'glaze-recipe',
    name: stripGlazeVersionSuffix(glaze.name) || glaze.name,
    finish: glaze.finish,
    colorFamily: glaze.colorFamily,
    defaultCone: glaze.defaultCone || glaze.coneRange,
    coneRange: glaze.coneRange || glaze.defaultCone,
    status: glaze.status,
    batchSize: glaze.batchSize,
    ingredients: includeRecipe
      ? (glaze.recipeIngredients ?? []).map((row) => ({
          material: row.material,
          percentage: row.percentage,
          isAddition: row.isAddition,
        }))
      : [],
    ingredientsText: includeRecipe ? glaze.ingredientsText : undefined,
    notes: draft.includeNotes && !draft.teaserMode ? glaze.notes : undefined,
    teaserShared: draft.teaserMode,
  };
}

export function embedGlazePayloadInContent(
  visibleCaption: string,
  payload: CommunityGlazeRecipePayload | null,
): string {
  if (!payload) return visibleCaption.trim();
  const json = JSON.stringify(payload);
  return `${visibleCaption.trim()}\n\n${GLAZE_POST_PAYLOAD_START}\n${json}\n${GLAZE_POST_PAYLOAD_END}`;
}

function parseEmbeddedJsonPayload(jsonBlock: string): CommunityGlazeRecipePayload | null {
  try {
    const parsed = JSON.parse(jsonBlock.trim()) as CommunityGlazeRecipePayload;
    if (parsed?.v === 1 && parsed.kind === 'glaze-recipe' && parsed.name) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function parsePlainTextPayload(content: string): CommunityGlazeRecipePayload | null {
  const startIndex = content.indexOf(GLAZE_POST_PAYLOAD_START);
  if (startIndex < 0) return null;
  const afterStart = content.slice(startIndex + GLAZE_POST_PAYLOAD_START.length);
  const endIndex = afterStart.indexOf(GLAZE_POST_PAYLOAD_END);
  const jsonBlock = (endIndex >= 0 ? afterStart.slice(0, endIndex) : afterStart).trim();
  return parseEmbeddedJsonPayload(jsonBlock);
}

export function parseGlazeRecipeFromPost(
  content: string,
): CommunityGlazeRecipePayload | null {
  return parsePlainTextPayload(content);
}

export function stripPayloadFromDisplay(content: string): string {
  let trimmed = content.trim();
  const plainStart = trimmed.indexOf(GLAZE_POST_PAYLOAD_START);
  if (plainStart >= 0) {
    trimmed = trimmed.slice(0, plainStart).trim();
  }
  return trimmed;
}

export function isSavableGlazeRecipePayload(
  payload: CommunityGlazeRecipePayload | null,
): payload is CommunityGlazeRecipePayload {
  if (!payload) return false;
  return payload.ingredients.length > 0 || Boolean(payload.ingredientsText?.trim());
}

export function isCommunityGlazePostSaved(postId: string, glazeIds: string[]): boolean {
  const prefix = `community-${postId}-`;
  return glazeIds.some((id) => id.startsWith(prefix));
}
