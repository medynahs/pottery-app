/**
 * The one vocabulary for local<>cloud record state, shared by every synced
 * domain (pieces, glazes, glaze tests, firings, kilns). Full contract:
 * pottery-api/notes/sync-contract.md.
 *
 *   local-only  — exists on this device, the cloud has never acked it
 *   synced      — device and cloud agree
 *   ahead       — local edits not yet pushed (cloud is stale)
 *   tombstoned  — deleted locally, the delete is not yet acked
 *   recoverable — deleted and the cloud agrees; the record stays in its
 *                 collection with its full doc (hidden by the visible
 *                 selectors) until the future recover screen or the server
 *                 grace-period purge
 */

export type SyncableRecord = {
  /** UUID issued by the backend after the record is first synced. */
  backendId?: string;
  /** Local edits not yet pushed. */
  syncDirty?: boolean;
  /** Deleted; hidden from view screens, kept for recovery. */
  deleted?: boolean;
};

export type RecordSyncState =
  | 'local-only'
  | 'synced'
  | 'ahead'
  | 'tombstoned'
  | 'recoverable';

export function recordSyncState(record: SyncableRecord): RecordSyncState {
  if (record.deleted) {
    return record.syncDirty || !record.backendId ? 'tombstoned' : 'recoverable';
  }
  if (!record.backendId) return 'local-only';
  if (record.syncDirty) return 'ahead';
  return 'synced';
}

export function needsPush(record: SyncableRecord): boolean {
  const state = recordSyncState(record);
  return state !== 'synced' && state !== 'recoverable';
}

export function pendingRecords<T extends SyncableRecord>(records: T[]): T[] {
  return records.filter(needsPush);
}
