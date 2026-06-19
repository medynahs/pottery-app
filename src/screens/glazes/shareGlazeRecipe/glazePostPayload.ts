import type {
  GlazeFinish,
  GlazeIngredient,
  GlazeLibraryItem,
  GlazeStatus,
} from '@/src/screens/glazes/types';
import { stripGlazeVersionSuffix } from '@/src/screens/glazes/glazeVersionUtils';
import type { ShareGlazeDraft } from './shareGlazeDraft';

/** Plain-text delimiters — avoid HTML comments (often stripped server-side). */
export const GLAZE_POST_PAYLOAD_START = '---pottery-life-glaze:v1---';
export const GLAZE_POST_PAYLOAD_END = '---end-pottery-life-glaze---';
/** @deprecated Legacy embed format; still parsed for older posts. */
export const GLAZE_POST_PAYLOAD_MARKER = '<!-- pottery-life-glaze:v1';

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

function parseHtmlCommentPayload(content: string): CommunityGlazeRecipePayload | null {
  const markerIndex = content.indexOf(GLAZE_POST_PAYLOAD_MARKER);
  if (markerIndex < 0) return null;
  const afterMarker = content.slice(markerIndex + GLAZE_POST_PAYLOAD_MARKER.length);
  const endIndex = afterMarker.indexOf('-->');
  const jsonBlock = (endIndex >= 0 ? afterMarker.slice(0, endIndex) : afterMarker).trim();
  return parseEmbeddedJsonPayload(jsonBlock);
}

export function parseGlazeRecipeFromPost(
  content: string,
): CommunityGlazeRecipePayload | null {
  return (
    parsePlainTextPayload(content)
    ?? parseHtmlCommentPayload(content)
    ?? parseLegacyGlazeCaption(content)
  );
}

/** Best-effort parser for atlas share captions without embedded JSON. */
function parseLegacyGlazeCaption(content: string): CommunityGlazeRecipePayload | null {
  const visible = stripPayloadFromDisplay(content);
  const lines = visible.split('\n').map((l) => l.trim()).filter(Boolean);
  const nameLine = lines.find((l) => l.startsWith('🍶'));
  if (!nameLine) return null;

  const name = nameLine.replace(/^🍶\s*/, '').trim();
  if (!name) return null;

  const metaLine = lines.find((l) => l.includes('·') && !l.startsWith('·') && !l.startsWith('#'));
  const ingredients: CommunityGlazeRecipePayload['ingredients'] = [];
  let inRecipe = false;

  for (const line of lines) {
    if (line.toLowerCase() === 'recipe:') {
      inRecipe = true;
      continue;
    }
    if (line.toLowerCase() === 'notes:' || line.startsWith('#')) {
      inRecipe = false;
    }
    if (inRecipe && line.startsWith('·')) {
      const match = line.match(/^·\s*(.+?)\s+([\d.,]+)%$/);
      if (match) {
        ingredients.push({ material: match[1].trim(), percentage: match[2].replace(',', '.') });
      }
    }
  }

  let ingredientsText: string | undefined;
  if (ingredients.length === 0) {
    const recipeIdx = lines.findIndex((l) => l.toLowerCase() === 'recipe:');
    if (recipeIdx >= 0) {
      const chunks: string[] = [];
      for (let i = recipeIdx + 1; i < lines.length; i += 1) {
        const line = lines[i];
        if (line.toLowerCase() === 'notes:' || line.startsWith('#')) break;
        chunks.push(line.replace(/^·\s*/, ''));
      }
      ingredientsText = chunks.join('\n').trim();
    } else if (metaLine) {
      const metaIdx = lines.indexOf(metaLine);
      const chunks: string[] = [];
      for (let i = metaIdx + 1; i < lines.length; i += 1) {
        const line = lines[i];
        if (
          line.toLowerCase() === 'notes:'
          || line.startsWith('#')
          || line.toLowerCase().startsWith('piece:')
          || line.startsWith('🍶')
        ) {
          break;
        }
        chunks.push(line);
      }
      ingredientsText = chunks.join('\n').trim();
    }
  }

  if (ingredients.length === 0 && !ingredientsText) return null;

  const finishGuess = metaLine?.split('·')[0]?.trim() ?? 'glossy';
  const coneGuess = metaLine?.split('·')[1]?.trim() ?? 'Cone 6';

  return {
    v: 1,
    kind: 'glaze-recipe',
    name,
    finish: finishGuess as GlazeFinish,
    colorFamily: 'neutral',
    defaultCone: coneGuess,
    coneRange: coneGuess,
    ingredients,
    ingredientsText,
  };
}

export function stripPayloadFromDisplay(content: string): string {
  let trimmed = content.trim();
  const plainStart = trimmed.indexOf(GLAZE_POST_PAYLOAD_START);
  if (plainStart >= 0) {
    trimmed = trimmed.slice(0, plainStart).trim();
  }
  const htmlStart = trimmed.indexOf(GLAZE_POST_PAYLOAD_MARKER);
  if (htmlStart >= 0) {
    trimmed = trimmed.slice(0, htmlStart).trim();
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
