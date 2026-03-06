// API / backend integration helpers

import { API_BASE_URL } from '../core/config';

export async function fetchSomething() {
  const res = await fetch(`${API_BASE_URL}/something`);
  return res.json();
}
