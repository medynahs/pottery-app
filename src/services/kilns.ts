// Kilns API, /users/me/kilns
// All endpoints require a SuperTokens session (auth header injected by the RN SDK).

import type { Kiln, KilnPricingModel, KilnType } from '../types/kiln';
import { API_BASE_URL } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface BackendKiln {
  id: string;
  name: string;
  type: KilnType;
  coneRange: string;
  shelves: number;
  size: string;
  location: string;
  notes: string;
  imageUri?: string | null;
  queueDelayDays?: number | null;
  cycleDurationDays?: number | null;
  pickupDelayDays?: number | null;
  runsEveryDays?: number | null;
  studioDelayDays?: number | null;
  pricingModel?: KilnPricingModel | null;
  pricingBaseRate?: number | null;
  maxTempC?: number | null;
  createdAt: string;
}

// ─── Request payload ──────────────────────────────────────────────────────────

export interface UpsertKilnPayload {
  /** Present when updating an existing backend record. */
  id?: string;
  name: string;
  type: string;
  coneRange: string;
  shelves: number;
  size: string;
  location: string;
  notes: string;
  imageUri?: string;
  queueDelayDays?: number;
  cycleDurationDays?: number;
  pickupDelayDays?: number;
  runsEveryDays?: number;
  pricingModel?: string;
  pricingBaseRate?: number;
  maxTempC?: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function localKilnToUpsertPayload(kiln: Kiln): UpsertKilnPayload {
  const payload: UpsertKilnPayload = {
    name: kiln.name,
    type: kiln.type,
    coneRange: kiln.coneRange,
    shelves: kiln.shelves,
    size: kiln.size,
    location: kiln.location,
    notes: kiln.notes,
  };

  if (kiln.backendId) payload.id = kiln.backendId;
  if (kiln.imageUri) payload.imageUri = kiln.imageUri;
  if (kiln.queueDelayDays != null) payload.queueDelayDays = kiln.queueDelayDays;
  if (kiln.cycleDurationDays != null) payload.cycleDurationDays = kiln.cycleDurationDays;
  if (kiln.pickupDelayDays != null) payload.pickupDelayDays = kiln.pickupDelayDays;
  if (kiln.runsEveryDays != null) payload.runsEveryDays = kiln.runsEveryDays;
  if (kiln.pricingModel) payload.pricingModel = kiln.pricingModel;
  if (kiln.pricingBaseRate != null) payload.pricingBaseRate = kiln.pricingBaseRate;
  if (kiln.maxTempC != null) payload.maxTempC = kiln.maxTempC;

  return payload;
}

export function backendKilnToLocal(b: BackendKiln, existing?: Kiln): Kiln {
  const base: Kiln = existing ?? {
    id: b.id,
    name: b.name ?? 'Unnamed kiln',
    type: b.type ?? 'electric',
    coneRange: b.coneRange ?? '',
    shelves: b.shelves ?? 0,
    size: b.size ?? '',
    location: b.location ?? '',
    notes: b.notes ?? '',
    createdAt: b.createdAt,
  };

  return {
    ...base,
    backendId: b.id,
    name: b.name ?? base.name ?? 'Unnamed kiln',
    type: b.type ?? base.type ?? 'electric',
    coneRange: b.coneRange ?? base.coneRange ?? '',
    shelves: b.shelves ?? base.shelves ?? 0,
    size: b.size ?? base.size ?? '',
    location: b.location ?? base.location ?? '',
    notes: b.notes ?? base.notes ?? '',
    imageUri: b.imageUri ?? base.imageUri,
    queueDelayDays: b.queueDelayDays ?? base.queueDelayDays,
    cycleDurationDays: b.cycleDurationDays ?? base.cycleDurationDays,
    pickupDelayDays: b.pickupDelayDays ?? base.pickupDelayDays,
    runsEveryDays: b.runsEveryDays ?? base.runsEveryDays,
    pricingModel: b.pricingModel ?? base.pricingModel,
    pricingBaseRate: b.pricingBaseRate ?? base.pricingBaseRate,
    maxTempC: b.maxTempC ?? base.maxTempC,
  };
}

// ─── API functions ────────────────────────────────────────────────────────────



export async function apiListKilns(): Promise<BackendKiln[]> {
  const response = await fetch(`${API_BASE_URL}/users/me/kilns`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`GET /users/me/kilns → ${response.status}`);
  return response.json() as Promise<BackendKiln[]>;
}

export async function apiUpsertKiln(
  payload: UpsertKilnPayload,
): Promise<BackendKiln> {
  const response = await fetch(`${API_BASE_URL}/users/me/kilns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`POST /users/me/kilns → ${response.status}`);
  return response.json() as Promise<BackendKiln>;
}

export async function apiDeleteKiln(
  backendId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/users/me/kilns/${encodeURIComponent(backendId)}`,
    { method: 'DELETE' },
  );
  if (!response.ok) throw new Error(`DELETE /users/me/kilns/${backendId} → ${response.status}`);
}
