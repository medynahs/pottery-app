// API / backend integration helpers

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

export async function fetchSomething() {
  const endpoint = API_BASE_URL ? `${API_BASE_URL}/something` : '/something';
  const res = await fetch(endpoint);
  return res.json();
}
