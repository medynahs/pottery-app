import type { Piece } from '@/src/types/pieces';

export type CommunityPostKind =
  | 'update'
  | 'piece_journal'
  | 'studio_notice'
  | 'ask_community'
  | 'kiln_firing';

export type AskTopic = 'glaze' | 'firing' | 'general';

export const COMMUNITY_POST_KINDS: {
  id: CommunityPostKind;
  label: string;
  hint: string;
  emoji: string;
}[] = [
  {
    id: 'update',
    label: 'Update',
    hint: 'Share progress, photos, or studio news',
    emoji: '✨',
  },
  {
    id: 'piece_journal',
    label: 'Piece journal',
    hint: 'Share a piece story with cover photo and notes',
    emoji: '📖',
  },
  {
    id: 'studio_notice',
    label: 'Studio notice',
    hint: 'Closures, kiln downtime, or schedule changes',
    emoji: '📌',
  },
  {
    id: 'ask_community',
    label: 'Ask',
    hint: 'Glaze troubleshooting, firing advice, or studio questions',
    emoji: '❓',
  },
  {
    id: 'kiln_firing',
    label: 'Firing complete',
    hint: 'Celebrate a unload with the pieces that went in',
    emoji: '🔥',
  },
];

export const ASK_TOPIC_OPTIONS: { id: AskTopic; label: string }[] = [
  { id: 'glaze', label: 'Glaze / surface' },
  { id: 'firing', label: 'Firing / kiln' },
  { id: 'general', label: 'General' },
];

export function resolvePieceJournalPhoto(piece: Piece): string | undefined {
  for (let i = piece.timeline.length - 1; i >= 0; i -= 1) {
    const photos = piece.timeline[i].photos;
    if (!photos?.length) continue;
    for (let j = photos.length - 1; j >= 0; j -= 1) {
      const uri = photos[j].uri?.trim();
      if (uri) return uri;
    }
  }
  return piece.photo?.trim() || piece.imgUrl?.trim() || undefined;
}

export function buildPieceJournalCaption(
  piece: Piece,
  userCaption: string,
  stageLabel: string,
): string {
  const lines: string[] = [
    `📖 ${piece.name}`,
    `${stageLabel} · ${piece.clay}`,
  ];

  const story =
    piece.description?.trim()
    ?? piece.timeline[piece.timeline.length - 1]?.notes?.trim()
    ?? piece.notes?.trim();

  if (story) {
    lines.push(story.length > 280 ? `${story.slice(0, 277)}…` : story);
  }

  const trimmed = userCaption.trim();
  if (trimmed) {
    lines.push('', trimmed);
  }

  return lines.join('\n').trim();
}

export function buildKilnFiringCaption(input: {
  firingName: string;
  firingType: string;
  cone: string;
  pieces: Piece[];
  userCaption: string;
}): string {
  const typeLabel = input.firingType.charAt(0).toUpperCase() + input.firingType.slice(1);
  const lines = [
    `🔥 Firing complete: ${input.firingName}`,
    `${typeLabel} · Cone ${input.cone}`,
  ];
  if (input.pieces.length > 0) {
    lines.push(`Pieces: ${input.pieces.map((p) => p.name).join(', ')}`);
  }
  const trimmed = input.userCaption.trim();
  if (trimmed) {
    lines.push('', trimmed);
  }
  return lines.join('\n').trim();
}

export function buildAskCommunityCaption(userCaption: string, topic: AskTopic): string {
  const topicLine =
    topic === 'glaze'
      ? 'Glaze / surface question'
      : topic === 'firing'
        ? 'Firing / kiln question'
        : 'Studio question';
  const trimmed = userCaption.trim();
  const lines = [`❓ Ask the community`, topicLine];
  if (trimmed) lines.push('', trimmed);
  return lines.join('\n').trim();
}

export function composeCommunityPostContent(input: {
  kind: CommunityPostKind;
  caption: string;
  linkedPiece: Piece | null;
  linkedPieces?: Piece[];
  stageLabel?: string;
  firingName?: string;
  firingType?: string;
  cone?: string;
  askTopic?: AskTopic;
}): string {
  const {
    kind,
    caption,
    linkedPiece,
    linkedPieces = [],
    stageLabel = linkedPiece?.stage ?? '',
    firingName = 'Studio firing',
    firingType = 'bisque',
    cone = '6',
    askTopic = 'general',
  } = input;
  const trimmed = caption.trim();

  let body = '';
  if (kind === 'piece_journal' && linkedPiece) {
    body = buildPieceJournalCaption(linkedPiece, caption, stageLabel);
  } else if (kind === 'kiln_firing') {
    body = buildKilnFiringCaption({
      firingName,
      firingType,
      cone,
      pieces: linkedPieces,
      userCaption: caption,
    });
  } else if (kind === 'ask_community') {
    body = buildAskCommunityCaption(caption, askTopic);
  } else if (kind === 'studio_notice') {
    body = trimmed ? `📌 Studio notice\n\n${trimmed}` : '📌 Studio notice';
  } else {
    body = trimmed;
  }

  return body;
}

export function canSubmitCommunityPost(input: {
  kind: CommunityPostKind;
  caption: string;
  photoUri: string | null;
  linkedPiece: Piece | null;
  linkedPieces?: Piece[];
}): boolean {
  const body = composeCommunityPostContent({
    kind: input.kind,
    caption: input.caption,
    linkedPiece: input.linkedPiece,
    linkedPieces: input.linkedPieces,
  });
  if (input.kind === 'piece_journal') {
    return Boolean(input.linkedPiece && (body || input.photoUri));
  }
  if (input.kind === 'kiln_firing') {
    return Boolean(body || input.photoUri);
  }
  if (input.kind === 'ask_community') {
    return Boolean(input.caption.trim());
  }
  return Boolean(body || input.photoUri);
}
