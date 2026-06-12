/** First 1–2 initials from a display name (e.g. "Jane Doe" → "JD"). */
export function getInitials(name: string, maxParts = 2): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, maxParts)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}
