// Events API, /api/events
// Public endpoint, no authentication required.

import { API_BASE_URL } from './index';

// ─── Backend type ─────────────────────────────────────────────────────────────

export interface BackendEvent {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

// ─── API function ─────────────────────────────────────────────────────────────

export async function apiListEvents(): Promise<BackendEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/events`);
  if (!response.ok) throw new Error(`GET /api/events → ${response.status}`);
  return response.json() as Promise<BackendEvent[]>;
}
