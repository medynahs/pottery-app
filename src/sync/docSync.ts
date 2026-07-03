/**
 * Shared push/pull machinery for synced record collections. Semantics are the
 * ones pieces shipped with (the reference implementation):
 *
 * Push: one batched, debounced flush per domain sends full snapshots of every
 * record that needsPush (dirty, tombstoned or never-linked), keyed on
 * client_ref (= the local id). The response maps client_ref → backend UUID;
 * dirty flags clear only if the store object is still the exact one
 * snapshotted (no edit landed mid-flight). Acked tombstones stay in the
 * collection as `recoverable` records.
 *
 * Pull merge: whole-record last-write-wins with local-dirty-wins. Backend
 * is_deleted rows materialize as recoverable tombstones (full doc, hidden by
 * the visible selectors) so deletes propagate across devices and the future
 * recover screen has real data to list.
 */

import type { AppState } from '../store/appStore';
import { useAppStore } from '../store/appStore';
import { needsPush, pendingRecords, type SyncableRecord } from './syncState';

type DomainRecord = SyncableRecord & { id: string | number };

export type BackendSyncRow = {
  id: string;
  client_ref?: string | null;
  is_deleted?: boolean;
};

// ─── Global "is anything syncing" flag ────────────────────────────────────────

let syncDepth = 0;

export function beginSyncing(): void {
  syncDepth += 1;
  useAppStore.getState().setIsSyncing(true);
}

export function endSyncing(): void {
  syncDepth = Math.max(0, syncDepth - 1);
  if (syncDepth === 0) useAppStore.getState().setIsSyncing(false);
}

// ─── Ack apply ────────────────────────────────────────────────────────────────

/**
 * Fold a sync response into the collection: stamp backend ids and clear the
 * dirty flag on records whose store object is still the exact one that was
 * pushed. Acked tombstones thereby become `recoverable` and stay put.
 */
export function applySyncAck<T extends DomainRecord>(
  records: T[],
  refMap: Record<string, string>,
  pushed: Map<T['id'], T>,
): T[] {
  return records.map((record) => {
    const backendId = refMap[String(record.id)] ?? record.backendId;
    const clearDirty = record.syncDirty === true && pushed.get(record.id) === record;
    if (backendId === record.backendId && !clearDirty) return record;
    return { ...record, backendId, ...(clearDirty ? { syncDirty: false } : {}) };
  });
}

// ─── Pull merge ───────────────────────────────────────────────────────────────

/**
 * Merge backend rows into the local collection. `fromBackend` materializes a
 * local record from a row (given the current local copy, if any); returning
 * null skips the row (empty/legacy doc — the owning device's next push
 * refills it).
 */
export function mergeBackendRows<L extends DomainRecord, B extends BackendSyncRow>(
  backend: B[],
  local: L[],
  fromBackend: (row: B, existing?: L) => L | null,
): L[] {
  const byClientRef = new Map(local.map((record) => [String(record.id), record]));
  const byBackendId = new Map(
    local.filter((record) => record.backendId).map((record) => [record.backendId!, record]),
  );

  const replaced = new Map<L['id'], L>();
  const added: L[] = [];

  for (const row of backend) {
    const existing =
      (row.client_ref ? byClientRef.get(row.client_ref) : undefined) ??
      byBackendId.get(row.id);

    // Local edits and pending deletes win whole-record; their push overwrites the row.
    if (existing && (existing.syncDirty || existing.deleted)) {
      if (!existing.backendId) {
        replaced.set(existing.id, { ...existing, backendId: row.id });
      }
      continue;
    }

    const merged = fromBackend(row, existing);
    if (row.is_deleted) {
      // A deleted row is just another record with the flag on: materialized
      // (or updated) with its full doc so the recover screen can show it.
      const tombstone = merged
        ? { ...merged, deleted: true, syncDirty: false }
        : existing
          ? { ...existing, backendId: row.id, deleted: true, syncDirty: false }
          : null;
      if (!tombstone) continue;
      if (existing) replaced.set(existing.id, tombstone);
      else added.push(tombstone);
      continue;
    }

    if (!merged) continue;
    if (existing) replaced.set(existing.id, merged);
    else added.push(merged);
  }

  return [...added, ...local.map((record) => replaced.get(record.id) ?? record)];
}

// ─── Domain factory ───────────────────────────────────────────────────────────

export type DocSyncDomain = {
  hasPending(): boolean;
  /** Push everything pending now. Resolves true when nothing is left to push. */
  flush(): Promise<boolean>;
  /** Debounced flush, call after any local mutation. */
  schedule(): void;
};

const SYNC_DEBOUNCE_MS = 800;
const MAX_SYNC_BATCH = 500;

export function createDocSyncDomain<L extends DomainRecord, S>(cfg: {
  label: string;
  errorToast: string;
  select(state: AppState): L[];
  write(records: L[]): void;
  toSnapshot(record: L): S;
  push(snapshots: S[]): Promise<Record<string, string>>;
  onPushed?(): void;
}): DocSyncDomain {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;

  async function flush(): Promise<boolean> {
    if (inFlight) return false;

    const state = useAppStore.getState();
    if (!state.isSignedIn) return false;

    const toSync = pendingRecords(cfg.select(state)).slice(0, MAX_SYNC_BATCH);
    if (toSync.length === 0) return true;

    inFlight = true;
    beginSyncing();
    try {
      if (__DEV__) console.log(`[${cfg.label}:sync] pushing ${toSync.length} snapshot(s)`);
      const refMap = await cfg.push(toSync.map(cfg.toSnapshot));

      const pushed = new Map(toSync.map((record) => [record.id, record]));
      cfg.write(applySyncAck(cfg.select(useAppStore.getState()), refMap, pushed));

      useAppStore.getState().setLastSyncedAt(new Date().toISOString());
      cfg.onPushed?.();
      return true;
    } catch (err) {
      if (__DEV__) console.warn(`[${cfg.label}:sync] push failed:`, err);
      useAppStore.getState().showToast(cfg.errorToast, 'error');
      return false;
    } finally {
      inFlight = false;
      endSyncing();
    }
  }

  function schedule(): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void flush();
    }, SYNC_DEBOUNCE_MS);
  }

  function hasPending(): boolean {
    return cfg.select(useAppStore.getState()).some(needsPush);
  }

  return { hasPending, flush, schedule };
}
