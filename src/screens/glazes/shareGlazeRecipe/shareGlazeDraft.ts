import { resolveGlazePhotoUri } from '@/src/screens/glazes/glazePieceLink';
import { stripGlazeVersionSuffix } from '@/src/screens/glazes/glazeVersionUtils';
import {
  GLAZE_FINISH_LABELS,
  GLAZE_STATUS_LABELS,
  type GlazeLibraryItem,
} from '@/src/screens/glazes/types';
import type { Piece } from '@/src/types/pieces';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MAX_SHARE_POST_LENGTH = 2000;
const DRAFT_KEY_PREFIX = '@pottery-life/glaze-share-draft:';

export type SharePhotoSource = 'glaze' | 'piece' | 'none';

export type ShareGlazeDraft = {
  intro: string;
  includeRecipe: boolean;
  includeNotes: boolean;
  teaserMode: boolean;
  attachPhoto: boolean;
  photoSource: SharePhotoSource;
  linkedPieceId: number | null;
};

export const SHARE_INTRO_PRESETS: Array<{ id: string; label: string; text: string }> = [
  {
    id: 'tested',
    label: 'Just tested this',
    text: 'Just tested this glaze in my studio, sharing how it turned out!',
  },
  {
    id: 'production',
    label: 'Production batch',
    text: 'This batch is going into production, documenting the formula for my future self.',
  },
  {
    id: 'feedback',
    label: 'Want feedback',
    text: 'Looking for feedback on this glaze, has anyone tried something similar?',
  },
  {
    id: 'favorite',
    label: 'Studio favorite',
    text: 'One of my studio favorites right now, had to share the recipe.',
  },
];

export function buildDefaultShareDraft(
  glaze: GlazeLibraryItem,
  linkedPieces: Piece[] = [],
): ShareGlazeDraft {
  const name = stripGlazeVersionSuffix(glaze.name) || glaze.name;
  const featuredPiece = pickFeaturedPiece(linkedPieces);

  return {
    intro: `Sharing a recipe from my glaze atlas, ${name} has been firing well in my studio.`,
    includeRecipe: true,
    includeNotes: Boolean(glaze.notes?.trim()),
    teaserMode: false,
    attachPhoto: Boolean(resolveGlazePhotoUri(glaze) || featuredPiece?.photo || featuredPiece?.imgUrl),
    photoSource: featuredPiece && !resolveGlazePhotoUri(glaze) ? 'piece' : 'glaze',
    linkedPieceId: featuredPiece?.id ?? null,
  };
}

export function pickFeaturedPiece(pieces: Piece[]): Piece | undefined {
  const candidates = pieces.filter((p) => !p.deleted && (p.photo || p.imgUrl));
  const finished = candidates.filter((p) =>
    ['finished', 'glaze-fired'].includes(p.stage.trim().toLowerCase()),
  );
  return finished[0] ?? candidates[0];
}

export function resolveSharePhotoUri(
  glaze: GlazeLibraryItem,
  draft: ShareGlazeDraft,
  linkedPieces: Piece[],
): string | undefined {
  if (!draft.attachPhoto || draft.photoSource === 'none') return undefined;

  if (draft.photoSource === 'piece' && draft.linkedPieceId != null) {
    const piece = linkedPieces.find((p) => p.id === draft.linkedPieceId);
    return piece?.photo ?? piece?.imgUrl ?? undefined;
  }

  return resolveGlazePhotoUri(glaze);
}

export function composeShareCaption(
  draft: ShareGlazeDraft,
  glaze: GlazeLibraryItem,
  linkedPieces: Piece[],
): string {
  const name = stripGlazeVersionSuffix(glaze.name) || glaze.name;
  const finish = GLAZE_FINISH_LABELS[glaze.finish];
  const cone = glaze.defaultCone || glaze.coneRange;
  const status = glaze.status ? GLAZE_STATUS_LABELS[glaze.status] : null;
  const lines: string[] = [];

  const intro = draft.intro.trim();
  if (intro) lines.push(intro);

  lines.push('');
  lines.push(`🍶 ${name}`);

  if (draft.teaserMode) {
    lines.push(`${finish} · ${cone}`);
  } else {
    lines.push(`${finish} · ${cone}${status ? ` · ${status}` : ''}`);
  }

  const linkedPiece =
    draft.linkedPieceId != null
      ? linkedPieces.find((p) => p.id === draft.linkedPieceId)
      : undefined;
  if (linkedPiece) {
    lines.push(`Piece: ${linkedPiece.name}`);
  }

  if (!draft.teaserMode && draft.includeRecipe) {
    if (glaze.recipeIngredients?.length) {
      lines.push('');
      lines.push('Recipe:');
      glaze.recipeIngredients.forEach((row) => {
        lines.push(`· ${row.material} ${row.percentage}%`);
      });
    } else if (glaze.ingredientsText?.trim()) {
      lines.push('');
      lines.push(glaze.ingredientsText.trim());
    }
  }

  if (!draft.teaserMode && draft.includeNotes && glaze.notes?.trim()) {
    lines.push('');
    lines.push('Notes:');
    lines.push(glaze.notes.trim());
  }

  return lines.join('\n').trim();
}

export async function loadShareDraft(glazeId: string): Promise<ShareGlazeDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(`${DRAFT_KEY_PREFIX}${glazeId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ShareGlazeDraft;
  } catch {
    return null;
  }
}

export async function saveShareDraft(glazeId: string, draft: ShareGlazeDraft): Promise<void> {
  await AsyncStorage.setItem(`${DRAFT_KEY_PREFIX}${glazeId}`, JSON.stringify(draft));
}

export async function clearShareDraft(glazeId: string): Promise<void> {
  await AsyncStorage.removeItem(`${DRAFT_KEY_PREFIX}${glazeId}`);
}
