import { useAppStore } from '@/src/store/appStore';
import { useMemo } from 'react';

interface BadgeContext {
  totalPieces: number;
  finishedPieces: number;
  glazedPieces: number;
  bisqueFirings: number;
  glazeFirings: number;
  totalFirings: number;
  piecesWithNotes: number;
  failedPieces: number;
  giftedPieces: number;
  wheelPieces: number;
  handBuiltPieces: number;
  piecesWithPhoto: number;
  soldPieces: number;
}

interface BadgeDef {
  id: string;
  current: (ctx: BadgeContext) => number;
  target: number;
}

const BADGE_REGISTRY: BadgeDef[] = [
  // Firings
  { id: 'first-fire',      current: (c) => c.bisqueFirings,    target: 1   },
  { id: 'first-glaze',     current: (c) => c.glazeFirings,     target: 1   },
  { id: 'kiln-master',     current: (c) => c.totalFirings,     target: 25  },
  { id: 'glaze-alchemist', current: (c) => c.glazeFirings,     target: 10  },
  // Pieces made
  { id: 'centering',       current: (c) => c.totalPieces,      target: 50  },
  { id: 'centurion',       current: (c) => c.totalPieces,      target: 100 },
  { id: 'prolific',        current: (c) => c.totalPieces,      target: 150 },
  { id: 'studio-veteran',  current: (c) => c.totalPieces,      target: 300 },
  // Technique
  { id: 'wheel-warrior',   current: (c) => c.wheelPieces,      target: 25  },
  { id: 'hand-builder',    current: (c) => c.handBuiltPieces,  target: 25  },
  { id: 'glazing-artist',  current: (c) => c.glazedPieces,     target: 50  },
  { id: 'finisher',        current: (c) => c.finishedPieces,   target: 30  },
  // Documentation
  { id: 'record-keeper',   current: (c) => c.piecesWithNotes,  target: 10  },
  { id: 'photo-story',     current: (c) => c.piecesWithPhoto,  target: 10  },
  // Story
  { id: 'resilient',       current: (c) => c.failedPieces,     target: 5   },
  { id: 'first-sale',      current: (c) => c.soldPieces,       target: 1   },
  { id: 'market-ready',    current: (c) => c.soldPieces,       target: 10  },
  { id: 'giver',           current: (c) => c.giftedPieces,     target: 15  },
];

// Titles mapped to number of badges earned (out of 18 total)
const TITLES: { min: number; title: string }[] = [
  { min: 0,  title: 'Clay Beginner'     },
  { min: 1,  title: 'First Thrower'     },
  { min: 3,  title: 'Apprentice Potter' },
  { min: 5,  title: 'Craft Artisan'     },
  { min: 8,  title: 'Skilled Potter'    },
  { min: 12, title: 'Studio Craftsman'  },
  { min: 15, title: 'Master Potter'     },
  { min: 18, title: 'Studio Legend'     },
];

function getTitleForBadges(earned: number) {
  let current = TITLES[0];
  for (const t of TITLES) {
    if (earned >= t.min) current = t;
  }
  return current;
}

function getNextTitle(earned: number) {
  for (const t of TITLES) {
    if (earned < t.min) return t;
  }
  return null; // already max
}

export function useProfileLevel() {
  const pieces = useAppStore((s) => s.pieces);
  const firings = useAppStore((s) => s.firings);

  return useMemo(() => {
    const ctx: BadgeContext = {
      totalPieces:     pieces.length,
      finishedPieces:  pieces.filter((p) => p.stage === 'finished').length,
      glazedPieces:    pieces.filter((p) => ['glazing', 'glaze-fired'].includes(p.stage)).length,
      bisqueFirings:   firings.filter((f) => f.type === 'bisque').length,
      glazeFirings:    firings.filter((f) => f.type === 'glaze').length,
      totalFirings:    firings.length,
      piecesWithNotes: pieces.filter((p) => p.notes && p.notes.trim().length > 0).length,
      failedPieces:    pieces.filter((p) => p.stage === 'cemetery' || ['cracked', 'warped'].includes(p.status ?? '')).length,
      giftedPieces:    pieces.filter((p) => p.status === 'gifted').length,
      wheelPieces:     pieces.filter((p) => p.formingMethod === 'wheel-thrown' || p.formingMethod === 'thrown-and-altered').length,
      handBuiltPieces: pieces.filter((p) => ['coiled', 'pinched', 'slab-built'].includes(p.formingMethod ?? '')).length,
      piecesWithPhoto: pieces.filter((p) => !!(p.photo || p.imgUrl)).length,
      soldPieces:      pieces.filter((p) => p.status === 'sold').length,
    };

    const totalBadges = BADGE_REGISTRY.length;
    const earnedCount = BADGE_REGISTRY.filter((b) => b.current(ctx) >= b.target).length;
    const progress = totalBadges > 0 ? earnedCount / totalBadges : 0;

    const currentTitle = getTitleForBadges(earnedCount);
    const nextTitle = getNextTitle(earnedCount);

    return {
      earnedCount,
      totalBadges,
      progress,           // 0–1, for the SVG ring
      title: currentTitle.title,
      nextTitle: nextTitle?.title ?? null,
      badgesUntilNext: nextTitle ? nextTitle.min - earnedCount : 0,
    };
  }, [pieces, firings]);
}
