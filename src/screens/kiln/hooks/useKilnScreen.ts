// src/screens/kiln/hooks/useKilnScreen.ts
import { useAppStore } from '@/src/store';
import React from 'react';
import type { Firing, Kiln } from '../types';

export function useKilnScreen() {
  const kilns = useAppStore((s) => s.kilns);
  const firings = useAppStore((s) => s.firings);
  const pieces = useAppStore((s) => s.pieces);
  const kilnChecklist = useAppStore((s) => s.kilnChecklist);

  const addKiln = useAppStore((s) => s.addKiln);
  const updateKiln = useAppStore((s) => s.updateKiln);
  const deleteKiln = useAppStore((s) => s.deleteKiln);
  const addFiring = useAppStore((s) => s.addFiring);
  const toggleKilnChecklistItem = useAppStore((s) => s.toggleKilnChecklistItem);
  const addKilnChecklistItem = useAppStore((s) => s.addKilnChecklistItem);
  const removeKilnChecklistItem = useAppStore((s) => s.removeKilnChecklistItem);

  // ── Modal state ────────────────────────────────────────────────
  const [addKilnOpen, setAddKilnOpen] = React.useState(false);
  const [editKiln, setEditKiln] = React.useState<Kiln | undefined>(undefined);
  const [startFiringOpen, setStartFiringOpen] = React.useState(false);
  const [startFiringDefaultKilnId, setStartFiringDefaultKilnId] = React.useState<string | undefined>(undefined);
  const [detailFiring, setDetailFiring] = React.useState<Firing | null>(null);

  // ── Derived data ───────────────────────────────────────────────

  /** Firings currently in an active state (loading → unloading) */
  const activeFirings = React.useMemo(
    () => firings.filter((f) => ['loading', 'firing', 'cooling', 'unloading'].includes(f.state)),
    [firings]
  );

  /** Scheduled but not yet started */
  const scheduledFirings = React.useMemo(
    () => firings.filter((f) => f.state === 'scheduled'),
    [firings]
  );

  /** Completed firings, newest first */
  const completedFirings = React.useMemo(
    () =>
      firings
        .filter((f) => f.state === 'completed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [firings]
  );

  /** IDs already assigned to any active or scheduled firing */
  const assignedPieceIds = React.useMemo(() => {
    const ids = new Set<number>();
    [...activeFirings, ...scheduledFirings].forEach((f) => f.pieceIds.forEach((id) => ids.add(id)));
    return ids;
  }, [activeFirings, scheduledFirings]);

  /** Pieces waiting for bisque fire (bone-dry, not yet assigned) */
  const waitingForBisque = React.useMemo(
    () => pieces.filter((p) => p.stage === 'bone-dry' && !assignedPieceIds.has(p.id)),
    [pieces, assignedPieceIds]
  );

  /** Pieces waiting for glaze fire (glazing stage, not yet assigned) */
  const waitingForGlaze = React.useMemo(
    () => pieces.filter((p) => p.stage === 'glazing' && !assignedPieceIds.has(p.id)),
    [pieces, assignedPieceIds]
  );

  /** Pieces assigned to the next scheduled/active firing */
  const assignedPieces = React.useMemo(
    () => pieces.filter((p) => assignedPieceIds.has(p.id)),
    [pieces, assignedPieceIds]
  );

  /** Total firings per kiln */
  const kilnFiringCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    firings.forEach((f) => {
      counts[f.kilnId] = (counts[f.kilnId] ?? 0) + 1;
    });
    return counts;
  }, [firings]);

  // ── Actions ────────────────────────────────────────────────────
  const handleSaveKiln = (kiln: Kiln) => {
    if (editKiln) {
      updateKiln(kiln);
    } else {
      addKiln(kiln);
    }
    setEditKiln(undefined);
    setAddKilnOpen(false);
  };

  const handleStartFiringFromKiln = (kilnId: string) => {
    setStartFiringDefaultKilnId(kilnId);
    setStartFiringOpen(true);
  };

  const handleDeleteKiln = (kiln: Kiln) => {
    deleteKiln(kiln.id);
  };

  return {
    // data
    kilns,
    firings,
    kilnChecklist,
    activeFirings,
    scheduledFirings,
    completedFirings,
    waitingForBisque,
    waitingForGlaze,
    assignedPieces,
    kilnFiringCounts,
    // modal state
    addKilnOpen, setAddKilnOpen,
    editKiln, setEditKiln,
    startFiringOpen, setStartFiringOpen,
    startFiringDefaultKilnId,
    detailFiring, setDetailFiring,
    // actions
    handleSaveKiln,
    handleStartFiringFromKiln,
    handleDeleteKiln,
    addFiring,
    toggleKilnChecklistItem,
    addKilnChecklistItem,
    removeKilnChecklistItem,
  };
}
